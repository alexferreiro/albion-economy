export function RRRPanel({
  mode, onMode,
  citySpecialized, onCitySpec,
  hideoutZoneQ, onZoneQ,
  hideoutPower, onPower,
  hideoutSpec, onHideoutSpec,
  useFocus, onFocus,
  dailyBonus, onDaily,
  productionBonus, rrr,
}) {
  return (
    <div style={s.panel}>
      <div style={s.title}>
        <span>Resource Return Rate (RRR)</span>
        <span style={s.badge}>
          PB: <strong>{productionBonus}%</strong>
          {" · "}RRR: <strong style={{ color: "#6fcf97" }}>{(rrr * 100).toFixed(1)}%</strong>
        </span>
      </div>

      {/* Location mode */}
      <div style={s.row}>
        <span style={s.rowLabel}>Location</span>
        <div style={s.btnGroup}>
          {[
            { id: "none",    label: "No bonus" },
            { id: "city",    label: "🏙 City" },
            { id: "hideout", label: "🏚 Hideout" },
          ].map(opt => (
            <button
              key={opt.id}
              style={{ ...s.btn, ...(mode === opt.id ? s.btnActive : {}) }}
              onClick={() => onMode(opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* City options */}
      {mode === "city" && (
        <div style={s.row}>
          <span style={s.rowLabel}>Specialized bonus</span>
          <label style={s.checkLabel}>
            <input
              type="checkbox"
              checked={citySpecialized}
              onChange={e => onCitySpec(e.target.checked)}
            />
            <span>Item with city bonus (+15%) → total PB 33%</span>
          </label>
        </div>
      )}

      {/* Hideout options */}
      {mode === "hideout" && (
        <>
          <div style={s.row}>
            <span style={s.rowLabel}>Zone quality</span>
            <div style={s.btnGroup}>
              {[1, 2, 3, 4, 5, 6].map(q => (
                <button
                  key={q}
                  style={{ ...s.btn, ...(hideoutZoneQ === q ? s.btnActive : {}) }}
                  onClick={() => onZoneQ(q)}
                >
                  Q{q} (+{({ 1:1,2:6,3:11,4:16,5:21,6:26 })[q]}%)
                </button>
              ))}
            </div>
          </div>

          <div style={s.row}>
            <span style={s.rowLabel}>
              Power Level <span style={s.sub}>(1–9)</span>
            </span>
            <div style={s.sliderWrap}>
              <input
                type="range" min={1} max={9} value={hideoutPower}
                onChange={e => onPower(Number(e.target.value))}
                style={s.slider}
              />
              <span style={s.sliderVal}>Level {hideoutPower}</span>
            </div>
          </div>

          <div style={s.row}>
            <span style={s.rowLabel}>Specialized bonus</span>
            <label style={s.checkLabel}>
              <input
                type="checkbox"
                checked={hideoutSpec}
                onChange={e => onHideoutSpec(e.target.checked)}
              />
              <span>
                Item with hideout specialization (+{((hideoutPower - 1) * 3.75).toFixed(2)}%)
              </span>
            </label>
          </div>
        </>
      )}

      <div style={s.divider} />

      {/* Focus & daily */}
      <div style={s.rowGroup}>
        <div style={s.row}>
          <span style={s.rowLabel}>Crafting focus</span>
          <label style={s.checkLabel}>
            <input
              type="checkbox"
              checked={useFocus}
              onChange={e => onFocus(e.target.checked)}
            />
            <span>Use focus (+59%, requires Premium)</span>
          </label>
        </div>

        <div style={s.row}>
          <span style={s.rowLabel}>Daily bonus</span>
          <div style={s.btnGroup}>
            {[
              { val: 0,  label: "No bonus" },
              { val: 10, label: "+10%" },
              { val: 20, label: "+20%" },
            ].map(opt => (
              <button
                key={opt.val}
                style={{ ...s.btn, ...(dailyBonus === opt.val ? s.btnActive : {}) }}
                onClick={() => onDaily(opt.val)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={s.formula}>
        PB = {productionBonus}% → RRR = {productionBonus} / (100 + {productionBonus}) = {(rrr * 100).toFixed(2)}%
        {" · "}Materials cost reduced by {(rrr * 100).toFixed(1)}% effectively
      </div>
    </div>
  );
}

const s = {
  panel: {
    background: "#17171f", border: "1px solid #2a2a3a", borderRadius: 10,
    padding: "14px 20px", display: "flex", flexDirection: "column", gap: 10,
  },
  title: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    fontSize: 14, fontWeight: 700, color: "#e8e6e1",
  },
  badge: {
    fontFamily: "monospace", fontSize: 12, color: "#c0c0e0",
    background: "#1e1e2e", padding: "3px 12px", borderRadius: 6,
    border: "1px solid #3a3a52",
  },
  row:      { display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" },
  rowGroup: { display: "flex", flexDirection: "column", gap: 8 },
  rowLabel: { fontSize: 12, fontWeight: 500, color: "#9090b0", minWidth: 180, flexShrink: 0 },
  sub:      { fontSize: 10, color: "#60608a" },
  btnGroup: { display: "flex", gap: 5, flexWrap: "wrap" },
  btn: {
    background: "#111118", border: "1px solid #2a2a3a", borderRadius: 6,
    color: "#7070a0", fontSize: 12, padding: "5px 12px", cursor: "pointer",
  },
  btnActive: {
    background: "#1e1400", border: "1px solid #f0a030", color: "#f0c060",
  },
  checkLabel: {
    display: "flex", alignItems: "center", gap: 8,
    fontSize: 12, color: "#c0c0e0", cursor: "pointer",
  },
  sliderWrap: { display: "flex", alignItems: "center", gap: 12 },
  slider:    { width: 160, accentColor: "#f0a030" },
  sliderVal: { fontFamily: "monospace", fontSize: 12, color: "#f0c060", minWidth: 110 },
  divider:   { borderTop: "1px solid #22223a", margin: "2px 0" },
  formula: {
    fontFamily: "monospace", fontSize: 10, color: "#6060a0",
    background: "#0f0f18", padding: "6px 12px", borderRadius: 6,
    border: "1px solid #1e1e2e",
  },
};