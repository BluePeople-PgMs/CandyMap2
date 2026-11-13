import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEMO_MAP_CENTER } from "../data/demo-map.ts";
import { demoHousePositionsForFit } from "./map-view.ts";

const center = { lat: DEMO_MAP_CENTER.lat, lng: DEMO_MAP_CENTER.lng };
const radius = 20_000;

describe("demoHousePositionsForFit", () => {
  it("returns an empty list when there are no houses", () => {
    assert.deepEqual(demoHousePositionsForFit([], center, radius), []);
  });

  it("includes houses near the demo anchor and drops far-away pins", () => {
    const positions = demoHousePositionsForFit(
      [
        { lat: center.lat + 0.001, lng: center.lng },
        { lat: center.lat + 5, lng: center.lng },
      ],
      center,
      radius,
    );
    assert.equal(positions.length, 1);
    assert.deepEqual(positions[0], [center.lat + 0.001, center.lng]);
  });

  it("returns every in-radius house for a small cluster", () => {
    const houses = [
      { lat: center.lat + 0.002, lng: center.lng + 0.001 },
      { lat: center.lat - 0.001, lng: center.lng - 0.002 },
    ];
    const positions = demoHousePositionsForFit(houses, center, radius);
    assert.equal(positions.length, 2);
  });
});
