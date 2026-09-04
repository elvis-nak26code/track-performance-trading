// Filtre de période réutilisable : "Tous", "Un mois précis" (parmi ceux
// disponibles dans les données), ou "Période personnalisée" (date de début /
// date de fin). Utilisé dans /journal et /analytics.
import PropTypes from 'prop-types';
import { formatMonthKeyFr } from '../../utils/dateHelpers';

export default function PeriodFilter({ value, onChange, availableMonths }) {
  function setMode(mode) {
    onChange({ ...value, mode });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 bg-bg border border-card-border rounded-card p-1">
        {[
          { key: 'all', label: 'Tout' },
          { key: 'month', label: 'Par mois' },
          { key: 'range', label: 'Personnalisée' },
        ].map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setMode(opt.key)}
            className={`px-2.5 py-1 rounded-card text-xs font-mono transition-colors ${
              value.mode === opt.key ? 'bg-accent/10 text-accent border border-accent/20' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {value.mode === 'month' && (
        <select
          value={value.month || ''}
          onChange={(e) => onChange({ ...value, month: e.target.value })}
          className="bg-bg border border-card-border rounded-card px-3 py-1.5 text-sm text-text-primary font-mono focus:outline-none focus:border-accent/60"
        >
          <option value="" disabled>
            Choisir un mois…
          </option>
          {availableMonths.map((m) => (
            <option key={m} value={m}>
              {formatMonthKeyFr(m)}
            </option>
          ))}
        </select>
      )}

      {value.mode === 'range' && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={value.start || ''}
            onChange={(e) => onChange({ ...value, start: e.target.value })}
            className="bg-bg border border-card-border rounded-card px-2 py-1.5 text-sm text-text-primary font-mono focus:outline-none focus:border-accent/60"
          />
          <span className="text-text-secondary text-xs">→</span>
          <input
            type="date"
            value={value.end || ''}
            onChange={(e) => onChange({ ...value, end: e.target.value })}
            className="bg-bg border border-card-border rounded-card px-2 py-1.5 text-sm text-text-primary font-mono focus:outline-none focus:border-accent/60"
          />
        </div>
      )}
    </div>
  );
}

PeriodFilter.propTypes = {
  value: PropTypes.shape({
    mode: PropTypes.oneOf(['all', 'month', 'range']).isRequired,
    month: PropTypes.string,
    start: PropTypes.string,
    end: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  availableMonths: PropTypes.arrayOf(PropTypes.string).isRequired,
};
