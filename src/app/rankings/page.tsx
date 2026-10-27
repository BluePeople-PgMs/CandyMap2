import type { Metadata } from "next";
import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";

export const metadata: Metadata = {
  title: "Rankings",
};

export default function RankingsPage() {
  return (
    <ScreenPlaceholder
      emoji="🏆"
      title="Rankings"
      description="Neighborhood and house rankings will live here. This tab is ready; the scores come later."
    />
  );
}
