import { categories } from "../data/seedData.js";

export default function BusinessDNA({ scores }) {
  const values = scores || [82, 76, 61, 74, 67, 70, 58, 63, 42, 79, 69];
  const c = 150, r = 110;
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
          <circle key={v} cx={c} cy={c} r={(r * v) / 100} fill="none" stroke="rgba(255,255,255,.12)" />
        ))}
        <polygon points={points.map((p) => `${p.x},${p.y}`).join(" ")} fill="rgba(246,196,0,.28)" stroke="#F6C400" strokeWidth="3" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="#F6C400" />
            <text x={p.lx} y={p.ly} fill="#fff" fontSize="10" textAnchor="middle">{p.label}</text>
          </g>
        ))}
        <text x={c} y={c} fill="#F6C400" fontSize="16" fontWeight="800" textAnchor="middle">KIST DNA</text>
      </svg>
    </div>
  );
}
