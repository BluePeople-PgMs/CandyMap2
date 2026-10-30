import Link from "next/link";

export default function NeighborhoodNotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <p className="text-4xl" aria-hidden="true">
        👻
      </p>
      <h1 className="mt-4 font-display text-4xl text-foreground">Neighborhood not found</h1>
      <p className="mt-3 max-w-sm text-sm text-foreground/75">
        That area is not part of the demo map.
      </p>
      <Link
        href="/rankings"
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-candy-orange px-5 text-sm font-semibold text-candy-black"
      >
        Back to rankings
      </Link>
    </main>
  );
}
