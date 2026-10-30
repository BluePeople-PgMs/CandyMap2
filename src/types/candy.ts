/**
 * Known candy categories used across houses and filters.
 * Keep as a string union (not an enum) so Node type-stripping and bundlers stay simple.
 */
export const CANDY_TYPES = [
  "chocolate",
  "gummy",
  "sour",
  "hard-candy",
  "full-size",
  "homemade",
  "chips",
  "fruit",
  "specialty",
] as const;

export type CandyType = (typeof CANDY_TYPES)[number];

/** Human-readable labels for UI chips (Milestone 2+). */
export const CANDY_TYPE_LABELS: Record<CandyType, string> = {
  chocolate: "Chocolate",
  gummy: "Gummy",
  sour: "Sour",
  "hard-candy": "Hard candy",
  "full-size": "Full-size",
  homemade: "Homemade",
  chips: "Chips",
  fruit: "Fruit snacks",
  specialty: "Specialty",
};

export function isCandyType(value: string): value is CandyType {
  return (CANDY_TYPES as readonly string[]).includes(value);
}

/**
 * Tags a person can attach when they pin a house.
 * Separate from the original demo candy types so the 12 seed houses stay unchanged.
 */
export const CANDY_TAGS = [
  "chocolates",
  "sour-candies",
  "gummies",
  "lollipops",
  "hard-candies",
  "caramels",
  "chewy-candies",
  "full-size-bars",
  "chips-snacks",
  "non-candy-treats",
] as const;

export type CandyTag = (typeof CANDY_TAGS)[number];

export const CANDY_TAG_LABELS: Record<CandyTag, string> = {
  chocolates: "Chocolates",
  "sour-candies": "Sour Candies",
  gummies: "Gummies",
  lollipops: "Lollipops",
  "hard-candies": "Hard Candies",
  caramels: "Caramels",
  "chewy-candies": "Chewy Candies",
  "full-size-bars": "Full-Size Candy Bars",
  "chips-snacks": "Chips & Snacks",
  "non-candy-treats": "Non-Candy Treats",
};

export function isCandyTag(value: string): value is CandyTag {
  return (CANDY_TAGS as readonly string[]).includes(value);
}
