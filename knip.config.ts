import type { KnipConfig } from "knip";

const config: KnipConfig = {
  entry: ["src/main.tsx", "vite.config.ts"],
  project: ["src/**/*.{ts,tsx}"],
  ignore: [
    "src-tauri/**",
    "dist/**",
    "node_modules/**",
    // Ignore index files that re-export (common pattern)
    "**/index.ts",
    // Ignore CSS style exports (false positives - used via import * as styles)
    "**/*.css.ts",
  ],
  ignoreDependencies: [
    // Tauri plugins are used via Tauri API but not directly imported
    "@tauri-apps/plugin-opener",
  ],
  ignoreExportsUsedInFile: true,
  vite: {
    config: "vite.config.ts",
  },
};

export default config;

