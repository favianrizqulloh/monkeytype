/**
 * Offline Mode Utilities
 * Provides runtime detection and control for offline/online mode
 * Ensures no network requests are made in offline mode
 */

/**
 * Detect if this is an offline build
 * Set via VITE_OFFLINE_MODE during build
 */
export const IS_OFFLINE_BUILD = import.meta.env.VITE_OFFLINE_MODE === "true";

/**
 * Detect if running from file:// protocol (true offline)
 */
export function isFileProtocol(): boolean {
  return typeof window !== "undefined" && window.location.protocol === "file:";
}

/**
 * Check if we should allow network requests
 * Returns false if:
 * - This is an offline build
 * - We're running from file:// protocol
 * - Network is actually offline
 */
export function canUseNetwork(): boolean {
  // Offline build mode takes absolute priority
  if (IS_OFFLINE_BUILD) {
    return false;
  }

  // Check file:// protocol
  if (isFileProtocol()) {
    return false;
  }

  // Check navigator.onLine (not 100% reliable but helpful)
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return false;
  }

  return true;
}

/**
 * Wrapper for fetch that respects offline mode
 * In offline mode, all network requests are blocked
 */
export async function offlineSafeFetch(
  url: string | Request,
  init?: RequestInit
): Promise<Response> {
  if (!canUseNetwork()) {
    // Return offline error response
    return new Response(
      JSON.stringify({
        error: "Offline mode: Network requests are disabled",
        url: typeof url === "string" ? url : url.url,
      }),
      {
        status: 0,
        statusText: "Offline",
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return fetch(url, init);
}

/**
 * Guard for API calls
 * Throws error if attempting to call API in offline mode
 */
export function guardOfflineMode(operation: string): void {
  if (!canUseNetwork()) {
    console.warn(
      `[Offline Mode] Blocked network operation: ${operation}. This feature is not available in offline mode.`
    );
    throw new Error(
      `[Offline Mode] Network operation blocked: ${operation}. This feature requires internet connection.`
    );
  }
}

/**
 * Safe API call wrapper - silently fails in offline mode
 * Returns null or default value instead of throwing
 */
export async function safeApiCall<T>(
  apiFunction: () => Promise<T>,
  defaultValue: T
): Promise<T> {
  if (!canUseNetwork()) {
    console.debug("[Offline Mode] Skipping API call, using default value");
    return defaultValue;
  }

  try {
    return await apiFunction();
  } catch (error) {
    console.error("[Offline Mode] API call failed:", error);
    return defaultValue;
  }
}

/**
 * Detect if this is a true offline scenario
 * (either offline build OR no network connection)
 */
export function isTrueOfflineMode(): boolean {
  return IS_OFFLINE_BUILD || !canUseNetwork();
}

/**
 * Log offline mode status for debugging
 */
export function logOfflineStatus(): void {
  const status = {
    isOfflineBuild: IS_OFFLINE_BUILD,
    isFileProtocol: isFileProtocol(),
    navigatorOnline: typeof navigator !== "undefined" ? navigator.onLine : null,
    canUseNetwork: canUseNetwork(),
    isTrueOfflineMode: isTrueOfflineMode(),
  };

  console.info("[Offline Mode Status]", status);
}
