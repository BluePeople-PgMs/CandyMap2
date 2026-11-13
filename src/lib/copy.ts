/** User-facing label for a house count (English demo copy). */
export function formatHouseCount(count: number): string {
  return `${count} ${count === 1 ? "house" : "houses"}`;
}
