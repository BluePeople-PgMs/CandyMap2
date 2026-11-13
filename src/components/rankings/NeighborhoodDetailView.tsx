"use client";

import { useMemo, useSyncExternalStore } from "react";
import { getNeighborhoodById } from "@/data";
import { getMapHouses, subscribeMapHouses } from "@/lib/map-houses";
import { formatHouseCount } from "@/lib/copy";
import {
  computeNeighborhoodStats,
  neighborhoodHasRatedHouses,
  rankHousesByRating,
} from "@/lib/rankings";
import { PINNED_NEIGHBORHOOD_ID } from "@/lib/user-houses";
import type { House, Neighborhood } from "@/types";
import { HouseCard } from "@/components/house/HouseCard";
import { BackHeader } from "@/components/ui/BackHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListSkeleton } from "@/components/ui/ListSkeleton";

const EMPTY_HOUSES: House[] = [];

const PINNED_NEIGHBORHOOD: Neighborhood = {
  id: PINNED_NEIGHBORHOOD_ID,
  name: "Pinned locations",
  description: "Houses saved on this device that sit outside the demo neighborhoods.",
  bounds: { north: 0, south: 0, east: 0, west: 0 },
  houseCount: 0,
  averageOverall: 0,
};

export function NeighborhoodDetailView({ neighborhoodId }: { neighborhoodId: string }) {
  const ready = useSyncExternalStore(subscribeMapHouses, () => true, () => false);
  const houses = useSyncExternalStore(subscribeMapHouses, getMapHouses, () => EMPTY_HOUSES);

  const neighborhood =
    getNeighborhoodById(neighborhoodId) ??
    (neighborhoodId === PINNED_NEIGHBORHOOD_ID ? PINNED_NEIGHBORHOOD : undefined);

  const members = useMemo(
    () =>
      rankHousesByRating(
        houses.filter((house) => house.neighborhoodId === neighborhoodId),
      ),
    [houses, neighborhoodId],
  );

  const stats = neighborhood ? computeNeighborhoodStats(neighborhood, houses) : null;

  return (
    <main className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-lg flex-col px-4 py-4 pb-8">
        <BackHeader href="/rankings" label="Rankings" />

        {!neighborhood ? (
          <div className="mt-6">
            <EmptyState
              emoji="👻"
              title="Neighborhood not found"
              description="That area is not part of the demo map."
            />
          </div>
        ) : (
          <>
            <h1 className="mt-6 font-display text-4xl leading-none text-foreground">
              {neighborhood.name}
            </h1>
            <p className="mt-3 text-sm text-foreground/75">{neighborhood.description}</p>
            {stats &&
            members.length > 0 &&
            neighborhoodHasRatedHouses(neighborhoodId, houses) ? (
              <p className="mt-3 text-sm font-semibold text-candy-orange">
                {stats.averageOverall.toFixed(1)} overall
              </p>
            ) : members.length > 0 ? (
              <p className="mt-3 text-sm text-foreground/50">No ratings yet</p>
            ) : null}

            {!ready ? (
              <div className="mt-5">
                <ListSkeleton />
              </div>
            ) : members.length === 0 ? (
              <div className="mt-5">
                <EmptyState
                  emoji="🏠"
                  title="No houses here"
                  description="This neighborhood does not have any stops yet."
                />
              </div>
            ) : (
              <>
                <h2 className="mt-5 text-xs font-semibold uppercase tracking-wide text-foreground/50">
                  {formatHouseCount(members.length)}
                </h2>
                <ul className="mt-3 list-none space-y-3">
                  {members.map((house) => (
                    <HouseCard key={house.id} house={house} />
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
