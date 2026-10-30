"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Component, useState, type ReactNode } from "react";
import { getSeedHouses } from "@/lib";
import { MapLoading } from "@/components/map/MapLoading";

// Leaflet reads `window` while it starts. Load the map only in the browser
// so the server render stays a simple loading state.
const CandyMapCanvas = dynamic(() => import("@/components/map/CandyMapCanvas"), {
  ssr: false,
  loading: () => <MapLoading />,
});

type BoundaryProps = {
  children: ReactNode;
  onRetry: () => void;
};

type BoundaryState = {
  hasError: boolean;
};

class MapErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <MapFallback onRetry={this.props.onRetry} />;
    }

    return this.props.children;
  }
}

function MapFallback({ onRetry }: { onRetry: () => void }) {
  const houses = getSeedHouses();

  return (
    <div className="absolute inset-0 flex flex-col items-center overflow-y-auto bg-[radial-gradient(circle_at_top,_#4a1d8a_0%,_#1a0b33_42%,_#050308_100%)] px-6 py-10 text-center">
      <p className="text-4xl" aria-hidden="true">
        🎃
      </p>
      <h2 className="mt-3 font-display text-4xl text-foreground">Map unavailable</h2>
      <p className="mt-3 max-w-sm text-sm text-foreground/75">
        The map could not start. You can still open a house from the list.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-candy-orange px-5 text-sm font-semibold text-candy-black"
      >
        Try again
      </button>
      {houses.length === 0 ? (
        <p className="mt-6 text-sm text-foreground/70">No houses to show yet.</p>
      ) : (
        <ul className="mt-6 w-full max-w-sm space-y-2 text-left">
          {houses.map((house) => (
            <li key={house.id}>
              <Link
                href={`/houses/${house.id}`}
                className="flex min-h-11 items-center rounded-xl border border-candy-orange/25 bg-candy-black/70 px-3 text-sm text-foreground"
              >
                <span className="mr-2" aria-hidden="true">
                  {house.photoEmoji || "🎃"}
                </span>
                {house.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CandyMap() {
  const [resetKey, setResetKey] = useState(0);

  return (
    <main className="relative min-h-0 flex-1 overflow-hidden overscroll-none">
      <h1 className="sr-only">Halloween candy map</h1>
      <MapErrorBoundary key={resetKey} onRetry={() => setResetKey((value) => value + 1)}>
        <CandyMapCanvas />
      </MapErrorBoundary>
    </main>
  );
}
