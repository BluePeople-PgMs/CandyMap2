import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatHouseName, streetAddressFromNominatim } from "./address.ts";

describe("formatHouseName", () => {
  it("joins the street number and street name", () => {
    assert.equal(formatHouseName("2769", "Grand Ave."), "2769 Grand Ave.");
  });

  it("rejects a missing number or street", () => {
    assert.equal(formatHouseName("  ", "Grand Ave."), null);
    assert.equal(formatHouseName("2769", ""), null);
  });
});

describe("streetAddressFromNominatim", () => {
  it("reads the house number and road", () => {
    assert.deepEqual(
      streetAddressFromNominatim({
        address: { house_number: "2769", road: "Grand Avenue" },
      }),
      { streetNumber: "2769", streetName: "Grand Avenue" },
    );
  });

  it("keeps a street when the number is missing", () => {
    assert.deepEqual(
      streetAddressFromNominatim({
        address: { pedestrian: "Market Street" },
      }),
      { streetNumber: "", streetName: "Market Street" },
    );
  });

  it("returns null when the payload has no address", () => {
    assert.equal(streetAddressFromNominatim({ display_name: "Pittsburgh" }), null);
    assert.equal(streetAddressFromNominatim(null), null);
  });
});
