import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CANDY_TAGS } from "../types/candy.ts";
import { applyUserRatingsToHouses, createRating, scoresFromStars } from "./ratings.ts";
import {
  buildUserHouse,
  neighborhoodIdAt,
  normalizeLongitude,
  sanitizeCandyTags,
} from "./user-houses.ts";

describe("normalizeLongitude", () => {
  it("wraps a longitude onto the -180 to 180 line", () => {
    assert.equal(normalizeLongitude(10), 10);
    assert.equal(normalizeLongitude(190), -170);
    assert.equal(normalizeLongitude(-190), 170);
  });
});

describe("neighborhoodIdAt", () => {
  it("uses the box that contains the point", () => {
    const id = neighborhoodIdAt(1, 1, [
      {
        id: "willow-grove",
        bounds: { north: 2, south: 0, east: 2, west: 0 },
      },
    ]);
    assert.equal(id, "willow-grove");
  });

  it("marks a point outside every box as pinned", () => {
    assert.equal(neighborhoodIdAt(10, 10, []), "pinned");
  });
});

describe("sanitizeCandyTags", () => {
  it("accepts every predefined tag and nothing else", () => {
    assert.deepEqual(sanitizeCandyTags([...CANDY_TAGS, "bogus"]), [...CANDY_TAGS]);
  });
});

describe("buildUserHouse", () => {
  it("keeps the exact selected coordinates and drops unknown tags", () => {
    const house = buildUserHouse({
      id: "house-user-test",
      name: "  Pumpkin porch  ",
      lat: 40.123456,
      lng: -79.654321,
      candyTags: ["lollipops", "bogus", "lollipops", "gummies"],
      neighborhoodId: "pinned",
    });

    assert.ok(house);
    assert.equal(house.lat, 40.123456);
    assert.equal(house.lng, -79.654321);
    assert.equal(house.name, "Pumpkin porch");
    assert.deepEqual(house.candyTags, ["lollipops", "gummies"]);
    assert.equal(house.ratingCount, 0);
  });

  it("uses a fallback name and rejects a latitude off the map", () => {
    const named = buildUserHouse({
      id: "house-user-blank",
      name: "   ",
      lat: 41,
      lng: -80,
      candyTags: [],
      neighborhoodId: "pinned",
    });
    assert.equal(named?.name, "Halloween house");
    assert.equal(
      buildUserHouse({
        id: "house-user-bad",
        name: "Nope",
        lat: 120,
        lng: 10,
        candyTags: [],
        neighborhoodId: "pinned",
      }),
      null,
    );
  });
});

describe("pinned house reviews", () => {
  it("updates only the house the review belongs to", () => {
    const house = buildUserHouse({
      id: "house-user-rated",
      name: "Candy porch",
      lat: 41.5,
      lng: -80.25,
      candyTags: ["chocolates"],
      neighborhoodId: "pinned",
    });
    assert.ok(house);

    const other = buildUserHouse({
      id: "house-user-other",
      name: "Quiet porch",
      lat: 41.6,
      lng: -80.2,
      candyTags: [],
      neighborhoodId: "pinned",
    });
    assert.ok(other);

    const [rated, untouched] = applyUserRatingsToHouses(
      [house, other],
      [
        createRating(
          { houseId: house.id, ...scoresFromStars(5) },
          { id: "rating-1", createdAt: "2026-10-28T00:00:00.000Z" },
        ),
        createRating(
          { houseId: house.id, ...scoresFromStars(3) },
          { id: "rating-2", createdAt: "2026-10-28T00:01:00.000Z" },
        ),
      ],
    );

    assert.equal(house.ratingCount, 0);
    assert.equal(rated?.ratingCount, 2);
    assert.equal(rated?.averages.overall, 4);
    assert.deepEqual(rated?.candyTags, ["chocolates"]);
    assert.equal(rated?.lat, 41.5);
    assert.equal(untouched?.ratingCount, 0);
    assert.equal(untouched?.averages.overall, 0);
  });
});
