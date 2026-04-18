export default function StatCard({ label, value, sub, accent = false, color }) {
  const colorMap = {
    green: 'text-outcome-win',
    red: 'text-outcome-loss',
    gold: 'text-accent-gold',
    purple: 'text-outcome-be',
    default: 'text-text-primary',
  };
  const textColor = colorMap[color] || colorMap.default;

  return (
    <div className={`stat-card transition-all hover:border-bg-hover ${accent ? 'border-accent-gold/30 bg-accent-gold-glow' : ''}`}>
      <p className="text-xs text-text-muted font-medium uppercase tracking-wider">{label}</p>
      <p className={`num text-2xl font-semibold mt-1 ${textColor}`}>{value ?? '—'}</p>
      {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
    </div>
  );
}
