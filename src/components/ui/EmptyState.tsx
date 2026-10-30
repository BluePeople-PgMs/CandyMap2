type EmptyStateProps = {
  emoji: string;
  title: string;
  description: string;
};

export function EmptyState({ emoji, title, description }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-candy-orange/30 bg-candy-purple/20 px-5 py-8 text-center">
      <p className="text-3xl" aria-hidden="true">
        {emoji}
      </p>
      <h2 className="mt-3 font-display text-2xl text-foreground">{title}</h2>
      <p className="mt-2 text-sm text-foreground/70">{description}</p>
    </div>
  );
}
