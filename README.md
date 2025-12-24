<div align="center">
  <img src="./src-tauri/icons/128x128@2x.png" alt="Zoyla - HTTP Load-testing logo" width="128" height="128"/>
  <h1 align="center">Zoyla</h1>
  <p align="center">
  ⚡️ Fast, lightweight HTTP load testing desktop application for quick, reliable performance insights.
  </p>
</div>

---

Zoyla is a desktop application that provides a simple, intuitive interface for running HTTP load tests without the complexity of enterprise testing suites.

https://github.com/user-attachments/assets/ffd261c4-c7ff-49c9-8b54-685441f85244

## Target Users

Engineers who need quick, lightweight HTTP load testing:

- Backend developers testing API endpoints during development
- API owners validating endpoint performance and capacity
- SREs monitoring system behavior under load
- QA engineers performing quick performance validation
- Performance testers running rapid load tests without heavy tooling

## Why Zoyla?

Zoyla fills the gap between basic `curl` tests and full performance suites like JMeter or Gatling. It's ideal when you want:

- ⚡ Fast to run with minimal setup
- 🎯 Intuitive GUI without complex configuration files
- 🪶 Lightweight desktop app with efficient Rust backend
- 📊 Accurate performance measurements

## Common Questions Zoyla Answers

- How many requests per second can this endpoint handle?
- What happens when concurrency spikes?
- Does response time change after a code change?
- How does the system behave under sustained load?
- What's the latency distribution under load?
- How do different HTTP methods perform?

## Features

- Live updates during test execution
- RPS, latency percentiles, throughput, error rates
- Charts for throughput, latency, histograms, and correlations
- Save and replay previous test configurations
- HTTP/2 support, rate limiting, proxy configuration, header customization
- JSON and CSV export for further analysis

## Installation

Download the latest release for your platform from the [Releases page](https://github.com/behnamazimi/zoyla/releases) and install the desktop application.

### macOS

**Using Homebrew (recommended):**

```bash
brew install behnamazimi/zoyla/zoyla
```

**Manual download:**

Download from the [Releases page](https://github.com/behnamazimi/zoyla/releases). After downloading, you may see **"zoyla is damaged and can't be opened"** error.

This happens because the app isn't signed with an Apple Developer certificate. To fix this, open Terminal and run:

```bash
xattr -cr /Applications/zoyla.app
```

Or if you downloaded the `.dmg` file:

```bash
xattr -cr ~/Downloads/zoyla-*.dmg
```

Then open the app normally.

### Windows

The Windows installer is not code-signed, so you may see security warnings during installation.

**Windows Defender SmartScreen:**

When you run the installer, you may see "Windows protected your PC" message. To proceed:

1. Click **"More info"**
2. Click **"Run anyway"**

**Browser download warning:**

Your browser may also warn that the file could be dangerous. Click "Keep" or "Keep anyway" to download the file.

### Linux (Debian/Ubuntu)

Download the appropriate `.deb` file based on your system architecture:

- **ARM64** (e.g., Raspberry Pi, Apple Silicon VMs): `zoyla-*-linux-arm64.deb`
- **x64** (Intel/AMD): `zoyla-*-linux-x64.deb`

**Install using apt (recommended):**

```bash
sudo apt install ./zoyla-*-linux-*.deb
```

**Or using dpkg:**

```bash
sudo dpkg -i zoyla-*-linux-*.deb
# If there are missing dependencies:
sudo apt-get install -f
```

After installation, run `zoyla` from the terminal or find it in your applications menu.

### From Source

**Prerequisites:**

- [Node.js](https://nodejs.org/) (v18 or later)
- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- [Tauri prerequisites](https://tauri.app/start/prerequisites)

**Build:**

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

## Quick Start

1. **Configure your test** - Enter the target URL, set requests and concurrency, configure HTTP method and headers
2. **Run the test** - Click "Run Test" or press `Cmd/Ctrl + Enter` to start
3. **Analyze results** - View real-time metrics, charts, and export results for further analysis

## Development

### Tech Stack

- **Frontend:** React + TypeScript + Vite + Zustand + vanilla-extract
- **Backend:** Rust (Tauri v2)
- **Charts:** Recharts
- **UI Components:** Radix UI

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run check-types  # Type check
npm run format       # Format code
npm run lint         # Lint and fix
npm run tauri dev    # Run Tauri in dev mode
npm run tauri build  # Build Tauri app
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Links

- **Repository:** [https://github.com/behnamazimi/zoyla](https://github.com/behnamazimi/zoyla)
- **Issues:** [https://github.com/behnamazimi/zoyla/issues](https://github.com/behnamazimi/zoyla/issues)

---

Made with ❤️ by [Behnam Azimi](https://github.com/behnamazimi)
