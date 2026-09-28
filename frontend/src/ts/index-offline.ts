/**
 * Offline Mode Entry Point
 * Replaces the default index.ts with offline-safe initialization
 * Ensures NO network requests are made
 */

// register signal tracking hook before any signals are created
import "./dev/signal-tracker";

//enable solidjs-devtools
import "solid-devtools";

import "./event-handlers/global";
import "./event-handlers/test";

// OFFLINE: Use offline stubs instead of real Firebase
import { init as firebaseInit } from "./firebase-offline";
import * as Logger from "./utils/logger";
import * as DB from "./db";
import "./ui";
import "./controllers/ad-controller";
import { Config } from "./config/store";
import * as TestTimer from "./test/test-timer";
import * as Result from "./test/result";
import { onAuthStateChanged } from "./auth";
import { enable } from "./legacy-states/glarses-mode";
import "./input/listeners";
import "./controllers/route-controller";
import "./elements/no-css";
import { egVideoListener } from "./popups/video-ad-popup";
import "./legacy-states/connection";
import "./test/tts";
import { addToGlobal } from "./utils/misc";
import * as Focus from "./test/focus";
import { fetchLatestVersion } from "./utils/version-offline";
// OFFLINE: Use offline sentry stub
import * as Sentry from "./sentry-offline";
import * as Cookies from "./cookies";
import "./elements/psa";
import "./controllers/url-handler";
import { applyEngineSettings } from "./anim";
import { qs, qsa, qsr } from "./utils/dom";
import { mountComponents } from "./components/mount";
import "./ready";
import { setVersion } from "./states/core";
import { loadFromLocalStorage } from "./config/lifecycle";

import "./input/hotkeys";
import { showModal } from "./states/modals";
import { getLastEventLog } from "./states/test";
import { buildEventLog } from "./test/events/data";
import { IS_OFFLINE_BUILD, logOfflineStatus } from "./utils/offline";

console.info(
  `%c[Monkeytype Offline Build] Starting application in OFFLINE mode
  ${
    IS_OFFLINE_BUILD ? "✓ Offline mode ENABLED" : "✗ Offline mode NOT enabled"
  }
  No network requests will be made.
  All data stored locally.`,
  "color: #FF6B00; font-weight: bold; font-size: 14px"
);

logOfflineStatus();

// Lock Math.random
Object.defineProperty(Math, "random", {
  value: Math.random,
  writable: false,
  configurable: false,
  enumerable: true,
});

// Freeze Math object
Object.freeze(Math);

// Lock Math on window
Object.defineProperty(window, "Math", {
  value: Math,
  writable: false,
  configurable: false,
  enumerable: true,
});

applyEngineSettings();
void loadFromLocalStorage();

// OFFLINE: Only fetch version if not in offline mode
if (!IS_OFFLINE_BUILD) {
  void fetchLatestVersion().then((data) => {
    if (data === null) return;
    setVersion(data);
  });
} else {
  console.debug("[Offline Mode] Skipping version check");
  setVersion({
    version: "OFFLINE-BUILD",
    timestamp: new Date().toISOString(),
    buildTime: new Date().toISOString(),
  });
}

Focus.set(true, true);
const accepted = Cookies.getAcceptedCookies();
if (accepted === null) {
  showModal("Cookies");
}

// OFFLINE: Initialize Firebase with offline stub
void firebaseInit(onAuthStateChanged).then(() => {
  if (accepted !== null) {
    Cookies.activateWhatsAccepted();
  }
});

addToGlobal({
  snapshot: DB.getSnapshot,
  config: Config,
  glarsesMode: enable,
  enableTimerDebug: TestTimer.enableTimerDebug,
  getTimerStats: TestTimer.getTimerStats,
  toggleSmoothedBurst: Result.toggleSmoothedBurst,
  egVideoListener: egVideoListener,
  toggleDebugLogs: Logger.toggleDebugLogs,
  toggleSentryDebug: Sentry.toggleDebug,
  qs: qs,
  qsa: qsa,
  qsr: qsr,
  lastEventLog: () => getLastEventLog(),
  currentEventLog: buildEventLog,
});

mountComponents();
