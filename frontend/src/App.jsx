import { useState } from "react";
import { RRRPanel }    from "./components/calculator/RRRPanel.jsx";
import { TierSection } from "./components/calculator/TierSection.jsx";
import { useSearch }   from "./hooks/useSearch.js";
import { calcProductionBonus, calcRRR } from "./utils/calculations.js";
import { TIERS, ENCHANTS } from "./utils/constants.js";

export default function App() {
  // ── RRR config ───────────────────────────────────────────
  const [rrrMode,       setRrrMode]      = useState("city");
  const [citySpec,      setCitySpec]     = useState(false);
  const [hideoutZoneQ,  setHideoutZoneQ] = useState(1);
  const [hideoutPower,  setHideoutPower] = useState(1);
  const [hideoutSpec,   setHideoutSpec]  = useState(false);
  const [useFocus,      setUseFocus]     = useState(false);
  const [dailyBonus,    setDailyBonus]   = useState(0);

  const productionBonus = calcProductionBonus({
    mode: rrrMode, citySpecialized: citySpec,
    hideoutZoneQuality: hideoutZoneQ, hideoutPowerLevel: hideoutPower,
    hideoutSpecialized: hideoutSpec, useFocus, dailyBonus,
  });
  const rrr = calcRRR(productionBonus);

  // ── Manual price overrides ───────────────────────────────
  const [manualPrices, setManualPrices] = useState({});
  const onSetPrice   = (rk, matId, val) => setManualPrices(p => ({ ...p, [`${rk}::${matId}`]: val }));
  const onClearPrice = (rk, matId)      => setManualPrices(p => { const n = {...p}; delete n[`${rk}::${matId}`]; return n; });

  // ── Search ───────────────────────────────────────────────
  const {
    query, handleQueryChange, handleSelect,
    suggestions, sugLoading, showSug, setShowSug,
    handleSearch, searching, searched, baseItem, rows,
  } = useSearch();

  // Group rows by tier for rendering
  const byTier = TIERS.map(tier => ({
    tier,
    enchants: ENCHANTS.map(e => rows.find(r => r.tier === tier && r.enchant === e)).filter(Boolean),
  }));

  return (
    <div style={s.root}>
      <header style={s.header}>
        <div style={s.headerInner}>
          <span style={s.logoIcon}>⚔</span>
          <div>
            <div style={s.logoText}>Albion Economy</div>
            <div style={s.subtitle}>Crafting calculator · live recipes · T4–T8 · .0–.4</div>
          </div>
        </div>
      </header>

      <main style={s.main}>
        {/* Search */}
        <div style={s.searchBox}>
          <div style={s.searchRow}>
            <div style={s.searchField}>
              <label style={s.label}>Search item</label>
              <div style={s.autocompleteWrap}>
                <input
                  style={s.input}
                  placeholder="Type item name or ID… e.g. Bag, Sword, Plate Armor…"
                  value={query}
                  onChange={e => handleQueryChange(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter")  { setShowSug(false); handleSearch(); }
                    if (e.key === "Escape") setShowSug(false);
                  }}
                  onFocus={() => suggestions.length > 0 && setShowSug(true)}
                  onBlur={() => setTimeout(() => setShowSug(false), 150)}
                  autoFocus
                />
                {showSug && suggestions.length > 0 && (
                  <div style={s.dropdown}>
                    {sugLoading && <div style={s.dropItem}>Searching…</div>}
                    {suggestions.map(item => (
                      <div
                        key={item.uniqueName}
                        style={s.dropItem}
                        onMouseDown={() => handleSelect(item)}
                      >
                        <span style={s.dropName}>{item.localizedName}</span>
                        <span style={s.dropId}>{item.uniqueName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button style={s.btn} onClick={handleSearch} disabled={searching}>
              {searching ? "Searching…" : "Search"}
            </button>
          </div>
          <p style={s.hint}>
            Search by name or in-game ID. Recipes from{" "}
            <code style={s.code}>gameinfo.albiononline.com</code> · prices from{" "}
            <code style={s.code}>albion-online-data.com</code>
          </p>
        </div>

        {/* RRR */}
        <RRRPanel
          mode={rrrMode}       onMode={setRrrMode}
          citySpecialized={citySpec} onCitySpec={setCitySpec}
          hideoutZoneQ={hideoutZoneQ} onZoneQ={setHideoutZoneQ}
          hideoutPower={hideoutPower} onPower={setHideoutPower}
          hideoutSpec={hideoutSpec}   onHideoutSpec={setHideoutSpec}
          useFocus={useFocus}  onFocus={setUseFocus}
          dailyBonus={dailyBonus} onDaily={setDailyBonus}
          productionBonus={productionBonus} rrr={rrr}
        />

        {/* Results */}
        {searched && rows.length > 0 && (
          <div style={s.results}>
            <div style={s.resultsHeader}>
              <span>
                Results for <strong style={{ color: "#d4b87a" }}>{baseItem}</strong>
              </span>
              <span style={s.hint2}>
                RRR: <strong style={{ color: "#d4b87a" }}>{(rrr * 100).toFixed(1)}%</strong>
                {" · "}PB: {productionBonus}%
                {" · "}💡 Edit material prices to recalculate instantly
              </span>
            </div>

            {byTier.map(({ tier, enchants }) => (
              <TierSection
                key={tier}
                tier={tier}
                enchants={enchants}
                rrr={rrr}
                baseItem={baseItem}
                useFocus={useFocus}
                manualPrices={manualPrices}
                onSetPrice={onSetPrice}
                onClearPrice={onClearPrice}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const s = {
  root:       { minHeight: "100vh", background: "#0f0f13", color: "#e8e6e1", fontFamily: "inherit" },
  header:     { background: "#13131a", borderBottom: "2px solid #2a2a38", padding: "14px 0" },
  headerInner:{ maxWidth: 1340, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", gap: 14 },
  logoIcon:   { fontSize: 28 },
  logoText:   { fontSize: 20, fontWeight: 700, color: "#f0c030", letterSpacing: "0.02em" },
  subtitle:   { fontSize: 11, color: "#6b6b88", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 },
  main:       { maxWidth: 1340, margin: "0 auto", padding: "20px 24px 80px", display: "flex", flexDirection: "column", gap: 16 },

  searchBox:  { background: "#17171f", border: "1px solid #2a2a3a", borderRadius: 10, padding: "16px 20px" },
  searchRow:  { display: "flex", gap: 10, alignItems: "flex-end" },
  searchField:{ flex: 1, display: "flex", flexDirection: "column", gap: 6, position: "relative" },
  label:      { fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#9090b0" },
  input: {
    background: "#0f0f18", border: "1px solid #3a3a52", borderRadius: 6,
    color: "#f0eeea", padding: "10px 14px", fontSize: 14, outline: "none",
    width: "100%", boxSizing: "border-box", display: "block",
  },
  btn: {
    background: "#f0a030", color: "#0a0800", border: "none", borderRadius: 6,
    padding: "10px 28px", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em",
    textTransform: "uppercase", cursor: "pointer", height: 42, flexShrink: 0,
  },
  hint:  { marginTop: 8, fontSize: 11, color: "#55556a" },
  hint2: { fontSize: 11, color: "#55556a" },
  code:  { background: "#1e1e2e", padding: "1px 6px", borderRadius: 3, fontSize: 10, color: "#8888aa", fontFamily: "monospace" },

  autocompleteWrap: { position: "relative", flex: 1 },
  dropdown: {
    position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 200,
    background: "#17171f", border: "1px solid #3a3a52", borderRadius: 8,
    maxHeight: 300, overflowY: "auto", boxShadow: "0 12px 40px rgba(0,0,0,0.7)",
  },
  dropItem: {
    display: "flex", alignItems: "center", gap: 10, padding: "9px 14px",
    cursor: "pointer", borderBottom: "1px solid #1e1e2a",
  },
  dropName: { fontSize: 13, color: "#e8e6e1", flex: 1 },
  dropId:   { fontSize: 10, color: "#6060a0", fontFamily: "monospace", flexShrink: 0 },

  results:       { display: "flex", flexDirection: "column", gap: 12 },
  resultsHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    flexWrap: "wrap", gap: 8, fontSize: 13, color: "#9090aa",
  },
};