import { categories } from "../data/seedData.js";

// theme="dark" (default) matches the app's navy/gold UI everywhere it's
// currently used. theme="light" swaps the colours for a white-page,
// formal-document context — used only by the printable client report.
export default function BusinessDNA({ scores, theme = "dark" }) {
  const values = scores || [82, 76, 61, 74, 67, 70, 58, 63, 42, 79, 69];
  const c = 150, r = 110;
  const isLight = theme === "light";
  const gridStroke = isLight ? "rgba(4,20,47,.12)" : "rgba(255,255,255,.12)";
  const accent = isLight ? "#0B2A57" : "#F6C400";
  const fillAccent = isLight ? "rgba(11,42,87,.14)" : "rgba(246,196,0,.28)";
  const labelColour = isLight ? "#33405C" : "#fff";
  const centreColour = isLight ? "#0B2A57" : "#F6C400";

  const points = categories.map((cat, i) => {
    const angle = (Math.PI * 2 * i) / categories.length - Math.PI / 2;
    const rr = r * ((values[i] || 0) / 100);
    return {
      x: c + Math.cos(angle) * rr,
      y: c + Math.sin(angle) * rr,
      lx: c + Math.cos(angle) * (r + 26),
      ly: c + Math.sin(angle) * (r + 26),
      label: cat.split(" ")[0]
    };
  });
  return (
    <div className="dna">
      <svg viewBox="0 0 300 300">
        {[25, 50, 75, 100].map((v) => (
          <circle key={v} cx={c} cy={c} r={(r * v) / 100} fill="none" stroke={gridStroke} />
        ))}
        <polygon points={points.map((p) => `${p.x},${p.y}`).join(" ")} fill={fillAccent} stroke={accent} strokeWidth="3" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill={accent} />
            <text x={p.lx} y={p.ly} fill={labelColour} fontSize="10" textAnchor="middle">{p.label}</text>
          </g>
        ))}
        <text x={c} y={c} fill={centreColour} fontSize="16" fontWeight="800" textAnchor="middle">KIST DNA</text>
      </svg>
    </div>
  );
}
