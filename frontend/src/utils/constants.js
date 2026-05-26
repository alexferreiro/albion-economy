export const TIERS   = [4, 5, 6, 7, 8];
export const ENCHANTS = [".0", ".1", ".2", ".3", ".4"];

export const ENCHANT_ITEM_SUFFIX = {
  ".0": "", ".1": "@1", ".2": "@2", ".3": "@3", ".4": "@4",
};

export const TIER_COLORS = {
  4: { bg: "#001428", text: "#4db8ff", border: "#00407a", accent: "#2aa8ff", header: "#001c38" },
  5: { bg: "#200000", text: "#ff6060", border: "#620000", accent: "#ff4444", header: "#2e0000" },
  6: { bg: "#1e1000", text: "#ff8c00", border: "#6a3800", accent: "#ff7700", header: "#2a1600" },
  7: { bg: "#1e1600", text: "#ffd060", border: "#5a4400", accent: "#ffc030", header: "#2a1e00" },
  8: { bg: "#1e1e1e", text: "#f0f0f0", border: "#606060", accent: "#ffffff", header: "#2a2a2a" },
};

// Refined resources that have enchanted versions in the market
// Format: T4_PLANKS -> T4_PLANKS_LEVEL1@1
export const REFINED_RESOURCES = new Set([
  "PLANKS", "METALBAR", "CLOTH", "LEATHER", "STONEBLOCK",
  "FIBER", "HIDE", "ORE", "WOOD", "ROCK",
]);

export const ENCHANT_LEVEL_SUFFIX = {
  ".1": "_LEVEL1@1",
  ".2": "_LEVEL2@2",
  ".3": "_LEVEL3@3",
  ".4": "_LEVEL4@4",
};

// RRR: hideout zone quality production bonus (Q1-Q6)
export const ZONE_QUALITY_BONUS = { 1: 1, 2: 6, 3: 11, 4: 16, 5: 21, 6: 26 };

// RRR: hideout power level general bonus (non-linear, index 0 = Level 1)
export const POWER_GENERAL_BONUS = [0, 6, 11, 15, 18, 20, 22, 24, 26];

// RRR: hideout power level specialized bonus (linear: (L-1) * 3.75)
export const POWER_SPEC_BONUS = [0, 3.75, 7.5, 11.25, 15, 18.75, 22.5, 26.25, 30];

// localStorage keys
export const STORAGE_KEYS = {
  SPEC_LEVELS:    "albion_spec_levels",
  MASTERY_LEVELS: "albion_mastery_levels",
};

// Backend URL — override with VITE_BACKEND_URL env var for production
export const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";