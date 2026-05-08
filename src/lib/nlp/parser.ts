import type { ParsedEntry, MealType } from '$lib/types';

const MEAL_PATTERNS: Record<MealType, RegExp> = {
  breakfast: /\b(breakfast|breakie|brkfst|brekfast|morning meal|brekkie|break fast)\b/i,
  lunch: /\b(lunch|lunsh|afternoon meal|lunchtime|lunch time)\b/i,
  dinner: /\b(dinner|dinna|supper|evening meal|dinner time|dindin|dins)\b/i,
  snack: /\b(snack|snak|nibble|bite|munchie|snacking)\b/i
};

const EAT_VERBS = /\b(ate|eat|eaten|had|have|having|consumed|ordered|got|made|cooked|took)\b/i;

const STOP_WORDS = new Set([
  'i', 'me', 'my', 'the', 'a', 'an', 'and', 'for', 'of', 'in', 'on',
  'at', 'to', 'with', 'some', 'this', 'that', 'was', 'were', 'then',
  'just', 'very', 'too', 'so', 'also', 'but', 'or', 'from', 'by',
  'as', 'be', 'it', 'its', 'we', 'our', 'they', 'their', 'he', 'she',
  'his', 'her', 'not', 'no', 'do', 'did', 'done', 'does', 'is', 'are',
  'been', 'being', 'after', 'before', 'during', 'while', 'will', 'can',
  'could', 'would', 'should', 'may', 'might', 'shall', 'about', 'into',
  'over', 'up', 'down', 'out', 'off', 'than', 'then', 'now', 'today',
  'back', 'here', 'there', 'got', 'get', 'gets', 'getting', 'make',
  'makes', 'making', 'want', 'wants', 'wanted', 'like', 'liked',
  'cause', 'because', 'really', 'actually', 'basically', 'literally',
  'kinda', 'sorta', 'little', 'bit', 'lot', 'much', 'many', 'more',
  'most', 'less', 'few', 'some', 'any', 'every', 'each', 'all', 'both',
  'half', 'another', 'other', 'next', 'last', 'first', 'second',
  'third', 'one', 'two', 'three', 'oh', 'yeah', 'yes', 'no', 'ok',
  'okay', 'um', 'uh', 'hmm', 'ah', 'like', 'around', 'almost',
  'always', 'usually', 'sometimes', 'never', 'ever', 'even', 'still',
  'already', 'yet', 'just', 'only', 'quite', 'pretty', 'such'
]);

