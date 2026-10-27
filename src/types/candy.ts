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
