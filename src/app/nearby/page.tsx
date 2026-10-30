import type { Metadata } from "next";
import { NearbyScreen } from "@/components/nearby/NearbyScreen";

export const metadata: Metadata = {
  title: "Nearby",
};

export default function NearbyPage() {
  return <NearbyScreen />;
}
