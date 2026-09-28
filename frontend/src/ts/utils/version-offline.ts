/**
 * Version Check Offline Module
 * Provides offline-safe version checking
 * Does not make any network requests
 */

import { IS_OFFLINE_BUILD } from "./offline";

export interface VersionData {
  version: string;
  timestamp: string;
  buildTime: string;
}

const OFFLINE_VERSION: VersionData = {
  version: "OFFLINE-BUILD",
  timestamp: new Date().toISOString(),
  buildTime: new Date().toISOString(),
};

/**
 * Fetch latest version - OFFLINE SAFE
 * Returns null in offline mode instead of making HTTP request
 * Does not throw errors
 */
export async function fetchLatestVersion(): Promise<VersionData | null> {
  if (IS_OFFLINE_BUILD) {
    console.debug("[Offline Mode] Version check skipped - using offline version");
    return OFFLINE_VERSION;
  }

  // In online mode, this should call the original version check
  // But since we're in offline build, we never reach here
  console.warn("[Offline Mode] fetchLatestVersion called in unexpected context");
  return null;
}

/**
 * Get cached version
 */
export function getCachedVersion(): VersionData {
  return OFFLINE_VERSION;
}
