# Zoyla - Agent Context Guide

## Project Overview

**Zoyla** is a cross-platform desktop load testing application built with:

- **Frontend**: React + TypeScript + Vite + Zustand + vanilla-extract
- **Backend**: Rust (via Tauri v2)

### Core Features

- **Load Testing**: Configurable HTTP load tests with real-time progress
- **Results Visualization**: Charts, histograms, percentiles, error logs
- **Test History**: Persistent storage of previous test runs
- **Export**: JSON and CSV export of test results
- **Advanced Options**: HTTP/2, rate limiting, proxy support, header randomization
- **Keyboard Shortcuts**: Full keyboard navigation support
- **Theme Support**: Dark/light theme with persistence

---

## Architecture

### Directory Structure

```
src/
├── styles/              # Global styles & theme tokens
│   ├── global.css.ts    # Global reset & base styles
│   ├── theme.css.ts     # Theme tokens (colors, spacing, etc.)
│   └── index.ts
├── components/          # Presentational (dumb) components - NO store imports
│   ├── buttons/         # Button, IconButton, CopyButton, Tooltip
│   ├── charts/          # Chart components (Area, Bar, Line, Scatter, ChartTooltip)
│   ├── feedback/        # ErrorMessage, ProgressBar, StatCard, StatusBadge
│   ├── forms/           # NumberInput, Select, TextInput, ToggleGroup
│   └── layout/          # Panel, ResizeHandle
├── features/            # Container (smart) components - connect to stores
│   ├── history/         # HistoryPanel, HistoryEntry
│   ├── results/         # ResultsContainer, SummaryPanel, ChartsGrid, StatusCodesPanel, ErrorLogsPanel
│   ├── settings/        # LayoutSettings
│   ├── shortcuts/       # KeyboardGuide
│   ├── test-config/     # TestConfigPanel, HeadersEditor
│   └── test-runner/     # RunButton, ProgressView
├── layouts/             # Page-level layout components
│   ├── AppShell.tsx     # Root layout wrapper
│   ├── Toolbar.tsx      # Top toolbar with history/settings buttons
│   ├── Sidebar.tsx      # Left sidebar (config + run button)
│   └── MainContent.tsx  # Right main area (progress/results)
├── store/               # Independent Zustand stores
│   ├── testConfigStore.ts    # Test configuration state
│   ├── testRunnerStore.ts    # Test execution state
│   ├── historyStore.ts       # Test history state
│   └── uiStore.ts            # UI preferences state
├── services/            # Pure async functions (no state)
│   ├── clipboard/       # Image clipboard operations
│   ├── export/          # CSV and JSON export
│   ├── storage/         # Persistent storage (history, settings, theme)
│   └── tauri/           # Tauri API calls (loadTest, events)
├── hooks/               # Custom React hooks
│   ├── useTestRunner.ts      # Orchestrates test execution (ONLY cross-store hook)
│   ├── useKeyboardShortcuts.ts # Global keyboard shortcuts
│   ├── usePersistence.ts      # Loads persisted data on mount
│   └── useResizable.ts        # Sidebar resize functionality
├── types/               # TypeScript type definitions
│   ├── api.ts           # Types matching Rust structs (TestConfig, LoadTestStats, etc.)
│   ├── store.ts         # Store state and action types
│   └── components.ts    # Component prop types
├── utils/               # Pure utility functions
│   ├── format.ts        # Number/date formatting
│   └── transform.ts     # Data transformations for charts
├── constants/           # Default values and limits
│   └── defaults.ts      # DEFAULT_TEST_CONFIG, MAX_REQUESTS, etc.
├── App.tsx              # Root component
└── main.tsx             # React entry point

src-tauri/
├── src/
│   ├── lib.rs           # Core Rust logic: load test execution, stats calculation
│   └── main.rs          # Tauri entry point
├── Cargo.toml           # Rust dependencies
└── tauri.conf.json      # Tauri configuration
```

### Key Architectural Rules

1. **Stores are INDEPENDENT** - Never import each other directly
2. **Cross-store coordination** happens ONLY in `hooks/useTestRunner.ts`
3. **Presentational components** (`components/`) have NO store imports
4. **Container components** (`features/`) connect to stores and pass props down
5. **Services are pure functions** - No state, just async operations
6. **Type safety** - `types/api.ts` mirrors Rust structs exactly

