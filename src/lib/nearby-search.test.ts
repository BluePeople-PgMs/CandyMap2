import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { House } from "../types/index.ts";
import { filterNearbyHouses, houseMatchesNearbySearch } from "./nearby-search.ts";

const neighborhoodName = (id: string) =>
  ({
    "willow-grove": "Willow Grove",
    "moonlit-hollow": "Moonlit Hollow",
    "candlewick-crossing": "Candlewick Crossing",
  })[id] ?? "";

const sampleHouses: House[] = [
  {
    id: "house-pumpkin",
    name: "The Pumpkin Palace",
    address: "12 Lantern Loop (demo)",
    lat: 40.44,
    lng: -79.99,
    neighborhoodId: "willow-grove",
    candyTypes: ["chocolate", "full-size"],
    ratingCount: 1,
    averages: { quality: 4, variety: 4, quantity: 4, overall: 4 },
    comments: [],
  },
  {
    id: "house-skeleton",
    name: "Skeleton Stoop",
    address: "8 Candle Row (demo)",
    lat: 40.441,
    lng: -79.991,
    neighborhoodId: "candlewick-crossing",
    candyTypes: ["hard-candy", "chips"],
    ratingCount: 1,
    averages: { quality: 3.5, variety: 3.5, quantity: 3.5, overall: 3.5 },
    comments: [],
  },
  {
    id: "house-moon",
    name: "Moonbeam Bungalow",
    address: "3 Hollow Way (demo)",
    lat: 40.442,
    lng: -79.992,
    neighborhoodId: "moonlit-hollow",
    candyTypes: ["chocolate", "homemade"],
    ratingCount: 1,
    averages: { quality: 3.5, variety: 3.5, quantity: 3.5, overall: 3.5 },
    comments: [],
  },
];

describe("filterNearbyHouses", () => {
  it("returns all houses when the query is empty", () => {
    assert.equal(filterNearbyHouses(sampleHouses, "", neighborhoodName).length, 3);
    assert.equal(filterNearbyHouses(sampleHouses, "   ", neighborhoodName).length, 3);
  });

  it("matches house names", () => {
    const matches = filterNearbyHouses(sampleHouses, "pumpkin", neighborhoodName);
    assert.equal(matches.length, 1);
    assert.equal(matches[0]?.name, "The Pumpkin Palace");
  });

  it("matches candy type labels", () => {
    const matches = filterNearbyHouses(sampleHouses, "hard candy", neighborhoodName);
    assert.equal(matches.length, 1);
    assert.equal(matches[0]?.id, "house-skeleton");
  });

  it("matches neighborhood names", () => {
    const matches = filterNearbyHouses(sampleHouses, "moonlit", neighborhoodName);
    assert.equal(matches.length, 1);
    assert.equal(matches[0]?.neighborhoodId, "moonlit-hollow");
  });
});

describe("houseMatchesNearbySearch", () => {
  const house = sampleHouses[0]!;

  it("is case insensitive", () => {
    assert.equal(
      houseMatchesNearbySearch(house, "PUMPKIN", neighborhoodName),
      true,
    );
  });
});
