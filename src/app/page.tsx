import type { Metadata } from "next";
import { CandyMap } from "@/components/map/CandyMap";

export const metadata: Metadata = {
  title: "Map",
};

export default function MapPage() {
  return <CandyMap />;
}