---

## Key Technologies

### Frontend Stack

| Package               | Purpose                                                    |
| --------------------- | ---------------------------------------------------------- |
| `react` + `react-dom` | UI framework                                               |
| `zustand`             | State management (lightweight, no providers)               |
| `vanilla-extract`     | CSS-in-TypeScript (zero-runtime, type-safe)                |
| `@tauri-apps/api`     | Tauri bridge for Rust communication                        |
| `recharts`            | Chart library for data visualization                       |
| `lucide-react`        | Icon library                                               |
| `@radix-ui/*`         | Accessible UI primitives (Popover, Dropdown, Select, etc.) |
| `html-to-image`       | Screenshot generation for export                           |

### Backend Stack (Rust)

| Crate                  | Purpose                                             |
| ---------------------- | --------------------------------------------------- |
| `tauri`                | Desktop app framework                               |
| `reqwest`              | Async HTTP client (with http2, rustls-tls features) |
| `tokio`                | Async runtime (multi-thread, sync, time, macros)    |
| `serde` + `serde_json` | JSON serialization                                  |
| `once_cell`            | Global static initialization (CANCEL_FLAG)          |
| `thiserror`            | Error type definitions                              |
| `rand`                 | Randomization for headers/user agents               |
| `futures`              | Future utilities                                    |

### Tauri Plugins

- `tauri-plugin-opener` - Open URLs in browser
- `tauri-plugin-clipboard-manager` - Clipboard operations
- `tauri-plugin-store` - Persistent key-value storage
- `tauri-plugin-dialog` - File dialogs
- `tauri-plugin-fs` - File system operations

---

## Data Flow

### Test Execution Flow

```
User clicks "Run Test" (Cmd/Ctrl+Enter)
        ↓
useTestRunner.runTest() (hooks/useTestRunner.ts)
  - Validates URL from testConfigStore
  - Clears previous results
  - Sets isRunning=true in testRunnerStore
        ↓
services/tauri/loadTest.ts → invoke("run_load_test", config)
        ↓
Rust backend (lib.rs::run_load_test)
  - Validates config
  - Builds reqwest client (HTTP/1.1 or HTTP/2)
  - Creates semaphore for concurrency control
  - Spawns concurrent request futures
  - Emits "load-test-progress" events (throttled to ~20Hz)
        ↓
Frontend receives progress via events (services/tauri/events.ts)
  - Updates testRunnerStore.progress
        ↓
Rust completes all requests
  - Calculates stats (percentiles, histogram, throughput, etc.)
  - Returns LoadTestStats
        ↓
useTestRunner receives stats
  - Sets stats in testRunnerStore
  - Adds entry to historyStore (with persistence)
  - Auto-shows error logs if failures exist
```

### History Flow

```
Test completes
        ↓
historyStore.addEntry(stats, config)
  - Creates HistoryEntry with unique ID
  - Prepends to entries array (max 50)
  - Persists to Tauri store (fire-and-forget)
        ↓
User clicks history entry
        ↓
historyStore.selectEntry(id)
  - Updates selectedId
  - testConfigStore.setFromHistoryEntry()
  - testRunnerStore.setStats() + setTestStartTime()
```

---

## Stores

### testConfigStore

**Purpose**: Manages test configuration state

**State**:

- `url`, `method`, `numRequests`, `concurrency`, `useHttp2`
- `headers` (array of `{id, key, value}`)
- `followRedirects`, `timeoutSecs`, `rateLimit`
- `randomizeUserAgent`, `randomizeHeaders`, `addCacheBuster`
- `disableKeepAlive`, `workerThreads`, `proxyUrl`

**Key Actions**:

- `getConfig()` - Converts state to `TestConfig` (snake_case for Rust)
- `setFromHistoryEntry()` - Loads config from history
- `resetToDefaults()` - Restores defaults

### testRunnerStore

**Purpose**: Manages test execution state

**State**:

- `isRunning` - Whether test is currently running
- `progress` - Real-time `ProgressUpdate` (null when not running)
- `stats` - Final `LoadTestStats` (null until test completes)
- `error` - Error message string (null if no error)
- `testStartTime` - `Date` when test started (for display)

