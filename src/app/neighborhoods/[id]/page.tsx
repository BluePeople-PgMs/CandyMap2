import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAllNeighborhoods, getNeighborhoodById } from "@/data";
import { PINNED_NEIGHBORHOOD_ID } from "@/lib/user-houses";
import { NeighborhoodDetailView } from "@/components/rankings/NeighborhoodDetailView";
import { ListSkeleton } from "@/components/ui/ListSkeleton";

export function generateStaticParams() {
  return getAllNeighborhoods().map((neighborhood) => ({ id: neighborhood.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const neighborhood = getNeighborhoodById(id);
  if (neighborhood) {
    return { title: neighborhood.name };
  }

  if (id === PINNED_NEIGHBORHOOD_ID) {
    return { title: "Pinned locations" };
  }

  return { title: "Neighborhood" };
}

async function NeighborhoodPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const neighborhood = getNeighborhoodById(id);

  if (!neighborhood && id !== PINNED_NEIGHBORHOOD_ID) {
    notFound();
  }

  return <NeighborhoodDetailView neighborhoodId={id} />;
}

export default function NeighborhoodPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <ListSkeleton rows={3} />
        </main>
      }
    >
      <NeighborhoodPageContent params={params} />
    </Suspense>
  );
}
