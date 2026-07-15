// src/api/apiClient.js
import axios from 'axios';
import config from '../config';

export const TOKEN_KEY = 'rpms_token';

export const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: config.requestTimeoutMs,
  withCredentials: true,
});

// Attach JWT on every request
apiClient.interceptors.request.use((req) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) req.headers.Authorization = `Bearer ${token}`;
  // Let Axios set multipart boundary itself; only force JSON otherwise
  if (!(req.data instanceof FormData)) {
    req.headers['Content-Type'] = 'application/json';
  }
  return req;
});

// Global 401 handling
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    // Only redirect to login if the 401 did not come from the login request itself
    if (err.response?.status === 401 && !err.config?.url?.includes('/sso-login')) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('rpms_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

/** Every backend controller replies { success, data|message, ... }. Unwrap consistently. */
export const unwrap = (res) => {
  if (res.data?.success === false) {
    throw new Error(res.data.message || 'Request failed');
  }
  return res.data;
};

/** Translates Axios/HTTP errors into clear, non-technical, user-friendly messages. */
export const getFriendlyErrorMessage = (err) => {
  if (!err) return 'An unexpected error occurred. Please try again.';

  const status = err.response?.status;
  const backendMessage = err.response?.data?.message || err.response?.data?.error;

  // Map SSO failure specifically
  if (backendMessage && (backendMessage.includes('SSO Authentication Failed') || backendMessage.toLowerCase().includes('sso'))) {
    return 'Incorrect email or password.';
  }

  // If backend returned a specific readable message, use it unless it is a technical status message
  if (backendMessage && typeof backendMessage === 'string' && !backendMessage.toLowerCase().includes('status code')) {
    return backendMessage;
  }

  // Handle standard HTTP status codes
  if (status === 401) {
    return 'Incorrect email or password.';
  }
  if (status === 403) {
    return 'Access denied. You do not have permissions for this action.';
  }
  if (status === 404) {
    return 'The requested resource or page was not found.';
  }
  if (status === 409) {
    return 'This record already exists.';
  }
  if (status >= 500) {
    return 'Internal server error. Please try again later.';
  }

  // Fallback pattern matching on status code in string
  const errStr = String(err.message || '');
  if (errStr.includes('401')) {
    return 'Incorrect email or password.';
  }
  if (errStr.includes('403')) {
    return 'Access denied.';
  }
  if (errStr.includes('404')) {
    return 'Not found.';
  }
  if (errStr.includes('500')) {
    return 'Internal server error. Please try again later.';
  }
  if (errStr.toLowerCase().includes('network error')) {
    return 'Network connection failed. Please check your internet connectivity.';
  }

  return err.message || 'An unexpected error occurred. Please try again.';
};

export const getAbsolutePdfUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  try {
    const origin = new URL(config.apiBaseUrl).origin;
    return `${origin}${url.startsWith('/') ? url : '/' + url}`;
  } catch (e) {
    return url;
  }
};
