/**
 * LayoutSettings - Chart visibility toggles and theme settings
 * Container component connecting to uiStore.
 */

import * as Popover from "@radix-ui/react-popover";
import * as Switch from "@radix-ui/react-switch";
import { Settings, X, Sun, Moon } from "lucide-react";
import { useUIStore } from "../../store";
import * as styles from "./settings.css";
import * as toolbarStyles from "../../layouts/Toolbar.css";

/**
 * Panel for toggling visibility of result charts and theme.
 */
export function LayoutSettings() {
  const {
    showLayoutSettings,
    setShowLayoutSettings,
    layoutSettings,
    updateLayoutSettings,
    theme,
    setTheme,
  } = useUIStore();

  const toggles = [
    { key: "showThroughputChart", label: "Throughput Chart" },
    { key: "showLatencyChart", label: "Latency Chart" },
    { key: "showHistogram", label: "Response Time Histogram" },
    { key: "showPercentiles", label: "Latency Percentiles" },
    { key: "showCorrelationChart", label: "Concurrency Chart" },
    { key: "showErrorLogs", label: "Error Logs" },
  ] as const;

  return (
    <Popover.Root open={showLayoutSettings} onOpenChange={setShowLayoutSettings}>
      <Popover.Trigger asChild>
        <button
          className={`${toolbarStyles.toolbarButton} ${showLayoutSettings ? toolbarStyles.toolbarButtonActive : ""}`}
          aria-label="Layout Settings"
        >
          <Settings size={16} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className={styles.settingsPopoverContent} sideOffset={8} align="end">
          <div className={styles.layoutSettingsHeader}>
            <h3>Settings</h3>
            <Popover.Close asChild>
              <button className={styles.layoutSettingsClose} aria-label="Close settings">
                <X size={14} />
              </button>
            </Popover.Close>
          </div>

          <div className={styles.layoutSettingsContent}>
            {/* Theme Toggle */}
            <div className={styles.themeSection}>
              <div className={styles.themeToggleRow}>
                <div className={styles.themeLabel}>
                  {theme === "dark" ? <Moon size={14} /> : <Sun size={14} />}
                  <span>Theme</span>
                </div>
                <div className={styles.themeSwitch}>
                  <span className={styles.themeSwitchLabel}>Dark</span>
                  <Switch.Root
                    checked={theme === "light"}
                    onCheckedChange={(checked) => setTheme(checked ? "light" : "dark")}
                    className={styles.switchRoot}
                  >
                    <Switch.Thumb className={styles.switchThumb} />
                  </Switch.Root>
                  <span className={styles.themeSwitchLabel}>Light</span>
                </div>
              </div>
            </div>

            <div className={styles.settingsDivider} />

            <p className={styles.layoutSettingsHint}>Choose which panels to show in results</p>
            <div className={styles.layoutToggles}>
              {toggles.map(({ key, label }) => (
                <label key={key} className={styles.layoutToggle}>
                  <input
                    type="checkbox"
                    checked={layoutSettings[key]}
                    onChange={(e) => updateLayoutSettings({ [key]: e.target.checked })}
                  />
                  <span className={styles.layoutToggleLabel}>{label}</span>
                </label>
              ))}
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
