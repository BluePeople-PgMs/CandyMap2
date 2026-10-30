import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEMO_MAP_CENTER } from "../data/demo-map.ts";
import {
  NEAR_DEMO_RADIUS_METERS,
  distanceMeters,
  isWithinRadius,
} from "./geo.ts";

const center = { lat: DEMO_MAP_CENTER.lat, lng: DEMO_MAP_CENTER.lng };

describe("distanceMeters", () => {
  it("is zero for the same point", () => {
    assert.equal(distanceMeters(center, center), 0);
  });

  it("treats about 0.01 degrees of latitude as roughly 1.1 km", () => {
    const north = distanceMeters(center, {
      lat: center.lat + 0.01,
      lng: center.lng,
    });
    assert.ok(north > 1_050 && north < 1_200);
  });
});

describe("isWithinRadius", () => {
  it("keeps the demo neighborhood and rejects a point several kilometers away", () => {
    assert.equal(NEAR_DEMO_RADIUS_METERS, 2_500);
    assert.equal(isWithinRadius(center.lat, center.lng, center), true);
    assert.equal(isWithinRadius(center.lat + 0.01, center.lng, center), true);
    assert.equal(isWithinRadius(center.lat + 0.03, center.lng, center), false);
    assert.equal(isWithinRadius(Number.NaN, center.lng, center), false);
  });
});
