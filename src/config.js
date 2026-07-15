/**
 * config.js
 *
 * Central application configuration. All services and API modules
 * must read from this file. No hardcoded URLs or values anywhere else.
 *
 * To swap environments, change the relevant .env.* file.
 * When the backend is ready, set VITE_ENABLE_MOCK=false in .env.production.
 */

const config = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,

  /** Human-readable application name */
  appName: import.meta.env.VITE_APP_NAME || 'SNS RPMS',

  /** Maximum allowed file upload size in megabytes */
  uploadLimitMb: Number(import.meta.env.VITE_UPLOAD_LIMIT_MB) || 10,

  /** Default number of records per page for all paginated tables */
  pageSize: Number(import.meta.env.VITE_PAGE_SIZE) || 20,

  /** Network request timeout in milliseconds */
  requestTimeoutMs: Number(import.meta.env.VITE_REQUEST_TIMEOUT_MS) || 15000,

  /**
   * Feature Flags
   *
   * isMockEnabled: When true, all API layers use localStorage/mock data.
   *                When false, all API layers make real HTTP requests.
   *
   * Switching from mock to real backend only requires:
   *   1. Setting VITE_ENABLE_MOCK=false
   *   2. Implementing real HTTP calls in src/api/*.js
   */
  isMockEnabled: import.meta.env.VITE_ENABLE_MOCK !== 'false',
};

export default config;
