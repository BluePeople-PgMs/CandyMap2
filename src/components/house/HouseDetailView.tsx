"use client";

import { useSyncExternalStore } from "react";
import { getNeighborhoodById } from "@/data";
import { getMapHouses, PINNED_NEIGHBORHOOD_ID, subscribeMapHouses } from "@/lib";
import type { House } from "@/types";
import { RatingSheet } from "@/components/house/RatingSheet";
import { BackHeader } from "@/components/ui/BackHeader";
import { CandyChips } from "@/components/ui/CandyChips";
import { CandyTagChips } from "@/components/ui/CandyTagChips";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListSkeleton } from "@/components/ui/ListSkeleton";
import { ScoreBadge } from "@/components/ui/ScoreBadge";

const EMPTY_HOUSES: House[] = [];

function readServerHouses(): House[] {
  return EMPTY_HOUSES;
}

function placeName(neighborhoodId: string): string {
  if (neighborhoodId === PINNED_NEIGHBORHOOD_ID) {
    return "Pinned location";
  }

  return getNeighborhoodById(neighborhoodId)?.name ?? "Pinned location";
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  const shown = Number.isFinite(value) ? value.toFixed(1) : "–";

  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-foreground/80">{label}</span>
      <span className="font-semibold text-candy-orange">
        {shown}
        <span className="font-normal text-foreground/50"> / 5</span>
      </span>
    </div>
  );
}

export function HouseDetailView({
  houseId,
  seed,
}: {
  houseId: string;
  seed: House | null;
}) {
  const ready = useSyncExternalStore(subscribeMapHouses, () => true, () => false);
  const houses = useSyncExternalStore(subscribeMapHouses, getMapHouses, readServerHouses);
  const live = houses.find((item) => item.id === houseId);
  const house = live ?? seed;

  if (!house) {
    if (!ready) {
      return (
        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <ListSkeleton rows={3} />
        </main>
      );
    }

    return (
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 text-center">
        <EmptyState
          emoji="👻"
          title="House not found"
          description="That stop is not on this device."
        />
      </main>
    );
  }

  const tags = house.candyTags ?? [];
  const neighborhoodName = placeName(house.neighborhoodId);

  return (
    <main className="relative min-h-0 flex-1 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_#4a1d8a_0%,_#1a0b33_42%,_#050308_100%)]"
      />
      <div className="relative h-full overflow-y-auto">
        <div className="mx-auto flex w-full max-w-lg flex-col px-4 py-4 pb-8">
          <BackHeader href="/" label="Map" />

          <p className="mt-6 text-5xl" aria-hidden="true">
            {house.photoEmoji || "🎃"}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-none text-foreground sm:text-5xl">
            {house.name}
          </h1>
          <p className="mt-3 text-sm text-foreground/80">{house.address}</p>
          <p className="mt-1 text-sm text-candy-orange">{neighborhoodName}</p>

          <div className="mt-5">
            <ScoreBadge overall={house.averages.overall} ratingCount={house.ratingCount} />
          </div>

          {house.ratingCount > 0 ? (
            <div className="mt-4 space-y-2 rounded-2xl border border-candy-orange/20 bg-candy-purple/30 px-4 py-3">
              <ScoreRow label="Quality" value={house.averages.quality} />
              <ScoreRow label="Variety" value={house.averages.variety} />
              <ScoreRow label="Quantity" value={house.averages.quantity} />
            </div>
          ) : null}

          <h2 className="mt-6 text-xs font-medium tracking-[0.16em] text-foreground/55 uppercase">
            Candy
          </h2>
          <div className="mt-2">
            {tags.length > 0 ? <CandyTagChips tags={tags} /> : <CandyChips types={house.candyTypes} />}
          </div>

          <RatingSheet houseId={house.id} />

          <h2 className="mt-8 text-xs font-medium tracking-[0.16em] text-foreground/55 uppercase">
            Comments
          </h2>
          {house.comments.length === 0 ? (
            <div className="mt-3">
              <EmptyState
                emoji="💬"
                title="No comments yet"
                description="Rate this house and leave a note about the candy."
              />
            </div>
          ) : (
            <ul className="mt-3 space-y-3">
              {house.comments.map((comment) => (
                <li
                  key={comment.id}
                  className="rounded-2xl border border-candy-orange/20 bg-candy-black/50 px-4 py-3"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{comment.authorName}</p>
                    <p className="text-xs text-foreground/55">
                      {formatWhen(comment.createdAt)}
                      {Number.isFinite(comment.overall) ? ` · ${comment.overall.toFixed(1)}` : ""}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-foreground/80">{comment.text}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
