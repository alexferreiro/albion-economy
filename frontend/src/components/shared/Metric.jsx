export function Metric({ label, value, color, bold }) {
  return (
    <div style={s.metric}>
      <span style={s.label}>{label}</span>
      <span style={{
        ...s.value,
        color: color || "#b0a898",
        fontWeight: bold ? 700 : 500,
      }}>
        {value}
      </span>
    </div>
  );
}

const s = {
  metric: { display: "flex", flexDirection: "column", gap: 3 },
  label: {
    fontSize: 9, fontWeight: 600, letterSpacing: "0.1em",
    textTransform: "uppercase", color: "#6060a0",
  },
  value: { fontSize: 15, fontFamily: "monospace", fontWeight: 600 },
};