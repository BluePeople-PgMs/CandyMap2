import { CANDY_TAG_LABELS, CANDY_TYPE_LABELS } from "../types/candy.ts";
import type { House } from "../types/index.ts";

type NeighborhoodNameResolver = (neighborhoodId: string) => string;

function searchableFields(
  house: House,
  resolveNeighborhoodName: NeighborhoodNameResolver,
): string[] {
  const fields = [
    house.name,
    house.address,
    resolveNeighborhoodName(house.neighborhoodId),
    ...house.candyTypes.map((type) => type),
    ...house.candyTypes.map((type) => CANDY_TYPE_LABELS[type]),
  ];

  const tags = house.candyTags ?? [];
  for (const tag of tags) {
    fields.push(tag, CANDY_TAG_LABELS[tag]);
  }

  return fields.map((value) => value.toLowerCase());
}

export function houseMatchesNearbySearch(
  house: House,
  query: string,
  resolveNeighborhoodName: NeighborhoodNameResolver,
): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return true;
  }

  return searchableFields(house, resolveNeighborhoodName).some((field) =>
    field.includes(needle),
  );
}

export function filterNearbyHouses(
  houses: House[],
  query: string,
  resolveNeighborhoodName: NeighborhoodNameResolver,
): House[] {
  const needle = query.trim();
  if (!needle) {
    return houses;
  }

  return houses.filter((house) =>
    houseMatchesNearbySearch(house, query, resolveNeighborhoodName),
  );
}
