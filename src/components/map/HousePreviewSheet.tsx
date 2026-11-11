"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { getNeighborhoodById } from "@/data";
import { PINNED_NEIGHBORHOOD_ID } from "@/lib";
import type { House } from "@/types";
import { RatingSheet } from "@/components/house/RatingSheet";
import { CandyChips } from "@/components/ui/CandyChips";
import { CandyTagChips } from "@/components/ui/CandyTagChips";
import { CopyAddressButton } from "@/components/ui/CopyAddressButton";
import { ScoreBadge } from "@/components/ui/ScoreBadge";

type HousePreviewSheetProps = {
  house: House;
  onClose: () => void;
};

function placeName(neighborhoodId: string): string {
  if (neighborhoodId === PINNED_NEIGHBORHOOD_ID) {
    return "Pinned location";
  }

  return getNeighborhoodById(neighborhoodId)?.name ?? "Pinned location";
}

export function HousePreviewSheet({ house, onClose }: HousePreviewSheetProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const tags = house.candyTags ?? [];

  useEffect(() => {
    dialogRef.current?.focus();
  }, [house.id]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-3 pb-3">
      <section
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="false"
        aria-labelledby="house-preview-title"
        className="candy-sheet pointer-events-auto max-h-[68%] w-full max-w-lg overflow-y-auto rounded-2xl border border-candy-orange/35 bg-candy-black/95 p-4 shadow-[0_-12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md outline-none"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-foreground/25" aria-hidden="true" />
        <div className="flex items-start gap-3">
          <p className="text-3xl leading-none" aria-hidden="true">
            {house.photoEmoji || "🎃"}
          </p>
          <div className="min-w-0 flex-1">
            <h2 id="house-preview-title" className="truncate font-display text-2xl leading-none text-foreground">
              {house.name}
            </h2>
            <div className="mt-2 flex items-start gap-2">
              <p className="min-w-0 flex-1 text-sm text-foreground/70">{house.address}</p>
              <CopyAddressButton address={house.address} />
            </div>
            <p className="mt-1 text-sm text-foreground/60">{placeName(house.neighborhoodId)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close house preview"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl text-foreground/70 hover:bg-white/5 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candy-orange"
          >
            ×
          </button>
        </div>

        <div className="mt-3">
          <ScoreBadge overall={house.averages.overall} ratingCount={house.ratingCount} />
        </div>

        <div className="mt-3">
          {tags.length > 0 ? <CandyTagChips tags={tags} /> : <CandyChips types={house.candyTypes} />}
        </div>

        <RatingSheet key={house.id} houseId={house.id} />

        <Link
          href={`/houses/${house.id}`}
          className="mt-2 flex min-h-11 items-center justify-center rounded-xl border border-candy-orange/40 px-4 text-sm font-semibold text-candy-orange focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          View House
        </Link>
      </section>
    </div>
  );
}
