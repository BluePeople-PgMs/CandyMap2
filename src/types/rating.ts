/**
 * A single user rating for a house.
 * Seed comments are separate; this shape is what we will store in localStorage later.
 */
export type RatingScores = {
  quality: number;
  variety: number;
  quantity: number;
};

export type Rating = RatingScores & {
  id: string;
  houseId: string;
  /** Derived from the three score dimensions. */
  overall: number;
  /** ISO-8601 timestamp */
  createdAt: string;
  authorName?: string;
  comment?: string;
};

/** Payload used when submitting a new rating (UI comes in Milestone 5). */
export type RatingInput = RatingScores & {
  houseId: string;
  authorName?: string;
  comment?: string;
};
