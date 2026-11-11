"use client";

import { useId, useState } from "react";
import { submitHouseRating } from "@/lib/map-houses";
import { Sheet } from "@/components/ui/Sheet";
import { StarRatingPicker } from "@/components/ui/StarRatingPicker";

const COMMENT_LIMIT = 280;

export function RatingSheet({ houseId }: { houseId: string }) {
  const titleId = useId();
  const qualityId = useId();
  const varietyId = useId();
  const quantityId = useId();
  const commentId = useId();
  const commentCounterId = useId();
  const [open, setOpen] = useState(false);
  const [quality, setQuality] = useState(0);
  const [variety, setVariety] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const ready = quality >= 1 && variety >= 1 && quantity >= 1;
  const charactersRemaining = COMMENT_LIMIT - comment.length;
  const nearLimit = charactersRemaining <= 20;

  function resetForm() {
    setQuality(0);
    setVariety(0);
    setQuantity(0);
    setComment("");
    setError(null);
    setSaving(false);
  }

  function close() {
    setOpen(false);
    resetForm();
  }

  return (
    <div className="mt-5">
      {status ? (
        <p role="status" className="mb-3 text-sm text-candy-orange">
          {status}
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => {
          setStatus(null);
          setOpen(true);
        }}
        className="flex min-h-11 w-full items-center justify-center rounded-xl bg-candy-orange px-4 text-sm font-semibold text-candy-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        Rate this house
      </button>
      <p className="mt-2 text-center text-xs text-foreground/55">
        Saved on this device only. No account needed.
      </p>

      {open ? (
        <Sheet title="Rate this house" titleId={titleId} onClose={close}>
          <form
            className="mt-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!ready || saving) {
                return;
              }

              setSaving(true);
              setError(null);
              const saved = submitHouseRating({
                houseId,
                quality,
                variety,
                quantity,
                comment,
              });
              setSaving(false);

              if (!saved) {
                setError("This browser could not store the rating. Check that every score is 1 to 5.");
                return;
              }

              setStatus("Rating saved on this device.");
              close();
            }}
          >
            <p className="text-sm text-foreground/75">
              Score candy quality, variety, and quantity. A comment is optional.
            </p>

            <fieldset className="mt-4">
              <legend id={qualityId} className="text-sm font-medium text-foreground">
                Quality
              </legend>
              <StarRatingPicker value={quality} onChange={setQuality} labelledBy={qualityId} />
            </fieldset>
            <fieldset className="mt-3">
              <legend id={varietyId} className="text-sm font-medium text-foreground">
                Variety
              </legend>
              <StarRatingPicker value={variety} onChange={setVariety} labelledBy={varietyId} />
            </fieldset>
            <fieldset className="mt-3">
              <legend id={quantityId} className="text-sm font-medium text-foreground">
                Quantity
              </legend>
              <StarRatingPicker value={quantity} onChange={setQuantity} labelledBy={quantityId} />
            </fieldset>

            <div className="mt-4 flex items-baseline justify-between gap-2">
              <label htmlFor={commentId} className="text-sm font-medium text-foreground">
                Comment <span className="font-normal text-foreground/55">(optional)</span>
              </label>
              <span
                id={commentCounterId}
                aria-live="polite"
                className={
                  nearLimit
                    ? "text-xs font-medium tabular-nums text-candy-orange"
                    : "text-xs tabular-nums text-foreground/55"
                }
              >
                {comment.length} / {COMMENT_LIMIT}
              </span>
            </div>
            <textarea
              id={commentId}
              value={comment}
              maxLength={COMMENT_LIMIT}
              rows={3}
              aria-describedby={commentCounterId}
              onChange={(event) => setComment(event.target.value)}
              placeholder="What did they hand out?"
              className="mt-2 w-full resize-none rounded-xl border border-white/15 bg-candy-purple/30 px-3 py-2 text-base text-foreground outline-none placeholder:text-foreground/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-candy-orange"
            />

            {error ? (
              <p role="alert" className="mt-3 text-sm text-candy-orange">
                {error}
              </p>
            ) : null}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={close}
                className="min-h-11 flex-1 rounded-xl border border-candy-orange/40 px-3 text-sm font-semibold text-candy-orange focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candy-orange"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!ready || saving}
                className="min-h-11 flex-[1.4] rounded-xl bg-candy-orange px-3 text-sm font-semibold text-candy-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:opacity-45"
              >
                {saving ? "Saving…" : "Save rating"}
              </button>
            </div>
          </form>
        </Sheet>
      ) : null}
    </div>
  );
}
