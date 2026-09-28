/**
 * Sentry Offline Stub Module
 * Provides safe no-op implementations for error tracking
 * Prevents any telemetry or network requests to Sentry
 */

import { IS_OFFLINE_BUILD } from "./utils/offline";

if (IS_OFFLINE_BUILD) {
  console.info("[Offline Mode] Sentry stub module loaded - no error reporting will be sent");
}

/**
 * Activate Sentry - STUB for offline mode
 * Does nothing in offline mode
 */
export async function activateSentry(): Promise<void> {
  if (!IS_OFFLINE_BUILD) {
    console.warn("[Offline Mode] activateSentry() called in non-offline mode. Use original sentry.ts");
    return;
  }
  console.debug("[Offline Mode] Sentry activation skipped - offline mode enabled");
}

/**
 * Set user for Sentry - STUB
 * No-op in offline mode
 */
export async function setUser(uid: string, name: string): Promise<void> {
  console.debug("[Offline Mode] Sentry setUser() - no-op");
}

/**
 * Clear user from Sentry - STUB
 * No-op in offline mode
 */
export async function clearUser(): Promise<void> {
  console.debug("[Offline Mode] Sentry clearUser() - no-op");
}

/**
 * Capture exception - STUB
 * Logs locally instead of sending to Sentry
 */
export async function captureException(error: Error): Promise<void> {
  console.debug("[Offline Mode] Error logged locally (not sent to Sentry):", error);
  // Store in local array for debugging if needed
  if (!Array.isArray((window as any).__offlineErrors)) {
    (window as any).__offlineErrors = [];
  }
  (window as any).__offlineErrors.push({
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Toggle Sentry debug - STUB
 */
export function toggleDebug(): void {
  console.debug("[Offline Mode] Sentry debug toggle - no-op");
}
