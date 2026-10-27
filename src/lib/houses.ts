import type { House } from "../types";

/** Return a shallow-copied list of houses. */
export function getAllHouses(houses: readonly House[]): House[] {
  return houses.map((house) => ({
    ...house,
    averages: { ...house.averages },
    candyTypes: [...house.candyTypes],
    comments: house.comments.map((comment) => ({ ...comment })),
  }));
}

export function getHouseById(
  id: string,
  houses: readonly House[],
): House | undefined {
  const match = houses.find((house) => house.id === id);
  if (!match) {
    return undefined;
  }

  return {
    ...match,
    averages: { ...match.averages },
    candyTypes: [...match.candyTypes],
    comments: match.comments.map((comment) => ({ ...comment })),
  };
}

export function getHousesByNeighborhood(
  neighborhoodId: string,
  houses: readonly House[],
): House[] {
  return getAllHouses(houses).filter(
    (house) => house.neighborhoodId === neighborhoodId,
  );
}
