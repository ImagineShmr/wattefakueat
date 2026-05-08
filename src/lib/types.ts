export interface FoodEntry {
  id: number;
  timestamp: string;
  mealType: MealType | null;
  rawText: string;
  foods: string[];
  notes: string;
  createdAt: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface ParsedEntry {
  mealType: MealType | null;
  foods: string[];
  rawText: string;
}

export interface Allergen {
  id: number;
  foodName: string;
  notes: string;
  createdAt: string;
}

export const MEAL_EMOJI: Record<MealType, string> = {
  breakfast: '\u{1F305}',
  lunch: '\u{2600}\u{FE0F}',
  dinner: '\u{1F319}',
  snack: '\u{1F37F}'
};
