"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { getMapHouses, subscribeMapHouses } from "@/lib/map-houses";
import { rankHousesByRating, rankNeighborhoodsByAverage } from "@/lib/rankings";
import { getSeedNeighborhoods } from "@/lib/catalog";
import { PINNED_NEIGHBORHOOD_ID } from "@/lib/user-houses";
import type { House, Neighborhood } from "@/types";
import { HouseCard } from "@/components/house/HouseCard";
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

export function RankingsScreen() {
  const ready = useSyncExternalStore(subscribeMapHouses, () => true, () => false);
  const houses = useSyncExternalStore(subscribeMapHouses, getMapHouses, () => EMPTY_HOUSES);
  const [tab, setTab] = useState<"neighborhoods" | "houses">("neighborhoods");

  const neighborhoods = useMemo(() => {
    const base = getSeedNeighborhoods();
    const hasPinned = houses.some((house) => house.neighborhoodId === PINNED_NEIGHBORHOOD_ID);
    const list = hasPinned ? [...base, PINNED_NEIGHBORHOOD] : base;
    return rankNeighborhoodsByAverage(list, houses);
  }, [houses]);

  const topHouses = useMemo(
    () => rankHousesByRating(houses).filter((house) => house.ratingCount > 0),
    [houses],
  );
  const hasRatings = houses.some((house) => house.ratingCount > 0);

  return (
    <main className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-lg flex-col px-4 py-4 pb-8">
        <h1 className="font-display text-4xl leading-none text-foreground">Rankings</h1>
        <p className="mt-2 text-sm text-foreground/70">
          Neighborhoods and houses, scored from candy ratings on this device.
        </p>

        <div
          role="tablist"
          aria-label="Ranking lists"
          className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-candy-purple/25 p-1"
        >
          <button
            type="button"
            role="tab"
            id="tab-neighborhoods"
            aria-selected={tab === "neighborhoods"}
            aria-controls="panel-neighborhoods"
            onClick={() => setTab("neighborhoods")}
            className={`min-h-11 rounded-xl text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candy-orange ${
              tab === "neighborhoods"
                ? "bg-candy-orange text-candy-black"
                : "text-foreground/75"
            }`}
          >
            Neighborhoods
          </button>
          <button
            type="button"
            role="tab"
            id="tab-houses"
            aria-selected={tab === "houses"}
            aria-controls="panel-houses"
            onClick={() => setTab("houses")}
            className={`min-h-11 rounded-xl text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candy-orange ${
              tab === "houses" ? "bg-candy-orange text-candy-black" : "text-foreground/75"
            }`}
          >
            Top houses
          </button>
        </div>

        {!ready ? (
          <div className="mt-4">
            <ListSkeleton />
          </div>
        ) : tab === "neighborhoods" ? (
          <div
            role="tabpanel"
            id="panel-neighborhoods"
            aria-labelledby="tab-neighborhoods"
            className="mt-4"
          >
            {!hasRatings ? (
              <EmptyState
                emoji="🏆"
                title="No rankings yet"
                description="Rate a house to start the neighborhood leaderboard."
              />
            ) : (
              <ol className="list-none space-y-3">
                {neighborhoods.map((neighborhood) => (
                  <li key={neighborhood.id}>
                    <Link
                      href={`/neighborhoods/${neighborhood.id}`}
                      className="flex min-h-11 items-center gap-3 rounded-2xl border border-candy-orange/25 bg-candy-purple/30 px-4 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candy-orange"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-candy-orange text-sm font-semibold text-candy-black">
                        {neighborhood.rank}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-display text-2xl leading-none text-foreground">
                          {neighborhood.name}
                        </span>
                        <span className="mt-1 block text-xs text-foreground/60">
                          {neighborhood.houseCount}{" "}
                          {neighborhood.houseCount === 1 ? "house" : "houses"}
                        </span>
                      </span>
                      <span className="text-sm font-semibold text-candy-orange">
                        {neighborhood.averageOverall.toFixed(1)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </div>
        ) : (
          <div role="tabpanel" id="panel-houses" aria-labelledby="tab-houses" className="mt-4">
            {topHouses.length === 0 ? (
              <EmptyState
                emoji="🍬"
                title="No rated houses"
                description="Top houses show up here after the first rating."
              />
            ) : (
              <ol className="list-none space-y-3">
                {topHouses.map((house, index) => (
                  <HouseCard key={house.id} house={house} rank={index + 1} />
                ))}
              </ol>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
