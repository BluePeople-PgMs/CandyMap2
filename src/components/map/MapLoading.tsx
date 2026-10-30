export function MapLoading() {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_top,_#4a1d8a_0%,_#1a0b33_42%,_#050308_100%)]"
      role="status"
    >
      <p className="animate-pulse text-4xl" aria-hidden="true">
        🎃
      </p>
      <p className="mt-3 text-sm text-foreground/80">Lighting the map…</p>
    </div>
  );
}
