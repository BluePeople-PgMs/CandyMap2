import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeNeighborhoodStats,
  getTopRatedHouses,
  neighborhoodHasRatedHouses,
  rankHousesByRating,
  rankNeighborhoodsByAverage,
} from "./rankings.ts";
import { calculateOverallRating } from "./ratings.ts";
import { getAllHouses, getHouseById, getHousesByNeighborhood } from "./houses.ts";
import type { House, Neighborhood } from "../types/index.ts";

const fixtureHouses: House[] = [
  {
    id: "a",
    name: "Alpha Haunt",
    address: "1 Demo St (demo)",
    lat: 40.44,
    lng: -79.99,
    neighborhoodId: "willow-grove",
    candyTypes: ["chocolate"],
    ratingCount: 10,
    averages: { quality: 5, variety: 5, quantity: 5, overall: 5 },
    comments: [],
  },
  {
    id: "b",
    name: "Beta Haunt",
    address: "2 Demo St (demo)",
    lat: 40.441,
    lng: -79.991,
    neighborhoodId: "willow-grove",
    candyTypes: ["gummy"],
    ratingCount: 4,
    averages: { quality: 3, variety: 3, quantity: 3, overall: 3 },
    comments: [],
  },
  {
    id: "c",
    name: "Cedar Haunt",
    address: "3 Demo St (demo)",
    lat: 40.442,
    lng: -79.992,
    neighborhoodId: "moonlit-hollow",
    candyTypes: ["sour"],
    ratingCount: 8,
    averages: { quality: 4, variety: 4, quantity: 4, overall: 4 },
    comments: [],
  },
];

const fixtureNeighborhoods: Neighborhood[] = [
  {
    id: "willow-grove",
    name: "Willow Grove",
    description: "Demo neighborhood A",
    bounds: { north: 1, south: 0, east: 1, west: 0 },
    houseCount: 2,
    averageOverall: 4,
  },
  {
    id: "moonlit-hollow",
    name: "Moonlit Hollow",
    description: "Demo neighborhood B",
    bounds: { north: 1, south: 0, east: 1, west: 0 },
    houseCount: 1,
    averageOverall: 4,
  },
];

describe("house accessors", () => {
  it("copies all houses", () => {
    const houses = getAllHouses(fixtureHouses);
    assert.equal(houses.length, 3);
    assert.notEqual(houses[0], fixtureHouses[0]);
  });

  it("finds a house by id", () => {
    const house = getHouseById("a", fixtureHouses);
    assert.equal(house?.name, "Alpha Haunt");
    assert.equal(getHouseById("missing", fixtureHouses), undefined);
  });

  it("filters houses by neighborhood", () => {
    const willow = getHousesByNeighborhood("willow-grove", fixtureHouses);
    assert.equal(willow.length, 2);
  });
});

describe("rankHousesByRating", () => {
  it("sorts highest overall first and supports top-N", () => {
    const ranked = rankHousesByRating(fixtureHouses);
    assert.deepEqual(
      ranked.map((house) => house.id),
      ["a", "c", "b"],
    );
    assert.deepEqual(
      getTopRatedHouses(fixtureHouses, 2).map((house) => house.id),
      ["a", "c"],
    );
  });
});

describe("rankNeighborhoodsByAverage", () => {
  it("ranks neighborhoods by live member averages", () => {
    const ranked = rankNeighborhoodsByAverage(
      fixtureNeighborhoods,
      fixtureHouses,
    );
    // Both average to 4.0; Willow wins the tie on houseCount (2 > 1).
    assert.equal(ranked[0]?.id, "willow-grove");
    assert.equal(ranked[0]?.averageOverall, 4);
    assert.equal(ranked[0]?.rank, 1);
    assert.equal(ranked[1]?.id, "moonlit-hollow");
    assert.equal(ranked[1]?.averageOverall, 4);
  });

  it("computes neighborhood stats from member houses", () => {
    const stats = computeNeighborhoodStats(
      fixtureNeighborhoods[0]!,
      fixtureHouses,
    );
    assert.equal(stats.houseCount, 2);
    assert.equal(stats.averageOverall, 4);
  });

  it("counts every house in the neighborhood, even with ratingCount 0", () => {
    const unrated: House = {
      ...fixtureHouses[0]!,
      id: "unrated",
      ratingCount: 0,
      averages: { quality: 0, variety: 0, quantity: 0, overall: 0 },
    };
    const mixed = [unrated, fixtureHouses[1]!];
    const stats = computeNeighborhoodStats(fixtureNeighborhoods[0]!, mixed);
    assert.equal(stats.houseCount, 2);
    assert.equal(neighborhoodHasRatedHouses("willow-grove", mixed), true);
    assert.equal(
      neighborhoodHasRatedHouses("willow-grove", [unrated]),
      false,
    );
  });
});

describe("overall formula", () => {
  it("matches the documented average of three scores", () => {
    assert.equal(calculateOverallRating(5, 4, 3), 4);
    assert.equal(calculateOverallRating(4.8, 4.6, 4.7), 4.7);
  });
});
