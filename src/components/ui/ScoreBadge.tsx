type ScoreBadgeProps = {
  overall: number;
  ratingCount: number;
};

function starFillPercent(overall: number): number {
  if (!Number.isFinite(overall)) {
    return 0;
  }

  return Math.max(0, Math.min(100, (overall / 5) * 100));
}

/** Read-only overall score. Does not invent or recalculate ratings. */
export function ScoreBadge({ overall, ratingCount }: ScoreBadgeProps) {
  const countLabel = ratingCount === 1 ? "1 review" : `${ratingCount} reviews`;

  if (ratingCount <= 0) {
    return <p className="text-sm text-foreground/70">No reviews yet</p>;
  }

  const shown = Number.isFinite(overall) ? overall.toFixed(1) : "–";
  const label = `${shown} out of 5, ${countLabel}`;

  return (
    <p className="flex flex-wrap items-center gap-2 text-sm" aria-label={label}>
      <span className="relative inline-block text-base leading-none" aria-hidden="true">
        <span className="text-foreground/25">★★★★★</span>
        <span
          className="absolute inset-y-0 left-0 overflow-hidden text-candy-orange"
          style={{ width: `${starFillPercent(overall)}%` }}
        >
          ★★★★★
        </span>
      </span>
      <span className="font-semibold text-candy-orange" aria-hidden="true">
        {shown}
      </span>
      <span className="text-foreground/55" aria-hidden="true">
        / 5
      </span>
      <span className="text-foreground/70" aria-hidden="true">
        · {countLabel}
      </span>
    </p>
  );
}
