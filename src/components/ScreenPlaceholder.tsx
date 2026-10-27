export function ScreenPlaceholder({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_#4a1d8a_0%,_#1a0b33_42%,_#050308_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-candy-orange/20 blur-3xl"
      />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
        <p className="text-4xl" aria-hidden="true">
          {emoji}
        </p>
        <h1 className="mt-4 font-display text-4xl leading-none text-foreground drop-shadow-[0_0_24px_rgba(255,122,24,0.35)] sm:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-sm text-sm text-foreground/75 sm:text-base">
          {description}
        </p>
      </div>
    </main>
  );
}
