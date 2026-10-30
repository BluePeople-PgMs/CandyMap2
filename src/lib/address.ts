const NAME_LIMIT = 80;

const STREET_KEYS = [
  "road",
  "residential",
  "pedestrian",
  "footway",
  "cycleway",
  "path",
  "street",
] as const;

export type StreetAddress = {
  streetNumber: string;
  streetName: string;
};

function addressText(value: unknown): string {
  if (typeof value === "string") {
    return value.trim().replace(/\s+/g, " ");
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return "";
}

/** "2769" and "Grand Ave." become "2769 Grand Ave." Both parts are required. */
export function formatHouseName(streetNumber: string, streetName: string): string | null {
  const number = addressText(streetNumber);
  const street = addressText(streetName);
  if (!number || !street) {
    return null;
  }

  return `${number} ${street}`.slice(0, NAME_LIMIT);
}

/**
 * Read a street number and street name from a Nominatim reverse-geocode payload.
 * Returns null when the payload is not an address result.
 * Either field may be empty when the map only knows part of the address.
 */
export function streetAddressFromNominatim(payload: unknown): StreetAddress | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const address = (payload as { address?: unknown }).address;
  if (!address || typeof address !== "object") {
    return null;
  }

  const record = address as Record<string, unknown>;
  const streetKey = STREET_KEYS.find((key) => addressText(record[key]).length > 0);

  return {
    streetNumber: addressText(record.house_number),
    streetName: streetKey ? addressText(record[streetKey]) : "",
  };
}
