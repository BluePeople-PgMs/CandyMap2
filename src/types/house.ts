import type { CandyTag, CandyType } from "./candy";
import type { Comment } from "./comment";

/** Averaged score dimensions for a house (1–5 each). */
export type HouseAverages = {
  quality: number;
  variety: number;
  quantity: number;
  overall: number;
};

/**
 * A trick-or-treat stop on the CandyMap.
 * Coordinates are for a fictional demo cluster only — not real residences.
 */
export type House = {
  id: string;
  name: string;
  /** Fictional street address for demo storytelling. */
  address: string;
  lat: number;
  lng: number;
  neighborhoodId: string;
  candyTypes: CandyType[];
  /** Tags chosen when a person pins a house. Demo houses leave this empty. */
  candyTags?: CandyTag[];
  /** Lightweight visual stand-in until we host photos. */
  photoEmoji?: string;
  ratingCount: number;
  averages: HouseAverages;
  comments: Comment[];
};
