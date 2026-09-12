// Carte KPI compacte affichée sur le tableau de bord (taux de réussite, P&L, etc.)
import PropTypes from 'prop-types';

export default function KpiCard({ label, value, sublabel, tone = 'neutral', className = '' }) {
  const toneClass = tone === 'positive' ? 'text-accent' : tone === 'negative' ? 'text-danger' : 'text-text-primary';
  const glowClass =
    tone === 'positive'
      ? 'shadow-[0_0_24px_rgba(0,170,68,0.10)]'
      : tone === 'negative'
        ? 'shadow-[0_0_24px_rgba(255,82,82,0.10)]'
        : 'shadow-[0_0_24px_rgba(0,0,0,0.25)]';
  const hairlineClass =
    tone === 'positive' ? 'bg-accent/40' : tone === 'negative' ? 'bg-danger/40' : 'bg-card-border';

  return (
    <div
      className={`relative overflow-hidden bg-card border border-card-border rounded-card p-3 sm:p-4 flex flex-col gap-1 min-w-0 ${glowClass} ${className}`}
    >
      <span className={`absolute inset-x-0 top-0 h-px ${hairlineClass}`} />
      <span className="text-[10px] sm:text-[11px] uppercase tracking-wide text-text-secondary font-mono truncate">
        {label}
      </span>
      <span className={`font-mono text-lg sm:text-2xl font-semibold ${toneClass} truncate`}>{value}</span>
      {sublabel && <span className="text-xs text-text-secondary font-mono truncate">{sublabel}</span>}
    </div>
  );
}

KpiCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  sublabel: PropTypes.string,
  tone: PropTypes.oneOf(['neutral', 'positive', 'negative']),
  className: PropTypes.string,
};