**Key Actions**:

- `setRunning()` - Updates running state (auto-sets testStartTime)
- `setProgress()` - Updates real-time progress
- `setStats()` - Stores final results
- `clearResults()` - Resets all result state

### historyStore

**Purpose**: Manages test history with persistence

**State**:

- `entries` - Array of `HistoryEntry` (max 50, sorted newest first)
- `selectedId` - Currently selected entry ID (null if none)

**Key Actions**:

- `addEntry()` - Adds new entry, persists to storage
- `deleteEntry()` - Removes entry, updates storage
- `clearAll()` - Clears all entries
- `selectEntry()` - Sets selected entry
- `loadFromStorage()` - Loads persisted history on app start

### uiStore

**Purpose**: Manages UI preferences and panel visibility

**State**:

- `sidebarWidth` - Current sidebar width in pixels (280-500)
- `showHistory` - History panel visibility
- `showLayoutSettings` - Layout settings panel visibility
- `showHeaders` - Headers editor visibility
- `showErrorLogs` - Error logs panel visibility
- `showKeyboardGuide` - Keyboard shortcuts guide visibility
- `layoutSettings` - Chart visibility toggles
- `theme` - 'dark' | 'light' (persisted)

**Key Actions**:

- `updateLayoutSettings()` - Updates chart visibility, persists
- `setTheme()` - Updates theme, applies to DOM, persists
- `loadFromStorage()` - Loads persisted settings on app start

---

## Features

### Test Configuration (`features/test-config/`)

- **TestConfigPanel**: Main config form with all options
- **HeadersEditor**: Dynamic header key-value editor
- Config options: URL, method, requests, concurrency, HTTP/2, redirects, timeout, rate limit, randomization, proxy, worker threads

### Test Runner (`features/test-runner/`)

- **RunButton**: Start/stop test button with loading state
- **ProgressView**: Real-time progress display (RPS, completed, elapsed time)

### Results (`features/results/`)

- **ResultsContainer**: Orchestrates all result panels
- **SummaryPanel**: Key metrics (RPS, avg/min/max latency, success rate)
- **StatusCodesPanel**: Status code distribution
- **ChartsGrid**: Multiple charts (throughput, latency, histogram, percentiles, correlation, concurrency)
- **ErrorLogsPanel**: Failed request details with error classification

### History (`features/history/`)

- **HistoryPanel**: Popover with test history list
- **HistoryEntry**: Individual history item with quick stats
- Click to load previous test config and results

### Settings (`features/settings/`)

- **LayoutSettings**: Toggle chart visibility

### Shortcuts (`features/shortcuts/`)

- **KeyboardGuide**: Modal showing all keyboard shortcuts

---

## Services

### Tauri Services (`services/tauri/`)

- **loadTest.ts**: `runLoadTest()`, `cancelLoadTest()`, `getCpuCount()`
- **events.ts**: `setupEventListeners()` - Progress and cancellation events

### Storage Services (`services/storage/`)

- **history.ts**: `loadHistory()`, `saveHistory()` - Uses Tauri store plugin
- **settings.ts**: `loadLayoutSettings()`, `saveLayoutSettings()`, `loadTheme()`, `saveTheme()`

### Export Services (`services/export/`)

- **json.ts**: `exportAsJson()` - Full stats as JSON file
- **csv.ts**: `exportAsCsv()` - Results as CSV with summary header

### Clipboard Services (`services/clipboard/`)

- **image.ts**: Screenshot generation for copy operations

---

## Components

### Component Patterns

**Presentational Components** (`components/`):

- No store imports
- Receive props only
- Reusable, testable
- Examples: `Button`, `StatCard`, `ChartTooltip`

**Container Components** (`features/`):

- Connect to stores via hooks
- Pass data down as props
- Handle user interactions
- Examples: `TestConfigPanel`, `ResultsContainer`

**Layout Components** (`layouts/`):

- Page structure
- May connect to stores for layout state
- Examples: `AppShell`, `Sidebar`, `MainContent`

### Styling Pattern

