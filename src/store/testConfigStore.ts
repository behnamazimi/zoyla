/**
 * Test Configuration Store - Manages test setup state
 * Independent store with no cross-store dependencies.
 */

import { create } from "zustand";
import type { TestConfigState, TestConfigActions } from "../types/store";
import type { HttpMethod, TestConfig, HistoryEntry } from "../types/api";
import { DEFAULT_TEST_CONFIG } from "../constants/defaults";

type TestConfigStore = TestConfigState & TestConfigActions;

/**
 * Zustand store for test configuration.
 * Manages URL, method, headers, and load settings.
 */
export const useTestConfigStore = create<TestConfigStore>()((set, get) => ({
  // Initial state from defaults
  ...DEFAULT_TEST_CONFIG,

  // Actions
  setUrl: (url: string) => set({ url }),

  setMethod: (method: HttpMethod) => set({ method }),

  setNumRequests: (numRequests: number) => set({ numRequests }),

  setConcurrency: (concurrency: number) => set({ concurrency }),

  setUseHttp2: (useHttp2: boolean) => set({ useHttp2 }),

  setFollowRedirects: (followRedirects: boolean) => set({ followRedirects }),

  setTimeoutSecs: (timeoutSecs: number) => set({ timeoutSecs }),

  setRateLimit: (rateLimit: number) => set({ rateLimit }),

  setRandomizeUserAgent: (randomizeUserAgent: boolean) => set({ randomizeUserAgent }),

  setRandomizeHeaders: (randomizeHeaders: boolean) => set({ randomizeHeaders }),

  setAddCacheBuster: (addCacheBuster: boolean) => set({ addCacheBuster }),

  setDisableKeepAlive: (disableKeepAlive: boolean) => set({ disableKeepAlive }),

  setWorkerThreads: (workerThreads: number) => set({ workerThreads }),

  setProxyUrl: (proxyUrl: string) => set({ proxyUrl }),

  addHeader: () =>
    set((state) => ({
      headers: [...state.headers, { id: Date.now().toString(), key: "", value: "" }],
    })),

  updateHeader: (id: string, field: "key" | "value", value: string) =>
    set((state) => ({
      headers: state.headers.map((h) => (h.id === id ? { ...h, [field]: value } : h)),
    })),

  removeHeader: (id: string) =>
    set((state) => ({
      headers: state.headers.filter((h) => h.id !== id),
    })),

  setFromHistoryEntry: (entry: HistoryEntry) =>
    set({
      url: entry.url,
      method: entry.method as HttpMethod,
      numRequests: entry.numRequests,
      concurrency: entry.concurrency || 10,
      useHttp2: entry.useHttp2,
      headers: (entry.headers ?? []).map((h, index) => ({
        id: `${Date.now()}-${index}`,
        key: h.key,
        value: h.value,
      })),
      followRedirects: entry.followRedirects ?? true,
      timeoutSecs: entry.timeoutSecs ?? 20,
      rateLimit: entry.rateLimit ?? 0,
      randomizeUserAgent: entry.randomizeUserAgent ?? false,
      randomizeHeaders: entry.randomizeHeaders ?? false,
      addCacheBuster: entry.addCacheBuster ?? false,
      disableKeepAlive: entry.disableKeepAlive ?? false,
      workerThreads: entry.workerThreads ?? 0,
      proxyUrl: entry.proxyUrl ?? "",
    }),

  resetToDefaults: () =>
    set({
      ...DEFAULT_TEST_CONFIG,
    }),

  getConfig: (): TestConfig => {
    const state = get();
    return {
      url: state.url,
      method: state.method,
      num_requests: state.numRequests,
      concurrency: state.concurrency,
      use_http2: state.useHttp2,
      headers: state.headers
        .filter((h) => h.key.trim() !== "")
        .map((h) => ({ key: h.key, value: h.value })),
      follow_redirects: state.followRedirects,
      timeout_secs: state.timeoutSecs,
      rate_limit: state.rateLimit,
      randomize_user_agent: state.randomizeUserAgent,
      randomize_headers: state.randomizeHeaders,
      add_cache_buster: state.addCacheBuster,
      disable_keep_alive: state.disableKeepAlive,
      worker_threads: state.workerThreads,
      proxy_url: state.proxyUrl,
    };
  },
}));
