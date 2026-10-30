import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { HouseDetailView } from "@/components/house/HouseDetailView";
import { ListSkeleton } from "@/components/ui/ListSkeleton";
import { getSeedHouseById, getSeedHouses, isUserHouseId } from "@/lib";

export function generateStaticParams() {
  return getSeedHouses().map((house) => ({ id: house.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const house = getSeedHouseById(id);
  if (house) {
    return { title: house.name };
  }

  if (isUserHouseId(id)) {
    return { title: "Pinned house" };
  }

  return { title: "House" };
}

async function HousePageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const house = getSeedHouseById(id) ?? null;

  if (!house && !isUserHouseId(id)) {
    notFound();
  }

  return <HouseDetailView houseId={id} seed={house} />;
}

export default function HousePage({
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
      <HousePageContent params={params} />
    </Suspense>
  );
}
