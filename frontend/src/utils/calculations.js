import {
  ZONE_QUALITY_BONUS, POWER_GENERAL_BONUS, POWER_SPEC_BONUS,
  REFINED_RESOURCES, ENCHANT_LEVEL_SUFFIX, STORAGE_KEYS,
} from "./constants.js";
import { CRAFT_BRANCHES } from "../craftData.js";

// ─────────────────────────────────────────────────────────────
// RESOURCE RETURN RATE (RRR)
// ─────────────────────────────────────────────────────────────

/**
 * Calculate the Production Bonus (PB) percentage based on crafting location settings.
 * RRR = PB / (100 + PB)
 */
export function calcProductionBonus({
  mode, citySpecialized,
  hideoutZoneQuality, hideoutPowerLevel, hideoutSpecialized,
  useFocus, dailyBonus,
}) {
  let pb = 0;

  if (mode === "city") {
    pb = citySpecialized ? 33 : 18;
  } else if (mode === "hideout") {
    const lvlIdx = Math.min(Math.max(Number(hideoutPowerLevel) || 1, 1), 9) - 1;
    pb = (ZONE_QUALITY_BONUS[hideoutZoneQuality] ?? 1)
       + POWER_GENERAL_BONUS[lvlIdx]
       + (hideoutSpecialized ? POWER_SPEC_BONUS[lvlIdx] : 0);
  }

  if (useFocus) pb += 59;
  pb += Number(dailyBonus) || 0;
  return pb;
}

/** RRR as a fraction (0–1). e.g. PB=18 → RRR≈0.153 */
export function calcRRR(productionBonus) {
  if (productionBonus <= 0) return 0;
  return productionBonus / (100 + productionBonus);
}

// ─────────────────────────────────────────────────────────────
// MATERIAL ENCHANTING
// ─────────────────────────────────────────────────────────────

/**
 * Apply enchant suffix to refined materials in a recipe.
 * T4_PLANKS + ".1" → T4_PLANKS_LEVEL1@1
 * Artifacts and non-refined materials are left unchanged.
 */
export function applyEnchant(materials, enchant) {
  if (enchant === ".0") return materials;
  const suffix = ENCHANT_LEVEL_SUFFIX[enchant];
  if (!suffix) return materials;

  return materials.map(m => {
    const resourceType = m.uniqueName.split("_").slice(1).join("_");
    if (REFINED_RESOURCES.has(resourceType)) {
      return { ...m, uniqueName: m.uniqueName + suffix };
    }
    return m;
  });
}

// ─────────────────────────────────────────────────────────────
// FOCUS COST
// ─────────────────────────────────────────────────────────────

/**
 * Calculate actual focus cost after efficiency reduction.
 * FocusCost = baseFocusCost × 0.5^(efficiency / 10000)
 */
export function calcFocusCost(baseFocusCost, efficiency) {
  if (!baseFocusCost || baseFocusCost <= 0) return 0;
  return Math.ceil(baseFocusCost * Math.pow(0.5, efficiency / 10000));
}

/**
 * Calculate focus cost for a specific row (tier + enchant combination).
 * Reads player spec/mastery from localStorage (set in SpecPage).
 *
 * @param {object} row - The crafting row { recipe, tier, enchant }
 * @param {string} baseItem - The base item ID (e.g. "2H_BOW")
 * @param {boolean} useFocus - Whether focus is enabled
 */
export function calcFocusCostForRow(row, baseItem, useFocus) {
  const base = row.recipe?.craftingFocus;
  if (!base || !useFocus) return 0;

  try {
    // Enchant multiplier: 1.75^enchantLevel (same factor as tier scaling)
    const enchantLevel = { ".0": 0, ".1": 1, ".2": 2, ".3": 3, ".4": 4 }[row.enchant] ?? 0;
    const baseWithEnchant = base * Math.pow(1.75, enchantLevel);

    // Read player specs saved by SpecPage
    const specLevels    = JSON.parse(localStorage.getItem(STORAGE_KEYS.SPEC_LEVELS)    || "{}");
    const masteryLevels = JSON.parse(localStorage.getItem(STORAGE_KEYS.MASTERY_LEVELS) || "{}");

    const branch = CRAFT_BRANCHES.find(b => b.items.some(i => i.id === baseItem));
    const item   = branch?.items.find(i => i.id === baseItem);

    const specLevel    = specLevels[baseItem]        || 0;
    const masteryLevel = masteryLevels[branch?.name] || 0;

    // Mutual bonus from other specced items in same branch
    let mutual = 0;
    if (branch && item) {
      for (const other of branch.items) {
        if (other.id === baseItem) continue;
        mutual += (specLevels[other.id] || 0) * (item.mutualBonus || 30);
      }
    }

    const efficiency = masteryLevel * 30 + specLevel * (item?.uniqueBonus || 250) + mutual;
    return calcFocusCost(baseWithEnchant, efficiency);
  } catch {
    return calcFocusCost(base, 0);
  }
}

// ─────────────────────────────────────────────────────────────
// CRAFT COST & PROFIT
// ─────────────────────────────────────────────────────────────

/**
 * Calculate total craft cost for a row × qty items.
 * Accounts for RRR with integer-correct material quantities.
 *
 * @param {object} row - { recipe, materialPrices }
 * @param {function} effectivePrice - (rowKey, matId, apiData) → price | null
 * @param {number} rrr - Resource return rate fraction (0–1)
 * @param {number} qty - Number of items to craft
 * @param {string} baseItem - For focus cost lookup
 * @param {boolean} useFocus - Whether focus is enabled
 */
export function calcCost(row, effectivePrice, rrr, qty = 1, baseItem, useFocus) {
  if (!row.recipe?.materials?.length) return null;

  let total = (row.recipe.silver || 0) * qty;

  for (const m of row.recipe.materials) {
    const p = effectivePrice(m.uniqueName, row.materialPrices[m.uniqueName]);
    if (p === null || p === undefined) return null;

    // Accumulative RRR: first craft always costs full price,
    // subsequent crafts can use returned materials from previous crafts
    let stock = 0;
    let toBuy = 0;
    for (let i = 0; i < qty; i++) {
      toBuy += Math.max(0, m.count - stock);
      stock = Math.max(0, stock - m.count) + Math.floor(m.count * rrr);
    }
    total += p * toBuy;
  }

  total += calcFocusCostForRow(row, baseItem, useFocus) * qty;
  return total;
}

/**
 * Calculate profit for selling qty items after crafting cost and 4% tax.
 */
export function calcProfit(row, totalCost, qty = 1) {
  if (totalCost === null || row.sellPrice === null) return null;
  const revenue = row.sellPrice * qty;
  const tax = revenue * 0.04;
  return revenue - totalCost - tax;
}