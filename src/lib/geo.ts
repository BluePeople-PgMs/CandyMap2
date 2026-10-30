const EARTH_RADIUS_METERS = 6_371_000;

/**
 * Demo houses sit within about 1 km of the shared map center.
 * A real device farther than this should not pull the map away from those houses.
 */
export const NEAR_DEMO_RADIUS_METERS = 2_500;

type LatLng = {
  lat: number;
  lng: number;
};

/** Great-circle distance in meters. */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(b.lat - a.lat);
  const longitudeDelta = toRadians(b.lng - a.lng);
  const latitudeA = toRadians(a.lat);
  const latitudeB = toRadians(b.lat);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitudeA) * Math.cos(latitudeB) * Math.sin(longitudeDelta / 2) ** 2;

  return (
    2 *
    EARTH_RADIUS_METERS *
    Math.asin(Math.min(1, Math.sqrt(haversine)))
  );
}

export function isWithinRadius(
  lat: number,
  lng: number,
  center: LatLng,
  radiusMeters = NEAR_DEMO_RADIUS_METERS,
): boolean {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return false;
  }

  return distanceMeters({ lat, lng }, center) <= radiusMeters;
}
