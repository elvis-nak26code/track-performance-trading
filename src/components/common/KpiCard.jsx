// Carte KPI compacte affichée sur le tableau de bord (taux de réussite, P&L, etc.)
import PropTypes from 'prop-types';

export default function KpiCard({ label, value, sublabel, tone = 'neutral' }) {
  const toneClass = tone === 'positive' ? 'text-accent' : tone === 'negative' ? 'text-danger' : 'text-text-primary';

  return (
    <div className="bg-card border border-card-border rounded-card p-4 flex flex-col gap-1 min-w-0">
      <span className="text-[11px] uppercase tracking-wide text-text-secondary font-mono truncate">
        {label}
      </span>
      <span className={`font-mono text-2xl font-semibold ${toneClass} truncate`}>{value}</span>
      {sublabel && <span className="text-xs text-text-secondary font-mono truncate">{sublabel}</span>}
    </div>
  );
}

KpiCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  sublabel: PropTypes.string,
  tone: PropTypes.oneOf(['neutral', 'positive', 'negative']),
};
