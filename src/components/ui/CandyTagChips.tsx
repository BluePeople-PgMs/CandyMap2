import { CANDY_TAG_LABELS, type CandyTag } from "@/types";

export function CandyTagChips({ tags }: { tags: readonly CandyTag[] }) {
  if (tags.length === 0) {
    return <p className="text-sm text-foreground/60">No candy listed yet.</p>;
  }

  return (
    <ul className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <li
          key={tag}
          className="rounded-full border border-candy-orange/40 bg-candy-purple/80 px-2.5 py-1 text-xs font-medium text-foreground"
        >
          {CANDY_TAG_LABELS[tag]}
        </li>
      ))}
    </ul>
  );
}
