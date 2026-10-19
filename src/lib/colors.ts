/** DOT Project teal — the main color of the DOT logo. */
export const DOT_TEAL = "#34E3C8";

/**
 * Swatches for the task color picker: two rows of seven.
 * Kept bright enough to read as text on the dark background.
 */
export const SWATCHES: string[] = [
  // cool row
  "#34E3C8", // DOT teal
  "#22D3EE", // cyan
  "#38BDF8", // sky
  "#6E9BFF", // blue
  "#8B8CFF", // indigo
  "#B48CFF", // violet
  "#E15BF5", // fuchsia
  // warm row
  "#FF6FAE", // pink
  "#FF6B6B", // red
  "#FF9548", // orange
  "#FFC53D", // amber
  "#B7E34A", // lime
  "#4ADE80", // green
  "#C3CCDA", // silver
];

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Normalizes "34e3c8", "#3ec", etc. to "#34E3C8". Returns null if invalid. */
export function normalizeHex(input: string): string | null {
  const m = input.trim().match(HEX_RE);
  if (!m) return null;
  let hex = m[1];
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  return `#${hex.toUpperCase()}`;
}
