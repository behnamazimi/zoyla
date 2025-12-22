/**
 * Test Configuration Store - Manages test setup state
 * Independent store with no cross-store dependencies.
 */

import { create } from "zustand";
import type { TestConfigState, TestConfigActions, FormField } from "../types/store";
import type { HttpMethod, TestConfig, HistoryEntry } from "../types/api";
import { DEFAULT_TEST_CONFIG } from "../constants/defaults";
import { detectContentType } from "../utils/payload";
import { parseHeaders, formatHeaders } from "../utils/headers";

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

  setBody: (body: string) => set({ body }),

  setHeaders: (headers: string) => set({ headers }),

  setFormFields: (formFields: FormField[]) => set({ formFields }),

  addFormField: (field: FormField) =>
    set((state) => ({ formFields: [...state.formFields, field] })),

  updateFormField: (id: string, updates: Partial<FormField>) =>
    set((state) => ({
      formFields: state.formFields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),

  removeFormField: (id: string) =>
    set((state) => ({ formFields: state.formFields.filter((f) => f.id !== id) })),

  clearFormFields: () => set({ formFields: [] }),

  setFromHistoryEntry: (entry: HistoryEntry) =>
    set({
      url: entry.url,
      method: entry.method as HttpMethod,
      numRequests: entry.numRequests,
      concurrency: entry.concurrency || 10,
      useHttp2: entry.useHttp2,
      headers: entry.headers ? formatHeaders(entry.headers) : "",
      followRedirects: entry.followRedirects ?? true,
      timeoutSecs: entry.timeoutSecs ?? 20,
      rateLimit: entry.rateLimit ?? 0,
      randomizeUserAgent: entry.randomizeUserAgent ?? false,
      randomizeHeaders: entry.randomizeHeaders ?? false,
      addCacheBuster: entry.addCacheBuster ?? false,
      disableKeepAlive: entry.disableKeepAlive ?? false,
      workerThreads: entry.workerThreads ?? 0,
      proxyUrl: entry.proxyUrl ?? "",
      body: entry.body ?? "",
      formFields: [], // Don't restore form fields from history (file paths may not exist)
    }),

  resetToDefaults: () =>
    set({
      ...DEFAULT_TEST_CONFIG,
    }),

  getConfig: (): TestConfig => {
    const state = get();

    // If form fields exist with content, use multipart/form-data
    const hasFormFields =
      state.formFields.length > 0 &&
      state.formFields.some((f) => f.name.trim() !== "" && (f.value.trim() !== "" || f.filePath));

    // Auto-detect content type from body if body is present (and no form fields)
    const contentType =
      !hasFormFields && state.body && state.body.trim() !== ""
        ? detectContentType(state.body)
        : null;

    // Convert form fields to API format
    const formFieldsConfig = hasFormFields
      ? state.formFields
          .filter((f) => f.name.trim() !== "")
          .map((f) => ({
            name: f.name,
            value: f.value,
            file_path: f.filePath || undefined,
            file_name: f.fileName || undefined,
          }))
      : undefined;

    return {
      url: state.url,
      method: state.method,
      num_requests: state.numRequests,
      concurrency: state.concurrency,
      use_http2: state.useHttp2,
      headers: parseHeaders(state.headers),
      follow_redirects: state.followRedirects,
      timeout_secs: state.timeoutSecs,
      rate_limit: state.rateLimit,
      randomize_user_agent: state.randomizeUserAgent,
      randomize_headers: state.randomizeHeaders,
      add_cache_buster: state.addCacheBuster,
      disable_keep_alive: state.disableKeepAlive,
      worker_threads: state.workerThreads,
      proxy_url: state.proxyUrl,
      // If form fields exist, don't send body (multipart takes precedence)
      body: hasFormFields ? null : state.body || null,
      payload_content_type: contentType,
      form_fields: formFieldsConfig,
    };
  },
}));
