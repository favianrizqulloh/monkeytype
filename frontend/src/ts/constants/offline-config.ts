/**
 * Offline Mode Configuration
 * Constants and settings specific to offline/portable mode
 */

import { IS_OFFLINE_BUILD } from "../utils/offline";

/**
 * API endpoints that should be blocked in offline mode
 */
export const BLOCKED_API_PATTERNS = [
  /api\.monkeytype\.com/,
  /firebase.*\.com/,
  /googleapis\.com/,
  /sentry\.io/,
  /google\.com\/recaptcha/,
  /cdn\./,
  /\.cloudflare\.com/,
  /google-analytics/,
  /\.google-analytics\.com/,
  /captcha/,
  /analytics/,
];

/**
 * Default offline mode settings
 */
export const OFFLINE_DEFAULT_SETTINGS = {
  // Disable all network-dependent features
  enableSync: false,
  enableCloudBackup: false,
  enableLeaderboards: false,
  enableChallenges: false,
  enableSocialFeatures: false,

  // UI preferences
  hideLoginButton: IS_OFFLINE_BUILD,
  hideSignupButton: IS_OFFLINE_BUILD,
  hideAccountButton: IS_OFFLINE_BUILD,
  hideProfileButton: IS_OFFLINE_BUILD,
  hideFriendsButton: IS_OFFLINE_BUILD,
  hideLeaderboardsButton: IS_OFFLINE_BUILD,

  // Notifications
  showOfflineNotice: IS_OFFLINE_BUILD,
  showOfflineMode: IS_OFFLINE_BUILD,

  // Storage
  useLocalStorage: true,
  useIndexedDB: true,

  // Telemetry
  sendTelemetry: false,
  sendErrorReports: false,
  sendAnalytics: false,
};

/**
 * Messages to display in offline mode
 */
export const OFFLINE_MESSAGES = {
  notAvailableOffline:
    "This feature is not available in offline mode. Data is stored locally on your device.",
  offlineMode: "📴 Offline Mode - No internet required",
  dataStoredLocally: "Your results are stored locally on this device.",
  noSyncAvailable:
    "Cloud sync is not available in offline mode. Use export/import to backup data.",
};

/**
 * Features available in offline mode
 */
export const OFFLINE_FEATURES = {
  typingTests: true,
  localStats: true,
  themes: true,
  languages: true,
  localExport: true,
  localImport: true,
  settings: true,
  soundEffects: true,
  practice: true,

  // Not available
  accountSync: false,
  cloudBackup: false,
  socialFeatures: false,
  leaderboards: false,
  challenges: false,
  multiplayer: false,
  userProfiles: false,
  achievements: false,
};

/**
 * Check if a feature is available in current mode
 */
export function isFeatureAvailable(feature: keyof typeof OFFLINE_FEATURES): boolean {
  if (!IS_OFFLINE_BUILD) {
    return true; // All features available in online mode
  }
  return OFFLINE_FEATURES[feature] ?? false;
}

/**
 * Offline mode notice component data
 */
export const OFFLINE_NOTICE_DATA = {
  title: "Offline Mode",
  icon: "📴",
  message: OFFLINE_MESSAGES.offlineMode,
  subtext: OFFLINE_MESSAGES.dataStoredLocally,
  color: "#FFA500", // Orange for offline
};
