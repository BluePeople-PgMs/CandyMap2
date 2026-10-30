import { CANDY_TYPE_LABELS, type CandyType } from "@/types";

export function CandyChips({ types }: { types: readonly CandyType[] }) {
  if (types.length === 0) {
    return <p className="text-sm text-foreground/60">No candy listed yet.</p>;
  }

  return (
    <ul className="flex flex-wrap gap-1.5">
      {types.map((type) => (
        <li
          key={type}
          className="rounded-full border border-candy-orange/35 bg-candy-purple/70 px-2.5 py-1 text-xs text-foreground"
        >
          {CANDY_TYPE_LABELS[type]}
        </li>
      ))}
    </ul>
  );
}
