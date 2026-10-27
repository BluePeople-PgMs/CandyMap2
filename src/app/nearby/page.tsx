import type { Metadata } from "next";
import { ScreenPlaceholder } from "@/components/ScreenPlaceholder";

export const metadata: Metadata = {
  title: "Nearby",
};

export default function NearbyPage() {
  return (
    <ScreenPlaceholder
      emoji="🍬"
      title="Nearby"
      description="This list will show houses around you. For now it is an empty screen so we can wire up the tab."
    />
  );
}
