import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyUserRatingsToHouses,
  calculateOverallRating,
  createRating,
  isValidStarRatingScore,
  mergeAverages,
  scoresFromStars,
} from "./ratings.ts";
import type { House, Rating } from "../types/index.ts";

const sampleHouse: House = {
  id: "house-test",
  name: "Test Haunt",
  address: "1 Demo Lane (demo)",
  lat: 40.44,
  lng: -79.99,
  neighborhoodId: "willow-grove",
  candyTypes: ["chocolate"],
  photoEmoji: "🎃",
  ratingCount: 2,
  averages: {
    quality: 4,
    variety: 4,
    quantity: 4,
    overall: 4,
  },
  comments: [],
};

describe("isValidStarRatingScore", () => {
  it("accepts whole-star ratings from 1 through 5", () => {
    assert.equal(isValidStarRatingScore(1), true);
    assert.equal(isValidStarRatingScore(5), true);
    assert.equal(isValidStarRatingScore(0), false);
    assert.equal(isValidStarRatingScore(6), false);
    assert.equal(isValidStarRatingScore(4.5), false);
  });
});

describe("calculateOverallRating", () => {
  it("averages the three dimensions to one decimal", () => {
    assert.equal(calculateOverallRating(5, 4, 3), 4);
    assert.equal(calculateOverallRating(4.8, 4.6, 4.7), 4.7);
    assert.equal(calculateOverallRating(3.4, 3.1, 4.2), 3.6);
  });

  it("clamps out-of-range scores before averaging", () => {
    assert.equal(calculateOverallRating(9, 0, 3), 3);
  });
});

describe("scoresFromStars", () => {
  it("copies one star rating into every score dimension", () => {
    assert.deepEqual(scoresFromStars(4), {
      quality: 4,
      variety: 4,
      quantity: 4,
    });
  });

  it("clamps to the 1–5 range", () => {
    assert.deepEqual(scoresFromStars(9), {
      quality: 5,
      variety: 5,
      quantity: 5,
    });
  });
});

describe("mergeAverages", () => {
  it("updates running averages without mutating the original object", () => {
    const original = { ...sampleHouse.averages };
    const next = mergeAverages(sampleHouse.averages, sampleHouse.ratingCount, {
      quality: 5,
      variety: 5,
      quantity: 5,
    });

    assert.deepEqual(sampleHouse.averages, original);
    assert.equal(next.quality, 4.3);
    assert.equal(next.variety, 4.3);
    assert.equal(next.quantity, 4.3);
    assert.equal(next.overall, 4.3);
  });
});

describe("applyUserRatingsToHouses", () => {
  it("leaves seed houses unchanged when there are no user ratings", () => {
    const result = applyUserRatingsToHouses([sampleHouse], []);
    assert.equal(result[0]?.ratingCount, 2);
    assert.equal(result[0]?.averages.overall, 4);
    assert.notEqual(result[0], sampleHouse);
  });

  it("merges user ratings and prepends comments without writing seed data", () => {
    const rating: Rating = createRating(
      {
        houseId: "house-test",
        quality: 5,
        variety: 5,
        quantity: 5,
        authorName: "Tester",
        comment: "Amazing full-size bars!",
      },
      {
        id: "rating-1",
        createdAt: "2026-10-27T12:00:00.000Z",
      },
    );

    const result = applyUserRatingsToHouses([sampleHouse], [rating]);
    assert.equal(sampleHouse.ratingCount, 2);
    assert.equal(sampleHouse.comments.length, 0);
    assert.equal(result[0]?.ratingCount, 3);
    assert.equal(result[0]?.averages.overall, 4.3);
    assert.equal(result[0]?.comments[0]?.text, "Amazing full-size bars!");
  });
});
