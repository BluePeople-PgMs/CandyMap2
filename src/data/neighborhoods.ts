import type { Neighborhood } from "../types";
import { DEMO_MAP_CENTER } from "./demo-map";

const { lat, lng } = DEMO_MAP_CENTER;

/**
 * Three fictional neighborhoods clustered around the demo map center.
 * Seed averages are snapshots; use ranking helpers for live calculations.
 */
export const MOCK_NEIGHBORHOODS: Neighborhood[] = [
  {
    id: "willow-grove",
    name: "Willow Grove",
    description:
      "Tree-lined demo streets with porch lights and a classic suburban Halloween vibe.",
    bounds: {
      north: lat + 0.004,
      south: lat - 0.001,
      east: lng + 0.004,
      west: lng - 0.002,
    },
    houseCount: 4,
    // Snapshot from seed houses; recompute with rankNeighborhoodsByAverage for live views.
    averageOverall: 4.2,
  },
  {
    id: "moonlit-hollow",
    name: "Moonlit Hollow",
    description:
      "Quieter cul-de-sacs with fog machines, lanterns, and big full-size candy energy.",
    bounds: {
      north: lat + 0.001,
      south: lat - 0.004,
      east: lng + 0.001,
      west: lng - 0.005,
    },
    houseCount: 4,
    averageOverall: 4.0,
  },
  {
    id: "candlewick-crossing",
    name: "Candlewick Crossing",
    description:
      "A busy demo corridor of themed yards, candy tables, and competitive porch setups.",
    bounds: {
      north: lat + 0.003,
      south: lat - 0.002,
      east: lng + 0.006,
      west: lng + 0.001,
    },
    houseCount: 4,
    averageOverall: 4.2,
  },
];

export function getNeighborhoodById(
  id: string,
): Neighborhood | undefined {
  return MOCK_NEIGHBORHOODS.find((neighborhood) => neighborhood.id === id);
}

export function getAllNeighborhoods(): Neighborhood[] {
  return [...MOCK_NEIGHBORHOODS];
}
