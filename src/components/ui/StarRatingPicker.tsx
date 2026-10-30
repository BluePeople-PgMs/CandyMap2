const STAR_VALUES = [1, 2, 3, 4, 5] as const;

type StarRatingPickerProps = {
  value: number;
  onChange: (stars: number) => void;
  labelledBy: string;
};

export function StarRatingPicker({ value, onChange, labelledBy }: StarRatingPickerProps) {
  function changeBy(step: number) {
    const current = value >= 1 ? value : 0;
    const next = Math.min(5, Math.max(1, current + step));
    onChange(next);
  }

  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      className="mt-2 flex gap-1"
      onKeyDown={(event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowUp") {
          event.preventDefault();
          changeBy(1);
        }
        if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
          event.preventDefault();
          changeBy(-1);
        }
      }}
    >
      {STAR_VALUES.map((star) => {
        const selected = star <= value;
        const tabbable = value === 0 ? star === 1 : value === star;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            tabIndex={tabbable ? 0 : -1}
            onClick={() => onChange(star)}
            className={
              selected
                ? "flex h-11 w-11 items-center justify-center rounded-full bg-candy-orange text-lg text-candy-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                : "flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-lg text-foreground/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-candy-orange"
            }
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
