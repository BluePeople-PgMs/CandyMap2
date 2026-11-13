import type { House, Neighborhood, RankedNeighborhood } from "../types";
import { roundToOneDecimal } from "./ratings.ts";

/** True when at least one house in the neighborhood has a user or seed rating. */
export function neighborhoodHasRatedHouses(
  neighborhoodId: string,
  houses: readonly House[],
): boolean {
  return houses.some(
    (house) => house.neighborhoodId === neighborhoodId && house.ratingCount > 0,
  );
}

function compareByOverallThenCount(a: House, b: House): number {
  if (b.averages.overall !== a.averages.overall) {
    return b.averages.overall - a.averages.overall;
  }
  if (b.ratingCount !== a.ratingCount) {
    return b.ratingCount - a.ratingCount;
  }
  return a.name.localeCompare(b.name);
}

/** Houses sorted best → worst by overall rating. */
export function rankHousesByRating(houses: readonly House[]): House[] {
  return [...houses].sort(compareByOverallThenCount);
}

/** Top N houses by overall rating (default 5). */
export function getTopRatedHouses(
  houses: readonly House[],
  limit = 5,
): House[] {
  const safeLimit = Math.max(0, limit);
  return rankHousesByRating(houses).slice(0, safeLimit);
}

/**
 * Compute live neighborhood averages from member houses.
 * Prefer this over seed `averageOverall` after user ratings are applied.
 */
export function computeNeighborhoodStats(
  neighborhood: Neighborhood,
  houses: readonly House[],
): Pick<Neighborhood, "houseCount" | "averageOverall"> {
  const members = houses.filter(
    (house) => house.neighborhoodId === neighborhood.id,
  );

  if (members.length === 0) {
    return { houseCount: 0, averageOverall: 0 };
  }

  const total = members.reduce(
    (sum, house) => sum + house.averages.overall,
    0,
  );

  return {
    houseCount: members.length,
    averageOverall: roundToOneDecimal(total / members.length),
  };
}

/** Neighborhoods ranked best → worst by average house overall. */
export function rankNeighborhoodsByAverage(
  neighborhoods: readonly Neighborhood[],
  houses: readonly House[],
): RankedNeighborhood[] {
  const ranked = neighborhoods
    .map((neighborhood) => {
      const stats = computeNeighborhoodStats(neighborhood, houses);
      return {
        ...neighborhood,
        ...stats,
      };
    })
    .sort((a, b) => {
      if (b.averageOverall !== a.averageOverall) {
        return b.averageOverall - a.averageOverall;
      }
      if (b.houseCount !== a.houseCount) {
        return b.houseCount - a.houseCount;
      }
      return a.name.localeCompare(b.name);
    });

  return ranked.map((neighborhood, index) => ({
    ...neighborhood,
    rank: index + 1,
  }));
}
