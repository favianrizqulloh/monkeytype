/**
 * Offline Storage System
 * Uses IndexedDB to persist test results, settings, and user data locally
 * Fallback to localStorage for simple data
 */

import { IS_OFFLINE_BUILD } from "./offline";

export interface TestResult {
  id?: number;
  timestamp: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  duration: number;
  testMode: string;
  language: string;
  difficulty: string;
  punctuation: boolean;
  numbers: boolean;
  errorsTotal: number;
  errorsPerSecond: number;
  characterCount: number;
  wordsCount: number;
  testType: string;
  tags?: string[];
  customText?: string;
}

export interface UserSettings {
  key: string;
  value: unknown;
  timestamp: number;
}

class OfflineStorageManager {
  private dbName = "MonkeytypeOffline";
  private version = 1;
  private db: IDBDatabase | null = null;
  private storeNames = {
    testResults: "testResults",
    userSettings: "userSettings",
    cache: "cache",
  };

  /**
   * Initialize IndexedDB
   */
  async init(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db);
        return;
      }

      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error("[OfflineStorage] Failed to open IndexedDB", request.error);
        reject(request.error);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create test results store
        if (!db.objectStoreNames.contains(this.storeNames.testResults)) {
          const resultStore = db.createObjectStore(
            this.storeNames.testResults,
            { keyPath: "id", autoIncrement: true }
          );
          resultStore.createIndex("timestamp", "timestamp", { unique: false });
          resultStore.createIndex("testMode", "testMode", { unique: false });
        }

        // Create user settings store
        if (!db.objectStoreNames.contains(this.storeNames.userSettings)) {
          db.createObjectStore(this.storeNames.userSettings, {
            keyPath: "key",
          });
        }

        // Create cache store for static data
        if (!db.objectStoreNames.contains(this.storeNames.cache)) {
          db.createObjectStore(this.storeNames.cache, { keyPath: "key" });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
    });
  }

  /**
   * Save a test result
   */
  async saveTestResult(result: Omit<TestResult, "id">): Promise<number> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const tx = db.transaction([this.storeNames.testResults], "readwrite");
      const store = tx.objectStore(this.storeNames.testResults);
      const request = store.add({
        ...result,
        timestamp: result.timestamp || Date.now(),
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as number);
    });
  }

  /**
   * Get all test results
   */
  async getAllTestResults(): Promise<TestResult[]> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const tx = db.transaction([this.storeNames.testResults], "readonly");
      const store = tx.objectStore(this.storeNames.testResults);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () =>
        resolve((request.result as TestResult[]).sort((a, b) => b.timestamp - a.timestamp));
    });
  }

  /**
   * Get test results for a specific time range
   */
  async getTestResultsByDateRange(
    startTime: number,
    endTime: number
  ): Promise<TestResult[]> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const tx = db.transaction([this.storeNames.testResults], "readonly");
      const store = tx.objectStore(this.storeNames.testResults);
      const index = store.index("timestamp");
      const range = IDBKeyRange.bound(startTime, endTime);
      const request = index.getAll(range);

      request.onerror = () => reject(request.error);
      request.onsuccess = () =>
        resolve((request.result as TestResult[]).sort((a, b) => b.timestamp - a.timestamp));
    });
  }

  /**
   * Get statistics from stored results
   */
  async getStatistics(): Promise<{
    totalTests: number;
    averageWpm: number;
    averageAccuracy: number;
    bestWpm: number;
    totalTestTime: number;
  }> {
    const results = await this.getAllTestResults();

    if (results.length === 0) {
      return {
        totalTests: 0,
        averageWpm: 0,
        averageAccuracy: 0,
        bestWpm: 0,
        totalTestTime: 0,
      };
    }

    const totalTests = results.length;
    const averageWpm = results.reduce((sum, r) => sum + r.wpm, 0) / totalTests;
    const averageAccuracy =
      results.reduce((sum, r) => sum + r.accuracy, 0) / totalTests;
    const bestWpm = Math.max(...results.map((r) => r.wpm));
    const totalTestTime = results.reduce((sum, r) => sum + r.duration, 0);

    return {
      totalTests,
      averageWpm,
      averageAccuracy,
      bestWpm,
      totalTestTime,
    };
  }

  /**
   * Save user setting
   */
  async saveSetting(key: string, value: unknown): Promise<void> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const tx = db.transaction([this.storeNames.userSettings], "readwrite");
      const store = tx.objectStore(this.storeNames.userSettings);
      const request = store.put({
        key,
        value,
        timestamp: Date.now(),
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Get user setting
   */
  async getSetting(key: string): Promise<unknown | undefined> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const tx = db.transaction([this.storeNames.userSettings], "readonly");
      const store = tx.objectStore(this.storeNames.userSettings);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result as UserSettings | undefined;
        resolve(result?.value);
      };
    });
  }

  /**
   * Save cached data (e.g., quotes, language data)
   */
  async saveCache(key: string, data: unknown): Promise<void> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const tx = db.transaction([this.storeNames.cache], "readwrite");
      const store = tx.objectStore(this.storeNames.cache);
      const request = store.put({
        key,
        data,
        timestamp: Date.now(),
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Get cached data
   */
  async getCache(key: string): Promise<unknown | undefined> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const tx = db.transaction([this.storeNames.cache], "readonly");
      const store = tx.objectStore(this.storeNames.cache);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result as {
          key: string;
          data: unknown;
          timestamp: number;
        } | undefined;
        resolve(result?.data);
      };
    });
  }

  /**
   * Delete a test result
   */
  async deleteTestResult(id: number): Promise<void> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const tx = db.transaction([this.storeNames.testResults], "readwrite");
      const store = tx.objectStore(this.storeNames.testResults);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Clear all offline data
   */
  async clearAll(): Promise<void> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const storeList = [
        this.storeNames.testResults,
        this.storeNames.userSettings,
        this.storeNames.cache,
      ];
      const tx = db.transaction(storeList, "readwrite");

      storeList.forEach((storeName) => {
        tx.objectStore(storeName).clear();
      });

      tx.onerror = () => reject(tx.error);
      tx.oncomplete = () => resolve();
    });
  }

  /**
   * Export all data as JSON
   */
  async exportData(): Promise<{
    testResults: TestResult[];
    userSettings: Record<string, unknown>;
    exportDate: string;
    version: string;
  }> {
    const testResults = await this.getAllTestResults();
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const tx = db.transaction([this.storeNames.userSettings], "readonly");
      const store = tx.objectStore(this.storeNames.userSettings);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const userSettings = (request.result as UserSettings[]).reduce(
          (acc, item) => {
            acc[item.key] = item.value;
            return acc;
          },
          {} as Record<string, unknown>
        );

        resolve({
          testResults,
          userSettings,
          exportDate: new Date().toISOString(),
          version: this.version.toString(),
        });
      };
    });
  }
}

// Singleton instance
let storageInstance: OfflineStorageManager | null = null;

/**
 * Get the offline storage manager instance
 */
export async function getOfflineStorage(): Promise<OfflineStorageManager> {
  if (!storageInstance) {
    storageInstance = new OfflineStorageManager();
    await storageInstance.init();
  }
  return storageInstance;
}

/**
 * Only allow offline storage in offline mode
 */
export async function getOfflineStorageIfEnabled(): Promise<
  OfflineStorageManager | null
> {
  if (!IS_OFFLINE_BUILD) {
    console.debug(
      "[OfflineStorage] Offline storage disabled - not in offline mode"
    );
    return null;
  }

  return getOfflineStorage();
}
