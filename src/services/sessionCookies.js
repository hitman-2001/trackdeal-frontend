import { Capacitor, registerPlugin } from '@capacitor/core';

const SessionCookies = registerPlugin('SessionCookies');
const apiBaseUrl = new URL((import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/?$/, '/'), window.location.origin);
const cookieOptions = {
  url: new URL('auth/refresh', apiBaseUrl).href,
  name: 'trackdeal_refresh',
};

/**
 * Persist WebView cookies immediately after the API rotates the HttpOnly
 * refresh cookie. Android lifecycle callbacks are only a fallback because the
 * process can be killed before onPause/onStop runs.
 */
export async function flushSessionCookies() {
  if (!Capacitor.isNativePlatform()) return;
  await SessionCookies.flush(cookieOptions);
}

export async function restoreSessionCookies() {
  if (!Capacitor.isNativePlatform()) return;
  await SessionCookies.restore(cookieOptions);
}

export async function clearSessionCookieBackup() {
  if (!Capacitor.isNativePlatform()) return;
  await SessionCookies.clear();
}