- Co-located `.css.ts` files with components
- Use `vars` from `styles/theme.css.ts` for tokens
- `style()` for single classes
- `styleVariants()` for variants
- Theme tokens: `vars.color.*`, `vars.space.*`, `vars.font.*`, etc.

---

## Rust Backend

### Core Functions (`src-tauri/src/lib.rs`)

**Main Commands**:

- `run_load_test()` - Entry point, validates config, spawns runtime if needed
- `cancel_load_test()` - Sets global CANCEL_FLAG, emits cancellation event
- `get_available_cpus()` - Returns CPU core count

**Key Implementation Details**:

1. **Concurrency Control**:
   - Uses `tokio::sync::Semaphore` to limit concurrent requests
   - Defaults to `num_requests` if concurrency is 0 or exceeds requests

2. **HTTP Client Configuration**:
   - HTTP/2: `http2_prior_knowledge()` (requires server support)
   - HTTP/1.1: `http1_only()`
   - Connection pooling: Configurable via `disable_keep_alive`
   - Timeout: Configurable (0 = infinite)
   - Proxy: Optional HTTP proxy support

3. **Request Execution**:
   - Each request wrapped in semaphore permit
   - Rate limiting: Optional delay between requests per worker
   - Cancellation: Checked via `tokio::select!` at multiple points
   - Progress throttling: ~20 updates/second (50ms minimum interval)

4. **Randomization**:
   - User-Agent: Pool of 12 realistic browser UAs
   - Headers: Accept-Language, Sec-Fetch-\*, Accept header shuffling
   - Cache buster: Timestamp + random suffix query param

5. **Statistics Calculation**:
   - Single-pass aggregation where possible
   - Percentiles: p10, p25, p50, p75, p90, p95, p99
   - Histogram: 10 buckets
   - Time-series: Throughput, latency, concurrency (sampled for performance)
   - Error classification: Timeout, Connection, Request, Response, Redirect, Other

6. **Error Handling**:
   - `LoadTestError` enum with `thiserror`
   - Error classification for each failed request
   - Descriptive error messages

### Global State

- `CANCEL_FLAG`: `Arc<AtomicBool>` for cancellation
- `LAST_PROGRESS_MS`: `AtomicU64` for progress throttling

---

## Common Tasks

### Adding a New Config Option

1. **Type Definition** (`types/api.ts`):
   - Add field to `TestConfig` interface
   - Add to Rust `LoadTestConfig` struct (snake_case)

2. **Store State** (`store/testConfigStore.ts`):
   - Add to `TestConfigState` interface
   - Add setter action to `TestConfigActions`
   - Add to `getConfig()` conversion
   - Add to `DEFAULT_TEST_CONFIG` in `constants/defaults.ts`

3. **UI Component** (`features/test-config/TestConfigPanel.tsx`):
   - Add form control (input, toggle, select, etc.)
   - Connect to store setter

4. **Rust Handling** (`src-tauri/src/lib.rs`):
   - Use config field in `run_load_test_inner()`
   - Apply to HTTP client or request building

### Adding a New Chart

1. **Chart Component** (`components/charts/`):
   - Create new chart component (e.g., `NewChartPanel.tsx`)
   - Use `recharts` with consistent styling
   - Use `useChartColors()` hook for theme colors

2. **Add to ChartsGrid** (`features/results/ChartsGrid.tsx`):
   - Add chart to grid layout
   - Respect `layoutSettings` toggle

3. **Layout Settings** (`types/store.ts`):
   - Add toggle to `LayoutSettings` interface
   - Add default in `constants/defaults.ts`

4. **Settings UI** (`features/settings/LayoutSettings.tsx`):
   - Add toggle control

### Adding a New Export Format

1. **Export Service** (`services/export/`):
   - Create new file (e.g., `xml.ts`)
   - Implement export function using Tauri dialog + fs plugins

2. **ResultsContainer** (`features/results/ResultsContainer.tsx`):
   - Add export option to dropdown menu

3. **Keyboard Shortcuts** (optional):
   - Add shortcut in `useKeyboardShortcuts.ts`

### Adding Styles

- Co-locate `.css.ts` files with components
- Use `vars` from `styles/theme.css.ts` for tokens
- Use `style()` for single classes, `styleVariants()` for variants
- Follow existing naming conventions

