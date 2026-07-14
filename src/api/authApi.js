// src/api/authApi.js
import { apiClient, unwrap, TOKEN_KEY, getFriendlyErrorMessage } from './apiClient';
import { mapUser } from '../utils/mapFields';

const SESSION_KEY = 'rpms_user';

/**
 * POST /api/auth/sso-login
 * Forwards credentials to the backend which calls the external Okrion SSO,
 * then fetches faculty details from the Okrion API and returns a merged user.
 */
export const login = async (ssoPayload) => {
  try {
    const res = await apiClient.post('/auth/sso-login', ssoPayload);
    const body = unwrap(res);
    localStorage.setItem(TOKEN_KEY, body.token);
    localStorage.setItem(SESSION_KEY, JSON.stringify(body.user));
    return { success: true, user: mapUser(body.user) };
  } catch (err) {
    return { success: false, error: getFriendlyErrorMessage(err) };
  }
};

export const logout = async () => {
  try {
    await apiClient.post('/auth/logout');
  } catch (err) {
    console.error('Logout API call failed:', err);
  } finally {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
  }
  return { success: true };
};

/**
 * Restores the user session on page refresh.
 * 
 * Uses the `admin` boolean from the cached user (not the role string) to determine
 * which profile endpoint to hit, since the Okrion role is always the academic role
 * (e.g. "faculty") and the RPMS admin status is in the `admin` DB flag.
 * 
 * The profile endpoint returns fresh data from the Okrion API + local DB permissions.
 * We merge it with cached SSO data as a fallback for any fields the profile endpoint
 * might not return.
 */
export const restoreSession = async () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  const cached = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  if (!cached) return null;
  try {
    // Use admin boolean (not role string) to choose endpoint
    const path = cached.admin === true ? '/admin/profile' : '/faculty/profile';
    const res = await apiClient.get(path);
    const body = unwrap(res);

    // Merge: profile endpoint data takes priority, but fall back to cached SSO data
    // for any fields the profile endpoint doesn't return
    const mergedData = {
      ...cached,         // SSO cached data as baseline
      ...body.data,      // Profile endpoint data overwrites
      // Ensure critical fields are never lost
      name: body.data.name || cached.name || '',
      email: body.data.email || cached.email || '',
      role: body.data.role || cached.role || 'faculty',
      department: body.data.department || cached.department || '',
      phone_number: body.data.phone_number || cached.phone || cached.phone_number || '',
      institution_name: body.data.institution_name || cached.institution_name || '',
      admin: body.data.admin ?? cached.admin ?? false,
      temp_admin: body.data.temp_admin ?? cached.temp_admin ?? false,
    };

    // Update the cache with fresh data
    localStorage.setItem(SESSION_KEY, JSON.stringify(mergedData));

    return mapUser(mergedData);
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};