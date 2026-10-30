"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { DEMO_MAP_CENTER } from "@/data";
import { distanceMeters } from "@/lib/geo";
import { getMapHouses, subscribeMapHouses } from "@/lib/map-houses";
import { CANDY_TAG_LABELS, CANDY_TYPE_LABELS, type House } from "@/types";
import { getNeighborhoodById } from "@/data";
import { PINNED_NEIGHBORHOOD_ID } from "@/lib/user-houses";
import { HouseCard } from "@/components/house/HouseCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListSkeleton } from "@/components/ui/ListSkeleton";

const EMPTY_HOUSES: House[] = [];

function placeName(neighborhoodId: string): string {
  if (neighborhoodId === PINNED_NEIGHBORHOOD_ID) {
    return "Pinned location";
  }

  return getNeighborhoodById(neighborhoodId)?.name ?? "Pinned location";
}

function searchText(house: House): string {
  const tags = (house.candyTags ?? []).map((tag) => CANDY_TAG_LABELS[tag]).join(" ");
  const types = house.candyTypes.map((type) => CANDY_TYPE_LABELS[type]).join(" ");
  return `${house.name} ${house.address} ${placeName(house.neighborhoodId)} ${tags} ${types}`.toLowerCase();
}

export function NearbyScreen() {
  const ready = useSyncExternalStore(subscribeMapHouses, () => true, () => false);
  const houses = useSyncExternalStore(subscribeMapHouses, getMapHouses, () => EMPTY_HOUSES);
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matched = needle
      ? houses.filter((house) => searchText(house).includes(needle))
      : houses;

    return [...matched].sort(
      (a, b) =>
        distanceMeters(a, DEMO_MAP_CENTER) - distanceMeters(b, DEMO_MAP_CENTER),
    );
  }, [houses, query]);

  return (
    <main className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto flex w-full max-w-lg flex-col px-4 py-4 pb-8">
        <h1 className="font-display text-4xl leading-none text-foreground">Nearby</h1>
        <p className="mt-2 text-sm text-foreground/70">
          Demo houses around Willow Grove, closest first.
        </p>

        <label htmlFor="nearby-search" className="sr-only">
          Search houses
        </label>
        <input
          id="nearby-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search houses or candy"
          className="mt-4 min-h-11 w-full rounded-xl border border-candy-orange/30 bg-candy-purple/25 px-3 text-base text-foreground outline-none placeholder:text-foreground/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-candy-orange"
        />

        {!ready ? (
          <div className="mt-4">
            <ListSkeleton />
          </div>
        ) : houses.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              emoji="🎃"
              title="No houses nearby"
              description="The demo map does not have any stops yet."
            />
          </div>
        ) : visible.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              emoji="🔍"
              title="No houses match"
              description="Try another name, street, or candy."
            />
          </div>
        ) : (
          <ul className="mt-4 list-none space-y-3">
            {visible.map((house) => (
              <HouseCard
                key={house.id}
                house={house}
                distanceMeters={distanceMeters(house, DEMO_MAP_CENTER)}
              />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
