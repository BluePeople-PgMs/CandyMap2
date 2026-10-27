import type { Rating } from "../types";

/**
 * localStorage preparation for Milestone 5 (Rate house).
 *
 * Architecture rules:
 * - Seed data in `src/data/` is immutable and never written back.
 * - Only user-submitted ratings live in localStorage.
 * - UI merge happens in memory via `applyUserRatingsToHouses`.
 */
export const STORAGE_KEYS = {
  userRatings: "candymap:user-ratings:v1",
} as const;

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/** Read user ratings safely on server and client. Seed data is never returned here. */
export function readUserRatings(): Rating[] {
  if (!canUseLocalStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.userRatings);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isStoredRating);
  } catch {
    return [];
  }
}

/**
 * Persist the full user-rating list.
 * Callers should pass the complete array (append/replace in memory first).
 */
export function writeUserRatings(ratings: readonly Rating[]): void {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEYS.userRatings,
      JSON.stringify(ratings),
    );
  } catch {
    // Quota / private mode — ignore for MVP; UI can toast later.
  }
}

/** Append one rating without touching seed modules. */
export function appendUserRating(rating: Rating): Rating[] {
  const next = [...readUserRatings(), rating];
  writeUserRatings(next);
  return next;
}

/** Clear only user ratings. Seed houses remain unchanged. */
export function clearUserRatings(): void {
  if (!canUseLocalStorage()) {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEYS.userRatings);
  } catch {
    // Ignore storage failures in MVP.
  }
}

function isStoredRating(value: unknown): value is Rating {
  if (!value || typeof value !== "object") {
    return false;
  }

  const rating = value as Partial<Rating>;
  return (
    typeof rating.id === "string" &&
    typeof rating.houseId === "string" &&
    typeof rating.quality === "number" &&
    typeof rating.variety === "number" &&
    typeof rating.quantity === "number" &&
    typeof rating.overall === "number" &&
    typeof rating.createdAt === "string"
  );
}
