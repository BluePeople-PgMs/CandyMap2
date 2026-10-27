/** A short visitor note shown on a house detail screen. */
export type Comment = {
  id: string;
  authorName: string;
  text: string;
  /** ISO-8601 timestamp */
  createdAt: string;
  /** Overall score associated with this comment (1–5). */
  overall: number;
};
