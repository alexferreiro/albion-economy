import { useState } from "react";
import { EnchantCard } from "./EnchantCard.jsx";
import { TIER_COLORS } from "../../utils/constants.js";

export function TierSection({ tier, enchants, rrr, baseItem, useFocus, manualPrices, onSetPrice, onClearPrice }) {
  const [open, setOpen] = useState(true);
  const c = TIER_COLORS[tier];

  return (
    <div style={{ ...s.block, borderColor: c.border + "cc" }}>
      <button
        style={{ ...s.header, background: c.header, borderColor: c.border }}
        onClick={() => setOpen(v => !v)}
      >
        <span style={{ ...s.label, color: c.text }}>Tier {tier}</span>
        <span style={{ color: c.text, opacity: 0.45, fontSize: 11, fontFamily: "monospace" }}>
          {open ? "▼ collapse" : "▶ expand"}
        </span>
      </button>

      {open && (
        <div style={s.grid}>
          {enchants.map(row => (
            <EnchantCard
              key={row.enchant}
              row={row}
              tier={tier}
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
    </div>
  );
}

const s = {
  block: { border: "1px solid", borderRadius: 10, overflow: "hidden" },
  header: {
    width: "100%", border: "none", borderBottom: "1px solid",
    padding: "10px 18px", display: "flex", justifyContent: "space-between",
    alignItems: "center", cursor: "pointer",
  },
  label: { fontSize: 14, fontWeight: 700, letterSpacing: "0.04em" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
    background: "#0f0f13",
  },
};