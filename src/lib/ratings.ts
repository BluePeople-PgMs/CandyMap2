import type { House, HouseAverages, Rating, RatingInput, RatingScores } from "../types";

const SCORE_MIN = 1;
const SCORE_MAX = 5;

/** Whole-star input is valid for submitting a rating (1 through 5). */
export function isValidStarRatingScore(value: number): boolean {
  return Number.isInteger(value) && value >= SCORE_MIN && value <= SCORE_MAX;
}

/** Clamp a score into the 1–5 range used across CandyMap. */
export function clampScore(value: number): number {
  if (Number.isNaN(value)) {
    return SCORE_MIN;
  }
  return Math.min(SCORE_MAX, Math.max(SCORE_MIN, value));
}

/** Round to one decimal place for display-friendly averages. */
export function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Overall rating is the simple average of quality, variety, and quantity.
 * Pure function — easy to unit test and swap for a server formula later.
 */
export function calculateOverallRating(
  quality: number,
  variety: number,
  quantity: number,
): number {
  const q = clampScore(quality);
  const v = clampScore(variety);
  const qty = clampScore(quantity);
  return roundToOneDecimal((q + v + qty) / 3);
}

export function calculateOverallFromScores(scores: RatingScores): number {
  return calculateOverallRating(scores.quality, scores.variety, scores.quantity);
}

/**
 * A single 1–5 star review.
 * The stored rating still has quality, variety, and quantity, so the existing average math stays in place.
 * The same star is written into all three.
 */
export function scoresFromStars(stars: number): RatingScores {
  const score = clampScore(Math.round(stars));
  return { quality: score, variety: score, quantity: score };
}

/**
 * Fold a new rating into existing house averages without mutating seed data.
 * Uses a running average: newAvg = (oldAvg * count + score) / (count + 1)
 */
export function mergeAverages(
  current: HouseAverages,
  ratingCount: number,
  scores: RatingScores,
): HouseAverages {
  const nextCount = Math.max(0, ratingCount) + 1;
  const quality = roundToOneDecimal(
    (current.quality * ratingCount + clampScore(scores.quality)) / nextCount,
  );
  const variety = roundToOneDecimal(
    (current.variety * ratingCount + clampScore(scores.variety)) / nextCount,
  );
  const quantity = roundToOneDecimal(
    (current.quantity * ratingCount + clampScore(scores.quantity)) / nextCount,
  );

  return {
    quality,
    variety,
    quantity,
    overall: calculateOverallRating(quality, variety, quantity),
  };
}

/** Build a Rating record from a submission payload (Milestone 5 will call this). */
export function createRating(
  input: RatingInput,
  options?: { id?: string; createdAt?: string },
): Rating {
  const overall = calculateOverallFromScores(input);
  return {
    id: options?.id ?? `rating-${input.houseId}-${Date.now()}`,
    houseId: input.houseId,
    quality: clampScore(input.quality),
    variety: clampScore(input.variety),
    quantity: clampScore(input.quantity),
    overall,
    createdAt: options?.createdAt ?? new Date().toISOString(),
    authorName: input.authorName,
    comment: input.comment?.trim() ? input.comment.trim() : undefined,
  };
}

/**
 * Apply user ratings on top of seed houses.
 * Seed modules stay untouched; returns a new array for UI/store use.
 */
export function applyUserRatingsToHouses(
  seedHouses: readonly House[],
  userRatings: readonly Rating[],
): House[] {
  if (userRatings.length === 0) {
    return seedHouses.map((house) => ({
      ...house,
      averages: { ...house.averages },
      candyTypes: [...house.candyTypes],
      candyTags: house.candyTags ? [...house.candyTags] : undefined,
      comments: house.comments.map((comment) => ({ ...comment })),
    }));
  }

  const ratingsByHouse = new Map<string, Rating[]>();
  for (const rating of userRatings) {
    const list = ratingsByHouse.get(rating.houseId) ?? [];
    list.push(rating);
    ratingsByHouse.set(rating.houseId, list);
  }

  return seedHouses.map((house) => {
    const extras = ratingsByHouse.get(house.id);
    if (!extras || extras.length === 0) {
      return {
        ...house,
        averages: { ...house.averages },
        candyTypes: [...house.candyTypes],
        candyTags: house.candyTags ? [...house.candyTags] : undefined,
        comments: house.comments.map((comment) => ({ ...comment })),
      };
    }

    // Sort oldest → newest so running averages match submission order.
    const ordered = [...extras].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    );

    let averages = { ...house.averages };
    let ratingCount = house.ratingCount;
    const comments = house.comments.map((comment) => ({ ...comment }));

    for (const rating of ordered) {
      averages = mergeAverages(averages, ratingCount, rating);
      ratingCount += 1;

      if (rating.comment) {
        comments.unshift({
          id: `comment-from-${rating.id}`,
          authorName: rating.authorName?.trim() || "Local trick-or-treater",
          text: rating.comment,
          createdAt: rating.createdAt,
          overall: rating.overall,
        });
      }
    }

    return {
      ...house,
      candyTypes: [...house.candyTypes],
      candyTags: house.candyTags ? [...house.candyTags] : undefined,
      averages,
      ratingCount,
      comments,
    };
  });
}
