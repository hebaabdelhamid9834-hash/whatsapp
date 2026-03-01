import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "whatsapp_clone.db";
let db = null;
let isInitializing = false;
let initPromise = null; // ✅ Store initialization promise

// ✅ Open database
const openDatabase = async () => {
  if (!db) {
    try {
      db = await SQLite.openDatabaseAsync(DATABASE_NAME, {
        useNewConnection: false,
      });
      console.log("✅ Database opened");
    } catch (error) {
      console.error("❌ Failed to open database:", error);
      throw error;
    }
  }
  return db;
};

// ✅ Initialize - ONE SIMPLE TABLE
export const initDatabase = async () => {
  // ✅ Return existing promise if already initializing
  if (initPromise) {
    console.log("⏳ Already initializing, waiting...");
    return initPromise;
  }

  if (db) return db; // ✅ Already initialized

  // ✅ Create and store the initialization promise
  initPromise = (async () => {
    isInitializing = true;

    try {
      const database = await openDatabase();

      // ✅ Execute statements separately to avoid locks
      await database.execAsync(`PRAGMA journal_mode = WAL;`);

      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS cache (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT UNIQUE NOT NULL,
          data TEXT NOT NULL,
          updated_at INTEGER
        );
      `);

      await database.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_key ON cache(key);
      `);

      console.log("✅ Database initialized");
      isInitializing = false;
      return database;
    } catch (error) {
      isInitializing = false;
      db = null; // ✅ Reset db on error
      initPromise = null; // ✅ Reset promise on error
      console.error("❌ Database init error:", error);
      throw error;
    }
  })();

  return initPromise;
};

// ✅ Ensure database is initialized before operations
const ensureInitialized = async () => {
  if (!db) {
    await initDatabase();
  }
  return db;
};

// ============ SAVE DATA ============

export const saveData = async (key, data) => {
  try {
    const database = await ensureInitialized(); // ✅ Changed

    await database.runAsync(
      `INSERT OR REPLACE INTO cache (key, data, updated_at)
       VALUES (?, ?, ?)`,
      [key, JSON.stringify(data), Date.now()]
    );

    // console.log(`✅ Saved: ${key}`);
    return true;
  } catch (error) {
    console.error(`❌ Error saving ${key}:`, error);
    return false;
  }
};

// ============ GET DATA ============

export const getData = async (key) => {
  try {
    const database = await ensureInitialized(); // ✅ Changed

    const row = await database.getFirstAsync(
      "SELECT data FROM cache WHERE key = ?",
      [key]
    );

    if (row) {
      return JSON.parse(row.data);
    }

    return null;
  } catch (error) {
    console.error(`❌ Error getting ${key}:`, error);
    return null;
  }
};

// ============ DELETE DATA ============

export const deleteData = async (key) => {
  try {
    const database = await ensureInitialized(); // ✅ Changed

    await database.runAsync("DELETE FROM cache WHERE key = ?", [key]);

    console.log(`✅ Deleted: ${key}`);
    return true;
  } catch (error) {
    console.error(`❌ Error deleting ${key}:`, error);
    return false;
  }
};

// ============ CLEAR ALL ============

export const clearAllData = async () => {
  try {
    const database = await ensureInitialized(); // ✅ Changed

    await database.runAsync("DELETE FROM cache");

    console.log("✅ All data cleared");
  } catch (error) {
    console.error("❌ Error clearing data:", error);
  }
};

// ============ DEBUG ============

export const debugDatabase = async () => {
  try {
    const database = await ensureInitialized(); // ✅ Changed

    const rows = await database.getAllAsync(
      "SELECT key, updated_at FROM cache"
    );

    console.log("📊 Cached keys:", rows);

    return rows;
  } catch (error) {
    console.error("❌ Debug error:", error);
    return [];
  }
};
