import { MOCK_HOUSES } from "../data/houses";
import { MOCK_NEIGHBORHOODS } from "../data/neighborhoods";
import type { House, Neighborhood, RankedNeighborhood } from "../types";
import {
  getAllHouses,
  getHouseById,
  getHousesByNeighborhood,
} from "./houses";
import {
  getTopRatedHouses,
  rankHousesByRating,
  rankNeighborhoodsByAverage,
} from "./rankings";
import { applyUserRatingsToHouses } from "./ratings";
import { readUserRatings } from "./storage";

/**
 * Seed-wired helpers for app screens.
 * Keeps pure math in houses/rankings/ratings testable without loading mock modules in Node.
 */

export function getSeedHouses(): House[] {
  return getAllHouses(MOCK_HOUSES);
}

export function getSeedHouseById(id: string): House | undefined {
  return getHouseById(id, MOCK_HOUSES);
}

export function getSeedHousesByNeighborhood(neighborhoodId: string): House[] {
  return getHousesByNeighborhood(neighborhoodId, MOCK_HOUSES);
}

export function getSeedNeighborhoods(): Neighborhood[] {
  return MOCK_NEIGHBORHOODS.map((neighborhood) => ({
    ...neighborhood,
    bounds: { ...neighborhood.bounds },
  }));
}

export function getRankedSeedHouses(): House[] {
  return rankHousesByRating(MOCK_HOUSES);
}

export function getTopSeedHouses(limit = 5): House[] {
  return getTopRatedHouses(MOCK_HOUSES, limit);
}

export function getRankedSeedNeighborhoods(): RankedNeighborhood[] {
  return rankNeighborhoodsByAverage(MOCK_NEIGHBORHOODS, MOCK_HOUSES);
}

/**
 * Merge immutable seed houses with any localStorage user ratings.
 * Ready for Milestone 5; safe to call before any ratings exist.
 */
export function getHousesWithUserRatings(): House[] {
  return applyUserRatingsToHouses(MOCK_HOUSES, readUserRatings());
}
