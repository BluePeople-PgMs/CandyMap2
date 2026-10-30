import { connection } from "next/server";
import { streetAddressFromNominatim } from "@/lib/address";

const LOOKUP_TIMEOUT_MS = 8000;

function emptyAddress() {
  return Response.json({ streetNumber: "", streetName: "", found: false });
}

/**
 * Reverse geocode a pin through OpenStreetMap Nominatim.
 * The browser cannot set the User-Agent Nominatim requires, so this route does it.
 * A miss returns an empty address so the form can be filled in by hand.
 */
export async function GET(request: Request) {
  await connection();

  const url = new URL(request.url);
  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return Response.json({ streetNumber: "", streetName: "", found: false }, { status: 400 });
  }

  const lookup = new URL("https://nominatim.openstreetmap.org/reverse");
  lookup.searchParams.set("format", "jsonv2");
  lookup.searchParams.set("lat", String(lat));
  lookup.searchParams.set("lon", String(lng));
  lookup.searchParams.set("addressdetails", "1");
  lookup.searchParams.set("zoom", "18");

  try {
    const response = await fetch(lookup, {
      headers: {
        Accept: "application/json",
        "Accept-Language": "en",
        "User-Agent": "CandyMap/0.1 (halloween trick-or-treat map)",
      },
      signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
    });

    if (!response.ok) {
      return emptyAddress();
    }

    const address = streetAddressFromNominatim(await response.json());
    const streetNumber = address?.streetNumber ?? "";
    const streetName = address?.streetName ?? "";

    return Response.json({
      streetNumber,
      streetName,
      found: streetNumber.length > 0 && streetName.length > 0,
    });
  } catch {
    return emptyAddress();
  }
}
