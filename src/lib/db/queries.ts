import type { FoodEntry, MealType, Allergen } from '$lib/types';
import { getDb, persist } from './index';

export async function createEntry(
  timestamp: string,
  rawText: string,
  foods: string[],
  mealType: MealType | null,
  notes = ''
): Promise<number> {
  const db = await getDb();
  const stmt = db.prepare(`
    INSERT INTO entries (timestamp, raw_text, foods, meal_type, notes)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run([timestamp, rawText, JSON.stringify(foods), mealType, notes]);
  stmt.free();
  const id = db.exec('SELECT last_insert_rowid()')[0].values[0][0] as number;
  persist();
  return id;
}

export async function getEntries(page = 0, limit = 50): Promise<FoodEntry[]> {
  const db = await getDb();
  const offset = page * limit;
  const result = db.exec(
    `SELECT id, timestamp, meal_type, raw_text, foods, notes, created_at
     FROM entries ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  if (result.length === 0) return [];
  return result[0].values.map(row => ({
    id: row[0] as number,
    timestamp: row[1] as string,
    mealType: (row[2] as MealType | null),
    rawText: row[3] as string,
    foods: JSON.parse(row[4] as string),
    notes: row[5] as string,
    createdAt: row[6] as string
  }));
}

export async function getEntriesByDate(date: string): Promise<FoodEntry[]> {
  const db = await getDb();
  const result = db.exec(
    `SELECT id, timestamp, meal_type, raw_text, foods, notes, created_at
     FROM entries WHERE date(timestamp) = ? ORDER BY timestamp DESC`,
    [date]
  );
  if (result.length === 0) return [];
  return result[0].values.map(row => ({
    id: row[0] as number,
    timestamp: row[1] as string,
    mealType: (row[2] as MealType | null),
    rawText: row[3] as string,
    foods: JSON.parse(row[4] as string),
    notes: row[5] as string,
    createdAt: row[6] as string
  }));
}

export async function updateEntry(
  id: number,
  fields: Partial<Pick<FoodEntry, 'timestamp' | 'mealType' | 'foods' | 'rawText' | 'notes'>>
): Promise<void> {
  const db = await getDb();
  const sets: string[] = [];
  const params: unknown[] = [];
  if (fields.timestamp !== undefined) { sets.push('timestamp = ?'); params.push(fields.timestamp); }
  if (fields.mealType !== undefined) { sets.push('meal_type = ?'); params.push(fields.mealType); }
  if (fields.foods !== undefined) { sets.push('foods = ?'); params.push(JSON.stringify(fields.foods)); }
  if (fields.rawText !== undefined) { sets.push('raw_text = ?'); params.push(fields.rawText); }
  if (fields.notes !== undefined) { sets.push('notes = ?'); params.push(fields.notes); }
  if (sets.length === 0) return;
  params.push(id);
  db.run(`UPDATE entries SET ${sets.join(', ')} WHERE id = ?`, params);
  persist();
}

export async function deleteEntry(id: number): Promise<void> {
  const db = await getDb();
  db.run('DELETE FROM entries WHERE id = ?', [id]);
  persist();
}

export async function searchEntries(query: string): Promise<FoodEntry[]> {
  const db = await getDb();
  const q = `%${query}%`;
  const result = db.exec(
    `SELECT id, timestamp, meal_type, raw_text, foods, notes, created_at
     FROM entries WHERE raw_text LIKE ? OR foods LIKE ? ORDER BY timestamp DESC`,
    [q, q]
  );
  if (result.length === 0) return [];
  return result[0].values.map(row => ({
    id: row[0] as number,
    timestamp: row[1] as string,
    mealType: (row[2] as MealType | null),
    rawText: row[3] as string,
    foods: JSON.parse(row[4] as string),
    notes: row[5] as string,
    createdAt: row[6] as string
  }));
}

export async function addAllergen(foodName: string, notes = ''): Promise<number> {
  const db = await getDb();
  db.run('INSERT OR IGNORE INTO allergens (food_name, notes) VALUES (?, ?)', [foodName.toLowerCase(), notes]);
  persist();
  const result = db.exec('SELECT id FROM allergens WHERE food_name = ?', [foodName.toLowerCase()]);
  return result[0].values[0][0] as number;
}

export async function getAllergens(): Promise<Allergen[]> {
  const db = await getDb();
  const result = db.exec('SELECT id, food_name, notes, created_at FROM allergens ORDER BY food_name');
  if (result.length === 0) return [];
  return result[0].values.map(row => ({
    id: row[0] as number,
    foodName: row[1] as string,
    notes: row[2] as string,
    createdAt: row[3] as string
  }));
}

export async function removeAllergen(id: number): Promise<void> {
  const db = await getDb();
  db.run('DELETE FROM allergens WHERE id = ?', [id]);
  persist();
}

export async function updateAllergen(id: number, foodName: string, notes?: string): Promise<void> {
  const db = await getDb();
  const sets: string[] = ['food_name = ?'];
  const params: unknown[] = [foodName.toLowerCase()];
  if (notes !== undefined) { sets.push('notes = ?'); params.push(notes); }
  params.push(id);
  db.run(`UPDATE allergens SET ${sets.join(', ')} WHERE id = ?`, params);
  persist();
}

export async function checkAllergens(foods: string[]): Promise<string[]> {
  const db = await getDb();
  const allergens = (await getAllergens()).map(a => a.foodName);
  return foods.filter(f => allergens.includes(f.toLowerCase()));
}

export async function getEntryById(id: number): Promise<FoodEntry | null> {
  const db = await getDb();
  const result = db.exec(
    `SELECT id, timestamp, meal_type, raw_text, foods, notes, created_at
     FROM entries WHERE id = ?`,
    [id]
  );
  if (result.length === 0 || result[0].values.length === 0) return null;
  const row = result[0].values[0];
  return {
    id: row[0] as number,
    timestamp: row[1] as string,
    mealType: (row[2] as MealType | null),
    rawText: row[3] as string,
    foods: JSON.parse(row[4] as string),
    notes: row[5] as string,
    createdAt: row[6] as string
  };
}
