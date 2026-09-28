/**
 * Firebase Offline Stub Module
 * Provides safe no-op implementations for offline mode
 * Prevents any network requests or Firebase initialization
 */

import { IS_OFFLINE_BUILD } from "./utils/offline";

if (IS_OFFLINE_BUILD) {
  console.info("[Offline Mode] Firebase stub module loaded - no network requests will be made");
}

// Mock Firebase User type
export interface User {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
}

// Mock Auth type
export interface AuthType {
  currentUser: User | null;
}

// Mock Analytics type
export interface AnalyticsType {
  _name?: string;
}

let mockCurrentUser: User | null = null;

/**
 * Initialize Firebase - STUB for offline mode
 * Returns immediately without making any network requests
 */
export async function init(callback: (success: boolean, user: User | null) => Promise<void>): Promise<void> {
  if (!IS_OFFLINE_BUILD) {
    console.warn("[Offline Mode] init() called in non-offline mode. Use original firebase.ts");
    return;
  }

  console.debug("[Offline Mode] Firebase init() called - returning no-op");
  // Call callback immediately with no user
  await callback(false, null);
}

/**
 * Get authenticated user - STUB
 * Always returns null in offline mode
 */
export function getAuthenticatedUser(): User | null {
  return mockCurrentUser;
}

/**
 * Get analytics - STUB
 * Returns mock analytics object
 */
export function getAnalytics(): AnalyticsType {
  return { _name: "mock-analytics-offline" };
}

/**
 * Check if auth is available - STUB
 * Always returns false in offline mode
 */
export function isAuthAvailable(): boolean {
  return false;
}

/**
 * Sign out - STUB
 * No-op in offline mode
 */
export async function signOut(): Promise<void> {
  console.debug("[Offline Mode] signOut() called - no-op");
  mockCurrentUser = null;
}

/**
 * Sign in with email - STUB
 * Rejected in offline mode
 */
export async function signInWithEmailAndPassword(
  email: string,
  password: string,
  rememberMe: boolean,
): Promise<never> {
  throw new Error("[Offline Mode] Authentication is disabled in offline mode");
}

/**
 * Sign in with popup - STUB
 * Rejected in offline mode
 */
export async function signInWithPopup(
  provider: unknown,
  rememberMe: boolean,
): Promise<never> {
  throw new Error("[Offline Mode] OAuth/Popup authentication is disabled in offline mode");
}

/**
 * Create user - STUB
 * Rejected in offline mode
 */
export async function createUserWithEmailAndPassword(
  email: string,
  password: string,
): Promise<never> {
  throw new Error("[Offline Mode] User creation is disabled in offline mode");
}

/**
 * Get ID token - STUB
 * Returns null in offline mode
 */
export async function getIdToken(): Promise<string | null> {
  return null;
}

/**
 * Set user state - STUB
 * Safe to call but does nothing
 */
export function setUserState(
  options: {
    uid: string;
    emailVerified: boolean;
  } | null,
): void {
  if (options === null) {
    mockCurrentUser = null;
  } else {
    mockCurrentUser = {
      uid: options.uid,
      email: null,
      emailVerified: options.emailVerified,
      displayName: null,
    };
  }
}

/**
 * Reset ignore auth callback - STUB
 */
export function resetIgnoreAuthCallback(): void {
  console.debug("[Offline Mode] resetIgnoreAuthCallback() - no-op");
}

// Export auth promise that resolves immediately
export const authPromise = Promise.resolve();
