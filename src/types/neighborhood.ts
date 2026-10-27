/** Geographic bounding box hint for a neighborhood cluster on the map. */
export type GeoBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

/**
 * A fictional Halloween neighborhood used for rankings and map grouping.
 * `houseCount` / `averageOverall` are seed snapshots; recompute from houses for live views.
 */
export type Neighborhood = {
  id: string;
  name: string;
  description: string;
  bounds: GeoBounds;
  houseCount: number;
  averageOverall: number;
};

/** Neighborhood with live stats derived from the current house list. */
export type RankedNeighborhood = Neighborhood & {
  rank: number;
};
