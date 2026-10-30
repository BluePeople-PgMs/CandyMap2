import Link from "next/link";
import { getNeighborhoodById } from "@/data";
import { PINNED_NEIGHBORHOOD_ID } from "@/lib/user-houses";
import type { House } from "@/types";
import { CandyChips } from "@/components/ui/CandyChips";
import { CandyTagChips } from "@/components/ui/CandyTagChips";
import { ScoreBadge } from "@/components/ui/ScoreBadge";

function placeName(neighborhoodId: string): string {
  if (neighborhoodId === PINNED_NEIGHBORHOOD_ID) {
    return "Pinned location";
  }

  return getNeighborhoodById(neighborhoodId)?.name ?? "Pinned location";
}

function formatDistance(meters: number): string {
  if (!Number.isFinite(meters)) {
    return "";
  }

  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  return `${(meters / 1000).toFixed(1)} km`;
}

type HouseCardProps = {
  house: House;
  distanceMeters?: number;
  rank?: number;
};

export function HouseCard({ house, distanceMeters, rank }: HouseCardProps) {
  const tags = house.candyTags ?? [];
  const distance = distanceMeters === undefined ? "" : formatDistance(distanceMeters);

  return (
    <li>
      <Link
        href={`/houses/${house.id}`}
        className="block rounded-2xl border border-candy-orange/25 bg-candy-purple/30 px-4 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candy-orange"
      >
        <div className="flex items-start gap-3">
          {rank ? (
            <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-candy-orange text-sm font-semibold text-candy-black">
              {rank}
            </span>
          ) : (
            <p className="text-3xl leading-none" aria-hidden="true">
              {house.photoEmoji || "🎃"}
            </p>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h2 className="truncate font-display text-2xl leading-none text-foreground">
                {house.name}
              </h2>
              {distance ? (
                <p className="shrink-0 text-xs text-foreground/60">{distance}</p>
              ) : null}
            </div>
            <p className="mt-1 truncate text-sm text-foreground/70">{placeName(house.neighborhoodId)}</p>
            <div className="mt-2">
              <ScoreBadge overall={house.averages.overall} ratingCount={house.ratingCount} />
            </div>
            <div className="mt-2">
              {tags.length > 0 ? (
                <CandyTagChips tags={tags} />
              ) : (
                <CandyChips types={house.candyTypes} />
              )}
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
}
