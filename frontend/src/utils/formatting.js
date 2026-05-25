/** Format a number as a locale string, returns "—" for null/undefined */
export function fmt(n) {
  if (n === null || n === undefined) return "—";
  return Math.round(n).toLocaleString("en-US");
}

const MATERIAL_NAMES = {
  METALBAR:        "Metal Bar",
  PLANKS:          "Planks",
  CLOTH:           "Cloth",
  LEATHER:         "Leather",
  STONEBLOCK:      "Stone Block",
  FIBER:           "Fiber",
  HIDE:            "Hide",
  ORE:             "Ore",
  WOOD:            "Wood",
  ROCK:            "Rock",
  RUNE:            "Rune",
  SOUL:            "Soul",
  RELIC:           "Relic",
  SHARD_AVALONIAN: "Avalonian Shard",
};

/**
 * Convert a raw material ID to a human-readable name.
 * Examples:
 *   "T8_CLOTH"          → "Cloth 8.0"
 *   "T8_CLOTH_LEVEL1@1" → "Cloth 8.1"
 *   "T4_RUNE"           → "Rune 4.0"
 */
export function formatMatName(uniqueName) {
  const tierMatch = uniqueName.match(/^T(\d+)_/);
  if (!tierMatch) return uniqueName;
  const tier = tierMatch[1];

  let rest = uniqueName.replace(/^T\d+_/, "");
  let enchant = "0";

  const levelMatch = rest.match(/_LEVEL(\d+)@\d+$/);
  if (levelMatch) {
    enchant = levelMatch[1];
    rest = rest.replace(/_LEVEL\d+@\d+$/, "");
  }

  const name = MATERIAL_NAMES[rest]
    ?? rest.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return `${name} ${tier}.${enchant}`;
}

/** Get the full item ID for a given base name, tier and enchant */
export function getItemId(base, tier, enchant) {
  const suffixes = { ".0": "", ".1": "@1", ".2": "@2", ".3": "@3", ".4": "@4" };
  return `T${tier}_${base}${suffixes[enchant]}`;
}