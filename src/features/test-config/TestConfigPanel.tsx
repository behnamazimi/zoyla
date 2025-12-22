/**
 * TestConfigPanel - Test configuration form
 * Container component connecting to stores.
 */

import * as Switch from "@radix-ui/react-switch";
import * as Select from "@radix-ui/react-select";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDown, Check, ChevronRight, Info } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useTestConfigStore, useTestRunnerStore, useHistoryStore } from "../../store";
import { HeadersEditor } from "./HeadersEditor";
import { PayloadEditor } from "./PayloadEditor";
import {
  HTTP_METHODS,
  MIN_REQUESTS,
  MAX_REQUESTS,
  MIN_CONCURRENCY,
  MAX_CONCURRENCY,
} from "../../constants/defaults";
import { getCpuCount } from "../../services/tauri";
import {
  calculateConcurrencyRecommendation,
  getConcurrencyWarnings,
} from "../../utils/concurrency";
import type { HttpMethod } from "../../types/api";
import * as styles from "./test-config.css";

/**
 * Complete test configuration form with all inputs.
 */
export function TestConfigPanel() {
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [cpuCount, setCpuCount] = useState<number>(0);

  // Fetch CPU count on mount
  useEffect(() => {
    getCpuCount()
      .then(setCpuCount)
      .catch(() => setCpuCount(4));
  }, []);

  const {
    url,
    method,
    numRequests,
    concurrency,
    useHttp2,
    followRedirects,
    timeoutSecs,
    rateLimit,
    randomizeUserAgent,
    randomizeHeaders,
    addCacheBuster,
    disableKeepAlive,
    workerThreads,
    proxyUrl,
    setUrl,
    setMethod,
    setNumRequests,
    setConcurrency,
    setUseHttp2,
    setFollowRedirects,
    setTimeoutSecs,
    setRateLimit,
    setRandomizeUserAgent,
    setRandomizeHeaders,
    setAddCacheBuster,
    setDisableKeepAlive,
    setWorkerThreads,
    setProxyUrl,
  } = useTestConfigStore();

  const isRunning = useTestRunnerStore((s) => s.isRunning);

  // Get past success rate from history for recommendation
  const historyEntries = useHistoryStore((s) => s.entries);
  const pastSuccessRate = useMemo(() => {
    // Get the most recent test for the same URL
    const relevantEntry = historyEntries.find((e) => e.url === url);
    if (relevantEntry && relevantEntry.stats) {
      const total = relevantEntry.successfulRequests + relevantEntry.failedRequests;
      return total > 0 ? (relevantEntry.successfulRequests / total) * 100 : undefined;
    }
    return undefined;
  }, [historyEntries, url]);

  // Calculate concurrency recommendation
  const recommendation = useMemo(() => {
    return calculateConcurrencyRecommendation({
      cpuCores: cpuCount || 4,
      useHttp2,
      disableKeepAlive,
      url,
      pastSuccessRate,
    });
  }, [cpuCount, useHttp2, disableKeepAlive, url, pastSuccessRate]);

  // Get warnings for current concurrency value
  const concurrencyWarnings = useMemo(() => {
    return getConcurrencyWarnings(concurrency, recommendation);
  }, [concurrency, recommendation]);

  return (
    <>
      {/* Method & URL */}
      <div className={styles.configSection}>
        <label className={styles.configLabel}>Request</label>
        <div className={styles.methodUrlRow}>
          <Select.Root
            value={method}
            onValueChange={(value) => setMethod(value as HttpMethod)}
            disabled={isRunning}
          >
            <Select.Trigger className={styles.selectTrigger}>
              <Select.Value />
              <Select.Icon className={styles.selectIcon}>
                <ChevronDown size={14} />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content className={styles.selectContent} position="popper" sideOffset={4}>
                <Select.Viewport className={styles.selectViewport}>
                  {HTTP_METHODS.map((m) => (
                    <Select.Item key={m} value={m} className={styles.selectItem}>
                      <Select.ItemIndicator className={styles.selectItemIndicator}>
                        <Check size={12} />
                      </Select.ItemIndicator>
                      <Select.ItemText>{m}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
          <input
            id="url-input"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com"
            disabled={isRunning}
            className={styles.urlInput}
          />
        </div>
      </div>

      {/* Headers */}
      <HeadersEditor />

      {/* Payload */}
      <PayloadEditor />

      {/* Load Configuration - Requests & Concurrency in one row with labels */}
      <div className={styles.configSection}>
        <div className={styles.loadConfigRow}>
          <div className={styles.labeledInputGroup}>
            <label className={styles.configLabel}>Requests</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={numRequests || ""}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, "");
                setNumRequests(raw === "" ? 0 : Math.min(parseInt(raw, 10), MAX_REQUESTS));
              }}
              onBlur={() => {
                if (numRequests < MIN_REQUESTS) setNumRequests(MIN_REQUESTS);
              }}
              disabled={isRunning}
              className={styles.labeledNumberInput}
            />
          </div>
          <div className={styles.labeledInputGroup}>
            <label className={styles.configLabel}>Parallel</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={concurrency || ""}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, "");
                setConcurrency(raw === "" ? 0 : Math.min(parseInt(raw, 10), MAX_CONCURRENCY));
              }}
              onBlur={() => {
                if (concurrency < MIN_CONCURRENCY) setConcurrency(MIN_CONCURRENCY);
              }}
              disabled={isRunning}
              className={styles.labeledNumberInput}
            />
          </div>
        </div>

        {/* Concurrency Hint */}
        <div className={styles.concurrencyHint}>
          <span className={styles.concurrencyHintText}>
            Suggested: <strong>{recommendation.suggested}</strong> parallel requests
            {concurrency !== recommendation.suggested && (
              <button
                type="button"
                className={styles.concurrencyApplyBtn}
                onClick={() => setConcurrency(recommendation.suggested)}
                disabled={isRunning}
              >
                Apply
              </button>
            )}
          </span>
          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                type="button"
                className={styles.concurrencyInfoBtn}
                aria-label="How is this calculated?"
              >
                <Info size={14} />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content className={styles.concurrencyInfoPopover} sideOffset={5} align="end">
                <div className={styles.concurrencyInfoTitle}>Recommendation Breakdown</div>
                <ul className={styles.concurrencyInfoList}>
                  {recommendation.breakdown.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                {concurrencyWarnings.length > 0 && (
                  <div className={styles.concurrencyWarnings}>
                    {concurrencyWarnings.map((warning, index) => (
                      <div key={index} className={styles.concurrencyWarning}>
                        ⚠️ {warning}
                      </div>
                    ))}
                  </div>
                )}
                <div className={styles.concurrencyInfoFooter}>
                  Max safe for your system: {recommendation.max}
                </div>
                {!disableKeepAlive && concurrency >= 200 && (
                  <div className={styles.concurrencyInfoNote}>
                    <strong>Note:</strong> With connection pooling enabled, servers may close idle
                    connections causing "stale connection" errors. If you see many connection
                    errors, try enabling <em>Disable Keep-Alive</em> in Advanced Options.
                  </div>
                )}
                <Popover.Arrow className={styles.concurrencyInfoArrow} />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </div>

      {/* Advanced Options */}
      <div className={styles.advancedSection}>
        <button
          type="button"
          className={styles.advancedToggle}
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
        >
          <span
            className={styles.toggleIcon}
            style={{ transform: showAdvancedOptions ? "rotate(90deg)" : "none" }}
          >
            <ChevronRight size={12} />
          </span>
          <span className={styles.configLabel}>Advanced Options</span>
        </button>

        {showAdvancedOptions && (
          <div className={styles.advancedContent}>
            {/* HTTP/2 */}
            <div className={styles.advancedToggleRow}>
              <div className={styles.advancedRowLabel}>
                <span className={styles.advancedRowName}>HTTP/2</span>
                <span className={styles.advancedRowDesc}>Requires server support</span>
              </div>
              <Switch.Root
                checked={useHttp2}
                onCheckedChange={setUseHttp2}
                disabled={isRunning}
                className={styles.switchRoot}
              >
                <Switch.Thumb className={styles.switchThumb} />
              </Switch.Root>
            </div>

            {/* Follow Redirects */}
            <div className={styles.advancedToggleRow}>
              <div className={styles.advancedRowLabel}>
                <span className={styles.advancedRowName}>Follow Redirects</span>
                <span className={styles.advancedRowDesc}>Automatically follow HTTP redirects</span>
              </div>
              <Switch.Root
                checked={followRedirects}
                onCheckedChange={setFollowRedirects}
                disabled={isRunning}
                className={styles.switchRoot}
              >
                <Switch.Thumb className={styles.switchThumb} />
              </Switch.Root>
            </div>

            {/* Timeout */}
            <div className={styles.advancedRow}>
              <div className={styles.advancedRowLabel}>
                <span className={styles.advancedRowName}>Timeout per request</span>
                <span className={styles.advancedRowDesc}>Seconds per request (0 = infinite)</span>
              </div>
              <input
                type="number"
                value={timeoutSecs}
                onChange={(e) => setTimeoutSecs(parseFloat(e.target.value) || 0)}
                min={0}
                step={0.1}
                disabled={isRunning}
                placeholder="20"
                className={styles.advancedInput}
              />
            </div>

            {/* Rate Limit */}
            <div className={styles.advancedRow}>
              <div className={styles.advancedRowLabel}>
                <span className={styles.advancedRowName}>Rate Limit</span>
                <span className={styles.advancedRowDesc}>QPS per worker (0 = unlimited)</span>
              </div>
              <input
                type="number"
                value={rateLimit}
                onChange={(e) => setRateLimit(parseFloat(e.target.value) || 0)}
                min={0}
                step={0.1}
                disabled={isRunning}
                placeholder="0"
                className={styles.advancedInput}
              />
            </div>

            {/* Worker Threads */}
            <div className={styles.advancedRow}>
              <div className={styles.advancedRowLabel}>
                <span className={styles.advancedRowName}>CPU Cores</span>
                <span className={styles.advancedRowDesc}>
                  Worker threads (0 = all {cpuCount} cores)
                </span>
              </div>
              <input
                type="number"
                value={workerThreads}
                onChange={(e) => setWorkerThreads(parseInt(e.target.value) || 0)}
                min={0}
                max={cpuCount * 2}
                disabled={isRunning}
                placeholder={`0 (${cpuCount})`}
                className={styles.advancedInput}
              />
            </div>

            {/* HTTP Proxy */}
            <div className={styles.advancedRow}>
              <div className={styles.advancedRowLabel}>
                <span className={styles.advancedRowName}>HTTP Proxy</span>
                <span className={styles.advancedRowDesc}>Proxy address (host:port)</span>
              </div>
              <input
                type="text"
                value={proxyUrl}
                onChange={(e) => setProxyUrl(e.target.value)}
                disabled={isRunning}
                placeholder="127.0.0.1:8080"
                className={styles.advancedInputWide}
              />
            </div>

            {/* Randomize User-Agent */}
            <div className={styles.advancedToggleRow}>
              <div className={styles.advancedRowLabel}>
                <span className={styles.advancedRowName}>Randomize User-Agent</span>
                <span className={styles.advancedRowDesc}>
                  Rotate through realistic browser agents
                </span>
              </div>
              <Switch.Root
                checked={randomizeUserAgent}
                onCheckedChange={setRandomizeUserAgent}
                disabled={isRunning}
                className={styles.switchRoot}
              >
                <Switch.Thumb className={styles.switchThumb} />
              </Switch.Root>
            </div>

            {/* Vary Headers */}
            <div className={styles.advancedToggleRow}>
              <div className={styles.advancedRowLabel}>
                <span className={styles.advancedRowName}>Vary Headers</span>
                <span className={styles.advancedRowDesc}>
                  Randomize Accept-Language & browser headers
                </span>
              </div>
              <Switch.Root
                checked={randomizeHeaders}
                onCheckedChange={setRandomizeHeaders}
                disabled={isRunning}
                className={styles.switchRoot}
              >
                <Switch.Thumb className={styles.switchThumb} />
              </Switch.Root>
            </div>

            {/* Cache Buster */}
            <div className={styles.advancedToggleRow}>
              <div className={styles.advancedRowLabel}>
                <span className={styles.advancedRowName}>Cache Buster</span>
                <span className={styles.advancedRowDesc}>
                  Append unique query param to each request
                </span>
              </div>
              <Switch.Root
                checked={addCacheBuster}
                onCheckedChange={setAddCacheBuster}
                disabled={isRunning}
                className={styles.switchRoot}
              >
                <Switch.Thumb className={styles.switchThumb} />
              </Switch.Root>
            </div>

            {/* Disable Keep-Alive */}
            <div className={styles.advancedToggleRow}>
              <div className={styles.advancedRowLabel}>
                <span className={styles.advancedRowName}>Disable Keep-Alive</span>
                <span className={styles.advancedRowDesc}>
                  New TCP connection per request (worst-case test)
                </span>
              </div>
              <Switch.Root
                checked={disableKeepAlive}
                onCheckedChange={setDisableKeepAlive}
                disabled={isRunning}
                className={styles.switchRoot}
              >
                <Switch.Thumb className={styles.switchThumb} />
              </Switch.Root>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
