import { BACKEND, TIERS, ENCHANTS, ENCHANT_ITEM_SUFFIX } from "../utils/constants.js";
import { applyEnchant } from "../utils/calculations.js";
import { getItemId } from "../utils/formatting.js";

/**
 * Fetch the crafting recipe for a base item from the backend proxy.
 * Returns null if the item has no recipe or the request fails.
 */
export async function fetchRecipe(itemId) {
  try {
    const res = await fetch(`${BACKEND}/recipe?id=${itemId}`);
    if (!res.ok || res.status === 204) return null;
    const data = await res.json();
    if (!data || !data.materials?.length) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Fetch market prices for a batch of item IDs.
 * Splits into chunks of 50 to stay within URL limits.
 * Returns { [itemId]: { price, city } } — cheapest city per item.
 */
export async function fetchPricesBatch(itemIds, retries = 3) {
  if (!itemIds.length) return {};

  const unique = [...new Set(itemIds)];
  const CHUNK  = 50;
  const chunks = [];
  for (let i = 0; i < unique.length; i += CHUNK) {
    chunks.push(unique.slice(i, i + CHUNK));
  }

  const allResults = {};

  for (const chunk of chunks) {
    let attempt = 0;
    while (attempt < retries) {
      try {
        const joined  = chunk.join(",");
        const safeIds = joined.replace(/@/g, "%40"); // encode @ for Spring @RequestParam
        const res = await fetch(`${BACKEND}/prices?ids=${safeIds}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        for (const entry of data) {
          const { item_id: id, sell_price_min: price, city } = entry;
          if (!price || price <= 0) continue;
          if (!allResults[id] || price < allResults[id].price) {
            allResults[id] = { price, city };
          }
        }
        break;
      } catch {
        attempt++;
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 800 * attempt));
        }
      }
    }
  }

  return allResults;
}

/**
 * Full search flow: fetch recipes for all tiers and prices for all IDs in one batch.
 * Returns an array of row objects ready for the UI.
 */
export async function searchItem(base) {
  // Phase 1: fetch base recipe per tier (5 parallel requests)
  const recipesByTier = {};
  await Promise.all(
    TIERS.map(async tier => {
      recipesByTier[tier] = await fetchRecipe(`T${tier}_${base}`);
    })
  );

  // Phase 2: collect all IDs needing prices
  const allPriceIds = new Set();
  const rowRecipes  = {};

  for (const tier of TIERS) {
    for (const enchant of ENCHANTS) {
      const itemId = getItemId(base, tier, enchant);
      allPriceIds.add(itemId);

      const raw    = recipesByTier[tier];
      const recipe = raw ? { ...raw, materials: applyEnchant(raw.materials, enchant) } : null;
      rowRecipes[`${tier}${enchant}`] = recipe;
      recipe?.materials.forEach(m => allPriceIds.add(m.uniqueName));
    }
  }

  // Phase 3: single batch price fetch
  const allPrices = await fetchPricesBatch([...allPriceIds]);

  // Phase 4: build row objects
  return TIERS.flatMap(tier =>
    ENCHANTS.map(enchant => {
      const itemId  = getItemId(base, tier, enchant);
      const recipe  = rowRecipes[`${tier}${enchant}`];
      const sellData = allPrices[itemId] ?? null;

      const materialPrices = {};
      recipe?.materials.forEach(m => {
        materialPrices[m.uniqueName] = allPrices[m.uniqueName] ?? null;
      });

      return {
        tier, enchant, itemId,
        sellPrice: sellData?.price ?? null,
        recipe,
        materialPrices,
        loading: false,
      };
    })
  );
}