const KNOWN_FOODS = new Set([
  'rice', 'bread', 'chicken', 'beef', 'pork', 'fish', 'egg', 'eggs',
  'toast', 'milk', 'cheese', 'butter', 'yogurt', 'apple', 'banana',
  'orange', 'grape', 'strawberry', 'blueberry', 'watermelon', 'mango',
  'tomato', 'potato', 'carrot', 'onion', 'garlic', 'broccoli', 'spinach',
  'lettuce', 'cucumber', 'pepper', 'mushroom', 'pasta', 'noodle',
  'soup', 'salad', 'sandwich', 'burger', 'pizza', 'taco', 'wrap',
  'sushi', 'curry', 'stew', 'roast', 'grill', 'fry', 'fries', 'chips',
  'salmon', 'tuna', 'shrimp', 'prawn', 'crab', 'lobster', 'tofu',
  'bean', 'beans', 'lentil', 'chickpea', 'peas', 'corn', 'cake',
  'cookie', 'cookies', 'chocolate', 'candy', 'ice cream', 'pie',
  'pudding', 'muffin', 'donut', 'cereal', 'oatmeal', 'porridge',
  'pancake', 'pancakes', 'waffle', 'french toast', 'omelette',
  'scramble', 'bacon', 'sausage', 'ham', 'turkey', 'duck', 'lamb',
  'steak', 'ribs', 'wing', 'wings', 'nugget', 'nuggets', 'popcorn',
  'pretzel', 'nachos', 'guacamole', 'salsa', 'dip', 'sauce', 'gravy',
  'avocado', 'olive', 'olives', 'pickle', 'pickles', 'peanut',
  'almond', 'walnut', 'cashew', 'nut', 'nuts', 'seed', 'seeds',
  'honey', 'syrup', 'jam', 'jelly', 'peanut butter', 'cream cheese',
  'sour cream', 'mayo', 'mustard', 'ketchup', 'bbq', 'hot sauce',
  'soy sauce', 'vinegar', 'oil', 'olive oil', 'coconut', 'dates',
  'raisin', 'raisins', 'prune', 'prunes', 'apricot', 'peach', 'pear',
  'plum', 'cherry', 'cherries', 'grapefruit', 'lemon', 'lime',
  'pineapple', 'papaya', 'kiwi', 'melon', 'cantaloupe', 'honeydew',
  'berry', 'berries', 'raspberry', 'blackberry', 'cranberry',
  'broth', 'stock', 'bacon', 'salami', 'pepperoni', 'prosciutto',
  'tortilla', 'taco', 'burrito', 'quesadilla', 'enchilada', 'nachos',
  'dumpling', 'dumplings', 'spring roll', 'egg roll', 'dim sum',
  'ramen', 'udon', 'soba', 'pho', 'pad thai', 'fried rice',
  'chow mein', 'lo mein', 'stir fry', 'tempura', 'teriyaki',
  'kimchi', 'sauerkraut', 'hummus', 'baba ganoush', 'falafel',
  'pita', 'naan', 'roti', 'chapati', 'paratha', 'samosa', 'biryani',
  'tikka', 'masala', 'korma', 'vindaloo', 'dal', 'rajma', 'chole',
  'paneer', 'ghee', 'naan', 'idli', 'dosa', 'chutney', 'pickle',
  'gelato', 'sorbet', 'brownie', 'brownies', 'cheesecake',
  'tiramisu', 'creme brulee', 'flan', 'custard', 'mousse'
]);

export function parseFoodText(text: string): ParsedEntry {
  const rawText = text.trim();

  let mealType: MealType | null = null;
  for (const [meal, pattern] of Object.entries(MEAL_PATTERNS)) {
    if (pattern.test(rawText)) {
      mealType = meal as MealType;
      break;
    }
  }

  let foodText = rawText
    .replace(/\b(breakfast|lunch|dinner|snack|brunch)\b/gi, '')
    .replace(/^(i|so|then|and)\s+/gi, '')
    .trim();

  const verbMatch = foodText.match(EAT_VERBS);
  if (verbMatch) {
    const idx = foodText.indexOf(verbMatch[0]) + verbMatch[0].length;
    foodText = foodText.slice(idx).trim();
  }

  const rawFoods = foodText
    .split(/[,;]/)
    .flatMap(part => part.split(/\b(and|with|plus|on the side)\b/i))
    .map(f => f
      .replace(/^(a|an|some|the|my)\s+/gi, '')
      .replace(/[^a-zA-Z\s'-]/g, '')
      .trim()
    )
    .filter(f => f.length > 1)
    .filter(f => !EAT_VERBS.test(f))
    .filter(f => f.split(/\s+/).length <= 4);

  let foods: string[] = [];
  for (const f of rawFoods) {
    const lower = f.toLowerCase();
    if (foods.some(ex => ex.includes(lower) || lower.includes(ex))) continue;
    foods.push(lower);
  }

  if (foods.length === 0) {
    const words = rawText
      .toLowerCase()
      .split(/\s+/)
      .map(w => w.replace(/[^a-z']/g, ''))
      .filter(w => w.length > 2 && !STOP_WORDS.has(w) && !EAT_VERBS.test(w));

    for (const word of words) {
      if (KNOWN_FOODS.has(word) && !foods.includes(word)) {
        foods.push(word);
      }
    }
    if (foods.length === 0) {
      foods = words.filter(w => !STOP_WORDS.has(w)).slice(0, 5);
    }
  }

  foods = [...new Set(foods)];

  return { mealType, foods, rawText };
}

export function guessMealType(): MealType {
  const h = new Date().getHours();
  if (h < 11) return 'breakfast';
  if (h < 16) return 'lunch';
  if (h < 21) return 'dinner';
  return 'snack';
}