---

## Important Notes

### HTTP/2

- Uses `http2_prior_knowledge()` - requires server to support HTTP/2
- Not automatic negotiation - must explicitly enable

### Concurrency Control

- Uses `tokio::sync::Semaphore` to limit concurrent requests
- Defaults to `num_requests` if concurrency is 0 or exceeds requests
- Each request acquires permit before execution

### Test Cancellation

- Global `CANCEL_FLAG` checked via `tokio::select!` at multiple points
- Cancellation is cooperative - checks happen before/after await points
- Progress updates stop immediately on cancellation

### Progress Throttling

- Progress events throttled to ~20 updates/second (50ms minimum)
- Uses atomic timestamp to prevent race conditions
- Always emits final progress update

### Connection Pooling

- Enabled by default for better performance
- Can be disabled via `disable_keep_alive` option
- Pool size matches concurrency level

### Rate Limiting

- Applied per worker thread
- Interval = 1 / rate_limit seconds
- 0 means no rate limit

### Worker Threads

- 0 means use all available CPU cores
- Custom count spawns dedicated Tokio runtime
- Useful for isolating load test from main app runtime

### Theme System

- Dark theme is default
- Light theme via `data-theme="light"` attribute
- Theme persisted to storage
- All colors use theme tokens from `styles/theme.css.ts`

### CopyButton

- Hides itself before screenshots (for export)
- Uses `html-to-image` for screenshot generation

### History Persistence

- Stored in Tauri plugin-store (`settings.json`)
- Max 50 entries (oldest removed automatically)
- Loaded on app start via `usePersistence` hook

### Keyboard Shortcuts

- All shortcuts use Cmd (Mac) or Ctrl (Windows/Linux)
- See `useKeyboardShortcuts.ts` for full list
- Modifier key detected automatically

---

## Development Workflow

### Running the App

```bash
# Development mode (hot reload)
npm run tauri dev

# Production build
npm run tauri build
```

### Project Structure Conventions

1. **File Naming**:
   - Components: PascalCase (e.g., `TestConfigPanel.tsx`)
   - Services: camelCase (e.g., `loadTest.ts`)
   - Styles: camelCase with `.css.ts` extension (e.g., `test-config.css.ts`)

2. **Import Organization**:
   - External packages first
   - Internal imports grouped by type (components, store, services, etc.)
   - Relative imports use `../` or `../../` (no `@/` aliases)

3. **Type Safety**:
   - All props typed
   - Store state/actions typed in `types/store.ts`
   - API types mirror Rust exactly in `types/api.ts`

4. **Error Handling**:
   - Services return promises (may throw)
   - Store actions are synchronous
   - Errors stored in `testRunnerStore.error`

### Testing Considerations

- Presentational components are easily testable (no store dependencies)
- Services are pure functions (testable in isolation)
- Stores can be tested independently
- Rust backend has unit test support via `#[cfg(test)]`

### Debugging Tips

1. **Rust Backend**:
   - Use `println!` or `eprintln!` for debugging (visible in terminal)
   - Check Tauri console for errors

2. **Frontend**:
   - React DevTools for component inspection
   - Zustand DevTools (if enabled) for store inspection
   - Browser console for JavaScript errors

3. **Performance**:
   - Progress throttling prevents UI lag
   - Chart data is sampled for large result sets
   - History limited to 50 entries

---

## Constants & Defaults

### Test Configuration Defaults

- URL: `https://httpbin.org/get`
- Method: `GET`
- Requests: `100`
- Concurrency: `100`
- HTTP/2: `false`
- Follow Redirects: `true`
- Timeout: `20` seconds (0 = infinite)
- Rate Limit: `0` (no limit)
- Worker Threads: `0` (all cores)

### Limits

- Min Requests: `1`
- Max Requests: `100,000`
- Min Concurrency: `1`
- Max Concurrency: `1,000`
- Max History Entries: `50`
- Sidebar Width: `280-500px` (default: `320px`)

### Layout Defaults

All charts visible by default:

- Throughput Chart
- Latency Chart
- Histogram
- Percentiles
- Correlation Chart
- Error Logs
