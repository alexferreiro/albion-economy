import { useState } from "react";
import { Metric } from "../shared/Metric.jsx";
import { fmt, formatMatName } from "../../utils/formatting.js";
import { calcCost, calcProfit, calcFocusCostForRow } from "../../utils/calculations.js";
import { TIER_COLORS } from "../../utils/constants.js";

export function EnchantCard({
  row, tier, rrr, baseItem, useFocus,
  manualPrices, onSetPrice, onClearPrice,
}) {
  const c  = TIER_COLORS[tier];
  const rk = `${row.tier}${row.enchant}`;
  const [qty, setQty] = useState(1);

  // Resolve effective price: manual override wins over API price
  const effectivePrice = (matId, apiData) => {
    const val = manualPrices[`${rk}::${matId}`];
    if (val !== undefined && val !== "") {
      const n = parseFloat(val);
      if (!isNaN(n) && n >= 0) return n;
    }
    return apiData?.price ?? null;
  };

  const focusCostPerItem = calcFocusCostForRow(row, baseItem, useFocus);
  const totalCost   = calcCost(row, effectivePrice, rrr, qty, baseItem, useFocus);
  const totalProfit = calcProfit(row, totalCost, qty);
  const totalFocus  = focusCostPerItem * qty;
  const positive    = totalProfit !== null && totalProfit > 0;

  return (
    <div style={{ ...s.card, borderColor: c.border + "aa" }}>
      {/* Header */}
      <div style={{ ...s.cardHead, background: c.header }}>
        <div style={s.titleRow}>
          <span style={{ ...s.enchantBadge, color: c.text, borderColor: c.border }}>
            {row.enchant}
          </span>
          <span style={s.itemId}>{row.itemId}</span>
          {row.loading && <span style={s.spinner}>⟳</span>}
        </div>

        <div style={s.metricsRow}>
          <div style={s.metrics}>
            <Metric label="Avg sell"
                    value={fmt(row.sellPrice)}
                    color={c.text} />
            <Metric label={qty > 1 ? `Craft cost ×${qty}` : "Craft cost"}
                    value={totalCost !== null ? fmt(totalCost) : "—"} />
            <Metric label={qty > 1 ? `Profit ×${qty}` : "Profit"}
                    value={totalProfit !== null ? (positive ? "+" : "") + fmt(totalProfit) : "—"}
                    color={totalProfit === null ? "#555" : positive ? "#5cba7a" : "#e06060"}
                    bold />
            {row.recipe?.silver > 0 && (
              <Metric label="Silver fee"
                      value={fmt((row.recipe.silver || 0) * qty)} />
            )}
            {totalFocus > 0 && (
              <Metric label={qty > 1 ? `Focus ×${qty}` : "Focus cost"}
                      value={fmt(totalFocus)}
                      color="#a78bfa" />
            )}
          </div>

          <div style={s.qtyWrap}>
            <label style={s.qtyLabel}>Qty</label>
            <input
              type="number" min={1} max={9999} value={qty}
              onChange={e => setQty(Math.max(1, Math.floor(Number(e.target.value)) || 1))}
              style={s.qtyInput}
            />
          </div>
        </div>
      </div>

      {/* Materials */}
      {!row.loading && (
        <div style={s.body}>
          {row.recipe ? (
            <>
              <div style={s.sectionTitle}>📦 Crafting materials</div>
              <div style={s.matList}>
                {row.recipe.materials.map(m => {
                  const apiData    = row.materialPrices[m.uniqueName] ?? null;
                  const manVal     = manualPrices[`${rk}::${m.uniqueName}`] ?? "";
                  const effP       = effectivePrice(m.uniqueName, apiData);
                  const overridden = manVal !== "";

                  const totalNeeded = qty * m.count;
                  const returned    = Math.floor(totalNeeded * rrr);
                  const toBuy       = totalNeeded - returned;
                  const subtot      = effP !== null ? effP * toBuy : null;

                  return (
                    <div
                      key={m.uniqueName}
                      style={{
                        ...s.matRow,
                        borderColor: overridden ? c.border : "#252534",
                        background:  overridden ? c.header : "#111118",
                      }}
                    >
                      <div style={s.matTop}>
                        <span style={s.matId}>{formatMatName(m.uniqueName)}</span>
                        <div style={s.matQtyBlock}>
                          <span style={{ ...s.matQty, color: c.text }}>
                            × {m.count} per craft
                          </span>
                          {qty > 1 && (
                            <span style={s.matQtyTotal}>
                              {totalNeeded.toLocaleString("en-US")} needed
                            </span>
                          )}
                          {rrr > 0 && (
                            <span style={s.matQtyBuy}>
                              → {toBuy.toLocaleString("en-US")} to buy
                              {returned > 0 && (
                                <span style={s.matQtyReturned}> ({returned} returned)</span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={s.matBottom}>
                        {/* API price + cheapest city */}
                        <div style={s.apiBlock}>
                          <div style={s.apiPriceCol}>
                            <div style={s.apiPriceRow}>
                              <span style={s.apiTag}>API</span>
                              <span style={s.apiVal}>
                                {apiData ? fmt(apiData.price) : "no data"}
                              </span>
                            </div>
                            {apiData?.city && (
                              <span style={s.cityTag}>{apiData.city}</span>
                            )}
                          </div>
                        </div>

                        {/* Manual price */}
                        <div style={s.inputWrap}>
                          <input
                            type="number" min="0" placeholder="Manual…"
                            value={manVal}
                            onChange={e => onSetPrice(rk, m.uniqueName, e.target.value)}
                            style={{
                              ...s.matInput,
                              borderColor: overridden ? c.border : "#2e2418",
                              color:       overridden ? c.text  : "#807060",
                            }}
                          />
                          {overridden && (
                            <button
                              style={s.clearBtn}
                              onClick={() => onClearPrice(rk, m.uniqueName)}
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {subtot !== null && (
                          <span style={{ ...s.subtotal, color: c.accent }}>
                            = {fmt(subtot)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p style={s.noRecipe}>⚠ Item not craftable or recipe unavailable</p>
          )}
        </div>
      )}
    </div>
  );
}

const s = {
  card:    { border: "1px solid", borderWidth: "0 1px 1px 0", display: "flex", flexDirection: "column" },
  cardHead:{ padding: "12px 14px", borderBottom: "1px solid #1e1e28" },
  titleRow:{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 },
  enchantBadge: {
    border: "1px solid", borderRadius: 4, padding: "2px 8px",
    fontSize: 12, fontWeight: 700, fontFamily: "monospace", flexShrink: 0,
  },
  itemId:  { fontSize: 10, color: "#50506a", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  spinner: { fontSize: 12, color: "#6060a0", flexShrink: 0 },

  metricsRow: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  metrics:    { display: "flex", gap: 18, flexWrap: "wrap", flex: 1 },
  qtyWrap:    { display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flexShrink: 0 },
  qtyLabel:   { fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6060a0" },
  qtyInput: {
    background: "#0f0f18", border: "1px solid #3a3a52", borderRadius: 4,
    color: "#f0c030", padding: "3px 6px", fontSize: 13, fontFamily: "monospace",
    outline: "none", width: 58, textAlign: "center", fontWeight: 700,
  },

  body:        { padding: "10px 14px", flex: 1 },
  sectionTitle:{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7070a0", marginBottom: 8 },
  matList:     { display: "flex", flexDirection: "column", gap: 5 },

  matRow:     { border: "1px solid", borderRadius: 6, padding: "7px 10px", display: "flex", flexDirection: "column", gap: 5 },
  matTop:     { display: "flex", justifyContent: "space-between", alignItems: "center" },
  matId:      { fontSize: 11, fontFamily: "monospace", color: "#b0b0cc" },
  matQty:     { fontSize: 11, fontFamily: "monospace", fontWeight: 700, flexShrink: 0 },
  matQtyBlock:{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 },
  matQtyTotal:{ fontSize: 10, color: "#6060a0" },
  matQtyBuy:  { fontSize: 11, fontFamily: "monospace", color: "#f0c030", fontWeight: 700 },
  matQtyReturned: { fontSize: 10, color: "#4dde8a", fontWeight: 400 },
  matBottom:  { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },

  apiBlock:   { display: "flex", gap: 5, alignItems: "flex-start", minWidth: 110 },
  apiPriceCol:{ display: "flex", flexDirection: "column", gap: 2 },
  apiPriceRow:{ display: "flex", gap: 5, alignItems: "center" },
  apiTag:     { fontSize: 9, fontWeight: 600, background: "#1e1e30", color: "#7070a8", padding: "1px 5px", borderRadius: 3, letterSpacing: "0.06em" },
  apiVal:     { fontSize: 11, fontFamily: "monospace", color: "#a0a0c0" },
  cityTag: {
    fontSize: 9, fontWeight: 600, color: "#50c878", background: "#0a1f0f",
    border: "1px solid #1a4a2a", borderRadius: 3, padding: "1px 5px",
    letterSpacing: "0.04em", whiteSpace: "nowrap",
  },

  inputWrap:  { display: "flex", alignItems: "center", gap: 4, flex: 1, minWidth: 120 },
  matInput: {
    background: "#0f0f18", border: "1px solid", borderRadius: 4,
    padding: "3px 8px", fontSize: 11, fontFamily: "monospace",
    outline: "none", width: "100%", boxSizing: "border-box",
  },
  clearBtn: {
    background: "none", border: "1px solid #3a2a14", borderRadius: 3,
    color: "#c08030", fontSize: 10, cursor: "pointer", padding: "2px 6px", flexShrink: 0,
  },
  subtotal:{ fontSize: 12, fontFamily: "monospace", fontWeight: 700, flexShrink: 0, minWidth: 70, textAlign: "right" },
  noRecipe:{ fontSize: 11, color: "#6060a0", fontStyle: "italic", margin: 0 },
};