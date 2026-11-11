"use client";

import { useId, useState } from "react";
import { isValidStarRatingScore, scoresFromStars } from "@/lib/ratings";
import { submitHouseRating } from "@/lib/map-houses";
import { Sheet } from "@/components/ui/Sheet";
import { StarRatingPicker } from "@/components/ui/StarRatingPicker";

const COMMENT_LIMIT = 280;

export function RatingSheet({ houseId }: { houseId: string }) {
  const titleId = useId();
  const ratingId = useId();
  const commentId = useId();
  const [open, setOpen] = useState(false);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const hasRequiredRatings = isValidStarRatingScore(stars);
  const trimmedComment = comment.trim();

  function resetForm() {
    setStars(0);
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
            className="mt-4 flex flex-col pb-1"
            onSubmit={(event) => {
              event.preventDefault();
              if (!hasRequiredRatings || saving) {
                return;
              }

              setSaving(true);
              setError(null);
              const scores = scoresFromStars(stars);
              const saved = submitHouseRating({
                houseId,
                ...scores,
                comment: trimmedComment || undefined,
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
            <div className="min-h-0 max-h-[min(52dvh,26rem)] overflow-y-auto overscroll-y-contain pr-0.5 touch-pan-y">
              <p className="text-sm text-foreground/75">
                Choose a star rating from 1 to 5. A comment is optional.
              </p>

              <fieldset className="mt-4">
                <legend id={ratingId} className="text-sm font-medium text-foreground">
                  Rating <span className="font-normal text-foreground/55">(required)</span>
                </legend>
                <StarRatingPicker value={stars} onChange={setStars} labelledBy={ratingId} />
              </fieldset>

              <label htmlFor={commentId} className="mt-4 block text-sm font-medium text-foreground">
                Comment <span className="font-normal text-foreground/55">(optional)</span>
              </label>
              <textarea
                id={commentId}
                value={comment}
                maxLength={COMMENT_LIMIT}
                rows={3}
                onChange={(event) => setComment(event.target.value)}
                placeholder="What did they hand out?"
                className="mt-2 w-full resize-none rounded-xl border border-white/15 bg-candy-purple/30 px-3 py-2 text-base text-foreground outline-none placeholder:text-foreground/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-candy-orange"
              />

              {error ? (
                <p role="alert" className="mt-3 text-sm text-candy-orange">
                  {error}
                </p>
              ) : null}
            </div>

            <div className="mt-4 flex shrink-0 gap-2 border-t border-white/10 bg-candy-black pt-4">
              <button
                type="button"
                onClick={close}
                className="min-h-11 flex-1 rounded-xl border border-candy-orange/40 px-3 text-sm font-semibold text-candy-orange focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candy-orange"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!hasRequiredRatings || saving}
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
