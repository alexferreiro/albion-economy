import { useState, useEffect, useMemo } from "react";
import { CRAFT_BRANCHES } from "./craftData.js";

// ─────────────────────────────────────────────────────────────
// STORAGE
// ─────────────────────────────────────────────────────────────
const SPEC_KEY    = "albion_spec_levels";
const MASTERY_KEY = "albion_mastery_levels";

function loadLS(key) {
  try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; }
}
function saveLS(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function getMutualBonus(item, branchItems, specLevels) {
  let total = 0;
  const mutual = Number(item?.mutualBonus) || 30;
  for (const other of branchItems) {
    if (!other || other.id === item?.id) continue;
    total += (Number(specLevels[other.id]) || 0) * mutual;
  }
  return total;
}

function calcEfficiency(masteryLevel, specLevel, mutualOthers, uniqueBonus = 250) {
  return (Number(masteryLevel) || 0) * 30
       + (Number(specLevel)    || 0) * (Number(uniqueBonus) || 250)
       + (Number(mutualOthers) || 0);
}

function calcReduction(efficiency) {
  const eff = Number(efficiency) || 0;
  return (1 - Math.pow(0.5, eff / 10000)) * 100;
}

function getCategory(branchName) {
  const WEAPONS = ["Broadsword","Battleaxe","Hammer","Mace","Dagger","Spear",
    "Bow","Crossbow","Quarterstaff","Brawler Gloves","Arcane Staff","Fire Staff",
    "Frost Staff","Holy Staff","Cursed Staff","Nature Staff","Prowling Staff","Torch","Shield"];
  const ARMOR = ["Soldier Helmet","Soldier Armor","Soldier Boots",
    "Mercenary Hood","Mercenary Jacket","Mercenary Shoes",
    "Scholar Cowl","Scholar Robe","Scholar Sandals"];
  if (WEAPONS.includes(branchName)) return "Weapons";
  if (ARMOR.includes(branchName)) return "Armor";
  return "Other";
}

// ─────────────────────────────────────────────────────────────
// ERROR BOUNDARY
// ─────────────────────────────────────────────────────────────
import { Component } from "react";
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e?.message || "Unknown error" }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: "12px 16px", background: "#1a0a0a", border: "1px solid #5a1a1a",
                      borderRadius: 8, color: "#e06060", fontFamily: "monospace", fontSize: 12 }}>
          ⚠ Error in branch: {this.state.error}
          <button style={{ marginLeft: 12, fontSize: 11, cursor: "pointer" }}
                  onClick={() => this.setState({ error: null })}>retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function SpecPage() {
  const [specLevels,    setSpecLevels]    = useState(loadLS(SPEC_KEY));
  const [masteryLevels, setMasteryLevels] = useState(loadLS(MASTERY_KEY));
  const [search,        setSearch]        = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [expandedBranch, setExpandedBranch] = useState(null);

  useEffect(() => { saveLS(SPEC_KEY,    specLevels);    }, [specLevels]);
  useEffect(() => { saveLS(MASTERY_KEY, masteryLevels); }, [masteryLevels]);

  const setSpec = (itemId, raw) => {
    const v = Math.min(100, Math.max(0, Number(raw) || 0));
    setSpecLevels(prev => ({ ...prev, [itemId]: v }));
  };
  const setMastery = (branch, raw) => {
    const v = Math.min(100, Math.max(0, Number(raw) || 0));
    setMasteryLevels(prev => ({ ...prev, [branch]: v }));
  };

  const toggleBranch = (name) =>
    setExpandedBranch(prev => prev === name ? null : name);

  const totalSpecced = Object.values(specLevels).filter(v => v > 0).length;
  const specVals = Object.values(specLevels).filter(v => v > 0);
  const avgSpec = specVals.length > 0
    ? Math.round(specVals.reduce((a, b) => a + b, 0) / specVals.length) : 0;

  const categories = ["All", "Weapons", "Armor", "Other"];

  const filteredBranches = useMemo(() => {
    const q = search.toLowerCase();
    return (CRAFT_BRANCHES || []).filter(branch => {
      if (!branch?.name) return false;
      const matchCat = activeCategory === "All" || getCategory(branch.name) === activeCategory;
      const matchSearch = !q ||
        branch.name.toLowerCase().includes(q) ||
        (branch.items || []).some(i => i?.name?.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [search, activeCategory]);

  return (
    <div style={s.root}>
      <header style={s.header}>
        <div style={s.headerInner}>
          <div>
            <div style={s.title}>🎯 Crafting Specialization</div>
            <div style={s.subtitle}>Manage your mastery & spec levels — saved automatically</div>
          </div>
          <div style={s.stats}>
            <StatBox label="Specced items" value={totalSpecced} />
            <StatBox label="Avg spec level" value={avgSpec} />
          </div>
        </div>
      </header>

      <main style={s.main}>
        <div style={s.toolbar}>
          <input style={s.search} placeholder="Search item or branch…"
            value={search} onChange={e => setSearch(e.target.value)} />
          <div style={s.catRow}>
            {categories.map(cat => (
              <button key={cat}
                style={{ ...s.catBtn, ...(activeCategory === cat ? s.catBtnActive : {}) }}
                onClick={() => setActiveCategory(cat)}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div style={s.branchList}>
          {filteredBranches.map(branch => (
            <ErrorBoundary key={branch.name}>
              <BranchCard
                branch={branch}
                masteryLevel={masteryLevels[branch.name] || 0}
                specLevels={specLevels}
                onMastery={v => setMastery(branch.name, v)}
                onSpec={setSpec}
                expanded={expandedBranch === branch.name}
                onToggle={() => toggleBranch(branch.name)}
              />
            </ErrorBoundary>
          ))}
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BRANCH CARD
// ─────────────────────────────────────────────────────────────
function BranchCard({ branch, masteryLevel, specLevels, onMastery, onSpec, expanded, onToggle }) {
  const items   = branch?.items || [];
  const specced = items.filter(i => (specLevels[i?.id] || 0) > 0).length;
  const maxSpec = items.reduce((m, i) => Math.max(m, specLevels[i?.id] || 0), 0);

  return (
    <div style={s.card}>
      {/* Clickable title row */}
      <div style={s.cardTitleRow} onClick={onToggle}>
        <span style={s.cardTitle}>{branch.name}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={s.badge}>{items.length} items</span>
          {specced > 0 && <span style={{ ...s.badge, ...s.badgeActive }}>{specced} specced</span>}
          {maxSpec > 0 && <span style={{ ...s.badge, ...s.badgeLevel }}>max {maxSpec}</span>}
          <span style={s.arrow}>{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* Mastery slider — always visible */}
      <div style={s.masteryRow}>
        <span style={s.masteryLabel}>Mastery</span>
        <input type="range" min={0} max={100} value={masteryLevel}
          onChange={e => onMastery(e.target.value)} style={s.slider} />
        <input type="number" min={0} max={100} value={masteryLevel}
          onChange={e => onMastery(e.target.value)} style={s.numInput} />
        <span style={s.pts}>+{(masteryLevel * 30).toLocaleString()} pts</span>
      </div>

      {/* Items — only when expanded */}
      {expanded && (
        <div style={s.itemGrid}>
          {items.map(item => {
            if (!item?.id) return null;
            const specLevel    = specLevels[item.id] || 0;
            const mutual       = getMutualBonus(item, items, specLevels);
            const efficiency   = calcEfficiency(masteryLevel, specLevel, mutual, item.uniqueBonus);
            const reduction    = calcReduction(efficiency);

            return (
              <div key={item.id}
                style={{ ...s.itemRow, ...(specLevel > 0 ? s.itemRowActive : {}) }}>
                <div style={s.itemName}>{item.name || item.id}</div>

                <div style={s.itemControls}>
                  <input type="range" min={0} max={100} value={specLevel}
                    onChange={e => onSpec(item.id, e.target.value)}
                    style={{ ...s.slider, accentColor: "#a78bfa" }} />
                  <input type="number" min={0} max={100} value={specLevel}
                    onChange={e => onSpec(item.id, e.target.value)}
                    style={s.numInput} />
                </div>

                <div style={s.itemStats}>
                  <span style={s.itemStat}>
                    <span style={s.statLabel}>Unique</span>
                    <span style={s.statVal}>+{(specLevel * (item.uniqueBonus || 250)).toLocaleString()}</span>
                  </span>
                  <span style={s.itemStat}>
                    <span style={s.statLabel}>Efficiency</span>
                    <span style={s.statVal}>{efficiency.toLocaleString()}</span>
                  </span>
                  <span style={s.itemStat}>
                    <span style={s.statLabel}>Reduction</span>
                    <span style={{ ...s.statVal, color: "#a78bfa" }}>
                      {isNaN(reduction) ? "0.0" : reduction.toFixed(1)}%
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div style={s.statBox}>
      <div style={s.statBoxVal}>{value}</div>
      <div style={s.statBoxLabel}>{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────
const s = {
  root: { minHeight: "100vh", background: "#0f0f13", color: "#e8e6e1", fontFamily: "inherit" },
  header: { background: "#13131a", borderBottom: "2px solid #2a2a38", padding: "14px 0" },
  headerInner: { maxWidth: 1340, margin: "0 auto", padding: "0 24px",
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 },
  title: { fontSize: 20, fontWeight: 700, color: "#f0c030" },
  subtitle: { fontSize: 11, color: "#6b6b88", letterSpacing: "0.08em",
    textTransform: "uppercase", marginTop: 2 },
  stats: { display: "flex", gap: 16 },
  statBox: { background: "#1e1e2e", border: "1px solid #2a2a3a", borderRadius: 8,
    padding: "8px 16px", textAlign: "center" },
  statBoxVal: { fontSize: 22, fontWeight: 700, color: "#a78bfa", fontFamily: "monospace" },
  statBoxLabel: { fontSize: 10, color: "#6060a0", letterSpacing: "0.08em", textTransform: "uppercase" },

  main: { maxWidth: 1340, margin: "0 auto", padding: "20px 24px 80px" },

  toolbar: { display: "flex", gap: 12, alignItems: "center", marginBottom: 16, flexWrap: "wrap" },
  search: { background: "#0f0f18", border: "1px solid #3a3a52", borderRadius: 6,
    color: "#f0eeea", padding: "8px 14px", fontSize: 14, outline: "none", minWidth: 220 },
  catRow: { display: "flex", gap: 6 },
  catBtn: { background: "#111118", border: "1px solid #2a2a3a", borderRadius: 6,
    color: "#7070a0", fontSize: 12, padding: "5px 14px", cursor: "pointer" },
  catBtnActive: { background: "#1e1400", border: "1px solid #f0a030", color: "#f0c060" },

  branchList: { display: "flex", flexDirection: "column", gap: 8 },

  card: { background: "#17171f", border: "1px solid #2a2a3a", borderRadius: 10, overflow: "hidden" },
  cardTitleRow: { display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "11px 16px", cursor: "pointer", userSelect: "none",
    borderBottom: "1px solid #1e1e2a" },
  cardTitle: { fontSize: 15, fontWeight: 700, color: "#e8e6e1" },
  arrow: { fontSize: 11, color: "#6b6b88", marginLeft: 4 },
  badge: { fontSize: 10, background: "#1e1e2e", color: "#6060a0",
    border: "1px solid #2a2a3a", borderRadius: 4, padding: "2px 7px", fontFamily: "monospace" },
  badgeActive: { background: "#1a1a2e", color: "#a78bfa", border: "1px solid #4a4a80" },
  badgeLevel:  { background: "#1e1400", color: "#f0c030", border: "1px solid #5a4400" },

  masteryRow: { display: "flex", alignItems: "center", gap: 10,
    padding: "8px 16px", borderBottom: "1px solid #1a1a22" },
  masteryLabel: { fontSize: 11, color: "#9090b0", minWidth: 56, fontWeight: 600 },
  slider: { flex: 1, maxWidth: 220, accentColor: "#f0a030" },
  numInput: { background: "#0f0f18", border: "1px solid #3a3a52", borderRadius: 4,
    color: "#e8e6e1", padding: "2px 6px", fontSize: 12, fontFamily: "monospace",
    outline: "none", width: 46, textAlign: "center" },
  pts: { fontSize: 11, fontFamily: "monospace", color: "#f0c030", minWidth: 70 },

  itemGrid: { display: "flex", flexDirection: "column" },
  itemRow: { padding: "9px 16px", borderBottom: "1px solid #1a1a22",
    display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  itemRowActive: { background: "#13132a" },
  itemName: { fontSize: 13, color: "#c0c0e0", minWidth: 180, fontWeight: 500 },
  itemControls: { display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 200 },
  itemStats: { display: "flex", gap: 14, flexWrap: "wrap" },
  itemStat: { display: "flex", flexDirection: "column", gap: 1 },
  statLabel: { fontSize: 8, color: "#4a4a6a", letterSpacing: "0.1em", textTransform: "uppercase" },
  statVal: { fontSize: 12, fontFamily: "monospace", color: "#c0c0e0", fontWeight: 600 },
};