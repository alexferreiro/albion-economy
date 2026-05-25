const ITEMS_TXT_URL =
  "https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/master/formatted/items.txt";

const SKIP_PATTERN = /FARM_|MOUNT_|MOB_|QUESTITEM|SEED|BABY|BUTTER|MEAT|FISH|MEAL_|POTION_|TRASH|TOKEN/;

let _cache   = null;
let _promise = null;

/**
 * Load the item catalog from ao-bin-dumps (cached after first load).
 * Returns an array of { uniqueName, localizedName } objects.
 */
export async function loadCatalog() {
  if (_cache)   return _cache;
  if (_promise) return _promise;

  _promise = (async () => {
    try {
      const res  = await fetch(ITEMS_TXT_URL);
      const text = await res.text();
      const items = [];

      for (const line of text.split("\n")) {
        const match = line.match(/^\s*\d+:\s*(T[4-8]_[^:@]+?)\s*:\s*(.+)$/);
        if (!match) continue;
        const uniqueName = match[1].trim();
        const name       = match[2].trim();
        if (!uniqueName || !name) continue;
        if (uniqueName.includes("@")) continue;
        if (SKIP_PATTERN.test(uniqueName)) continue;
        items.push({ uniqueName: uniqueName.replace(/^T[4-8]_/, ""), localizedName: name });
      }

      // Deduplicate — keep the first occurrence (T4 version)
      const seen = new Map();
      for (const item of items) {
        if (!seen.has(item.uniqueName)) seen.set(item.uniqueName, item);
      }

      _cache = [...seen.values()];
      return _cache;
    } catch {
      return [];
    }
  })();

  return _promise;
}

/**
 * Search the catalog for items matching a query string.
 * Returns up to 15 results sorted by relevance.
 */
export function searchCatalog(catalog, query) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();

  return catalog
    .filter(item =>
      item.localizedName.toLowerCase().includes(q) ||
      item.uniqueName.toLowerCase().includes(q)
    )
    .sort((a, b) => {
      const aStarts = a.localizedName.toLowerCase().startsWith(q) || a.uniqueName.toLowerCase().startsWith(q);
      const bStarts = b.localizedName.toLowerCase().startsWith(q) || b.uniqueName.toLowerCase().startsWith(q);
      return (aStarts ? 0 : 1) - (bStarts ? 0 : 1);
    })
    .slice(0, 15);
}