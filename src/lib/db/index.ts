import initSqlJs, { type Database } from 'sql.js';
import { saveToIndexedDB, loadFromIndexedDB, type Storable } from './storage';

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: (file: string) => `/sql/${file}`
  });

  const saved = await loadFromIndexedDB();
  if (saved) {
    db = new SQL.Database(saved);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA journal_mode=MEMORY');
  db.run('PRAGMA foreign_keys=ON');

  db.run(`
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      meal_type TEXT,
      raw_text TEXT NOT NULL,
      foods TEXT NOT NULL DEFAULT '[]',
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS allergens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      food_name TEXT NOT NULL UNIQUE,
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS entry_allergens (
      entry_id INTEGER NOT NULL,
      allergen_id INTEGER NOT NULL,
      PRIMARY KEY (entry_id, allergen_id),
      FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE,
      FOREIGN KEY (allergen_id) REFERENCES allergens(id) ON DELETE CASCADE
    );
  `);

  return db;
}

export function persist(): void {
  if (!db) return;
  const data = db.export();
  saveToIndexedDB(data);
}

export async function closeDb(): Promise<void> {
  if (db) {
    persist();
    db.close();
    db = null;
  }
}

export async function clearDb(): Promise<void> {
  if (db) {
    db.run('DELETE FROM entry_allergens');
    db.run('DELETE FROM allergens');
    db.run('DELETE FROM entries');
    persist();
  }
}

export async function importDb(data: Uint8Array): Promise<{ entries: number; allergens: number }> {
  const SQL = await initSqlJs({
    locateFile: (file: string) => `/sql/${file}`
  });

  const imported = new SQL.Database(data);

  const tables = imported.exec("SELECT name FROM sqlite_master WHERE type='table' AND name='entries'");
  if (tables.length === 0 || tables[0].values.length === 0) {
    imported.close();
    throw new Error('Not a valid database file');
  }

  const entryResult = imported.exec('SELECT count(*) FROM entries');
  const allergenResult = imported.exec('SELECT count(*) FROM allergens');

  const entryCount = entryResult[0]?.values[0]?.[0] as number || 0;
  const allergenCount = allergenResult[0]?.values[0]?.[0] as number || 0;

  const exportedData = imported.export();
  await saveToIndexedDB(exportedData);
  imported.close();

  if (db) {
    db.close();
    db = null;
  }

  return { entries: entryCount, allergens: allergenCount };
}
