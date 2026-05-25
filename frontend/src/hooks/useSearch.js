import { useState, useCallback } from "react";
import { loadCatalog, searchCatalog } from "../api/catalogApi.js";
import { searchItem } from "../api/albionApi.js";
import { TIERS, ENCHANTS } from "../utils/constants.js";
import { getItemId } from "../utils/formatting.js";

/**
 * Manages all search state: autocomplete, item search, and result rows.
 */
export function useSearch() {
  const [query,        setQuery]        = useState("");
  const [suggestions,  setSuggestions]  = useState([]);
  const [sugLoading,   setSugLoading]   = useState(false);
  const [showSug,      setShowSug]      = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [baseItem,     setBaseItem]     = useState("");
  const [rows,         setRows]         = useState([]);
  const [searching,    setSearching]    = useState(false);
  const [searched,     setSearched]     = useState(false);

  // ── Autocomplete ─────────────────────────────────────────
  const fetchSuggestions = useCallback(async (q) => {
    if (!q || q.length < 2) { setSuggestions([]); setShowSug(false); return; }
    setSugLoading(true);
    try {
      const catalog = await loadCatalog();
      const results = searchCatalog(catalog, q);
      setSuggestions(results);
      setShowSug(results.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setSugLoading(false);
    }
  }, []);

  const handleQueryChange = useCallback((val) => {
    setQuery(val);
    setSelectedItem(null);
    fetchSuggestions(val);
  }, [fetchSuggestions]);

  const handleSelect = useCallback((item) => {
    setQuery(item.localizedName);
    setSelectedItem(item);
    setSuggestions([]);
    setShowSug(false);
  }, []);

  // ── Item search ──────────────────────────────────────────
  const handleSearch = useCallback(async () => {
    const base = selectedItem
      ? selectedItem.uniqueName.toUpperCase()
      : query.trim().toUpperCase().replace(/\s+/g, "_");
    if (!base) return;

    setSearching(true);
    setSearched(true);
    setBaseItem(base);

    // Immediately seed rows in loading state
    setRows(TIERS.flatMap(tier =>
      ENCHANTS.map(enchant => ({
        tier, enchant,
        itemId: getItemId(base, tier, enchant),
        sellPrice: null, recipe: null, materialPrices: {}, loading: true,
      }))
    ));

    try {
      const results = await searchItem(base);
      setRows(results);
    } finally {
      setSearching(false);
    }
  }, [selectedItem, query]);

  return {
    // Autocomplete
    query, handleQueryChange, handleSelect,
    suggestions, sugLoading, showSug, setShowSug,
    selectedItem,
    // Search
    handleSearch, searching, searched, baseItem, rows,
  };
}