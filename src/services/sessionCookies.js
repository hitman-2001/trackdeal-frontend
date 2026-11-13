import { Capacitor, registerPlugin } from '@capacitor/core';

const SessionCookies = registerPlugin('SessionCookies');

/**
 * Persist WebView cookies immediately after the API rotates the HttpOnly
 * refresh cookie. Android lifecycle callbacks are only a fallback because the
 * process can be killed before onPause/onStop runs.
 */
export async function flushSessionCookies() {
  if (!Capacitor.isNativePlatform()) return;
  await SessionCookies.flush();
}
