"use client";

import { useEffect, useId, useRef, useState } from "react";
import { formatHouseName } from "@/lib";
import { CANDY_TAGS, CANDY_TAG_LABELS, type CandyTag } from "@/types";
import { StarRatingPicker } from "@/components/ui/StarRatingPicker";

type LookupState = "loading" | "ready" | "manual";

type AddHouseSheetProps = {
  lat: number;
  lng: number;
  error: string | null;
  onCancel: () => void;
  onSave: (input: {
    streetNumber: string;
    streetName: string;
    candyTags: CandyTag[];
    stars: number;
  }) => void;
};

function problemsFor(streetNumber: string, streetName: string, stars: number, tags: readonly CandyTag[]) {
  const problems: string[] = [];
  if (!formatHouseName(streetNumber, streetName)) {
    problems.push("Enter the street number and street name.");
  }
  if (stars < 1 || stars > 5) {
    problems.push("Choose a rating from 1 to 5 stars.");
  }
  if (tags.length === 0) {
    problems.push("Choose at least one candy tag.");
  }
  return problems;
}

export function AddHouseSheet({ lat, lng, error, onCancel, onSave }: AddHouseSheetProps) {
  const titleId = useId();
  const numberId = useId();
  const streetId = useId();
  const ratingLabelId = useId();
  const pinKey = `${lat},${lng}`;
  const [trackedPin, setTrackedPin] = useState(pinKey);
  const [streetNumber, setStreetNumber] = useState("");
  const [streetName, setStreetName] = useState("");
  const [lookup, setLookup] = useState<LookupState>("loading");
  const [stars, setStars] = useState(0);
  const [tags, setTags] = useState<CandyTag[]>([]);
  const [attempted, setAttempted] = useState(false);
  const editedRef = useRef(false);

  if (trackedPin !== pinKey) {
    setTrackedPin(pinKey);
    setStreetNumber("");
    setStreetName("");
    setLookup("loading");
  }

  useEffect(() => {
    editedRef.current = false;
  }, [pinKey]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    fetch(`/api/address?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }
        return (await response.json()) as { streetNumber?: unknown; streetName?: unknown };
      })
      .then((data) => {
        if (!active) {
          return;
        }
        if (editedRef.current) {
          setLookup("ready");
          return;
        }

        const nextNumber = typeof data?.streetNumber === "string" ? data.streetNumber : "";
        const nextStreet = typeof data?.streetName === "string" ? data.streetName : "";
        setStreetNumber(nextNumber);
        setStreetName(nextStreet);
        setLookup(nextNumber && nextStreet ? "ready" : "manual");
      })
      .catch((fetchError: unknown) => {
        if (!active || (fetchError instanceof DOMException && fetchError.name === "AbortError")) {
          return;
        }
        setLookup(editedRef.current ? "ready" : "manual");
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [lat, lng]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  const houseName = formatHouseName(streetNumber, streetName);
  const problems = attempted ? problemsFor(streetNumber, streetName, stars, tags) : [];
  const addressHint =
    lookup === "loading"
      ? "Looking up the street address…"
      : houseName
        ? "Confirm the address. You can correct the number or street."
        : "We could not detect the full address. Enter the street number and street name.";

  const editAddress = (nextNumber: string, nextStreet: string) => {
    editedRef.current = true;
    setStreetNumber(nextNumber);
    setStreetName(nextStreet);
  };

  const toggleTag = (tag: CandyTag) => {
    setTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-3 pb-3">
      <form
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        className="candy-sheet pointer-events-auto flex max-h-[75%] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-candy-orange/35 bg-candy-black/95 shadow-[0_-12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md"
        onSubmit={(event) => {
          event.preventDefault();
          const nextProblems = problemsFor(streetNumber, streetName, stars, tags);
          if (nextProblems.length > 0) {
            setAttempted(true);
            return;
          }

          onSave({ streetNumber, streetName, candyTags: tags, stars });
        }}
      >
        <div className="overflow-y-auto px-4 pt-4">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-foreground/25" aria-hidden="true" />
          <div className="flex items-start gap-3">
            <p className="text-3xl leading-none" aria-hidden="true">
              🎃
            </p>
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="font-display text-2xl leading-none text-foreground">
                Add a house
              </h2>
              <p className="mt-1 text-sm text-foreground/70">{addressHint}</p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Cancel adding house"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl text-foreground/70 hover:bg-white/5 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candy-orange"
            >
              ×
            </button>
          </div>

          <div className="mt-4 grid grid-cols-[6.5rem_1fr] gap-2">
            <div>
              <label htmlFor={numberId} className="block text-sm font-medium text-foreground">
                Number
              </label>
              <input
                id={numberId}
                value={streetNumber}
                inputMode="text"
                autoComplete="off"
                maxLength={12}
                onChange={(event) => editAddress(event.target.value, streetName)}
                className="mt-1.5 w-full rounded-xl border border-candy-orange/30 bg-candy-black px-3 py-3 text-base text-foreground outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candy-orange"
              />
            </div>
            <div>
              <label htmlFor={streetId} className="block text-sm font-medium text-foreground">
                Street
              </label>
              <input
                id={streetId}
                value={streetName}
                autoComplete="off"
                maxLength={60}
                onChange={(event) => editAddress(streetNumber, event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-candy-orange/30 bg-candy-black px-3 py-3 text-base text-foreground outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candy-orange"
              />
            </div>
          </div>

          <p className="mt-2 text-sm text-foreground" aria-live="polite">
            {houseName ? `House name: ${houseName}` : "House name appears when both fields are filled."}
          </p>
          <p className="mt-1 text-xs text-foreground/55">
            Pin stays at {lat.toFixed(5)}, {lng.toFixed(5)}.
          </p>

          <div className="mt-4">
            <p id={ratingLabelId} className="text-sm font-medium text-foreground">
              First rating
            </p>
            <p className="mt-1 text-xs text-foreground/55">Required. This becomes review 1.</p>
            <StarRatingPicker value={stars} onChange={setStars} labelledBy={ratingLabelId} />
          </div>

          <fieldset className="mt-4">
            <legend className="text-sm font-medium text-foreground">Candy tags</legend>
            <p className="mt-1 text-xs text-foreground/55">Choose at least one.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {CANDY_TAGS.map((tag) => {
                const selected = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleTag(tag)}
                    className={
                      selected
                        ? "min-h-11 rounded-full border border-candy-orange bg-candy-orange px-3 text-sm font-semibold text-candy-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                        : "min-h-11 rounded-full border border-white/15 bg-white/5 px-3 text-sm text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candy-orange"
                    }
                  >
                    {CANDY_TAG_LABELS[tag]}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <p className="mt-3 text-xs text-foreground/55">Saved on this phone or computer only.</p>
          {problems.length > 0 ? (
            <ul role="alert" className="mt-2 space-y-1 text-sm text-candy-orange">
              {problems.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          ) : null}
          {error ? (
            <p role="alert" className="mt-2 text-sm text-candy-orange">
              {error}
            </p>
          ) : null}
        </div>

        <div className="sticky bottom-0 flex gap-2 bg-candy-black/95 px-4 pt-3 pb-4">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-11 flex-1 rounded-xl border border-candy-orange/40 px-4 text-sm font-semibold text-candy-orange focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candy-orange"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="min-h-11 flex-[1.4] rounded-xl bg-candy-orange px-4 text-sm font-semibold text-candy-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            Save house
          </button>
        </div>
      </form>
    </div>
  );
}
