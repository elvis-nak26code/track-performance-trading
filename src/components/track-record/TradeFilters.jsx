// Barre de filtres pour /track-record : stratégie, résultat, période, recherche texte.
import PropTypes from 'prop-types';
import { STRATEGIES } from '../../constants/strategies';

export default function TradeFilters({ filters, onChange }) {
  function update(patch) {
    onChange({ ...filters, ...patch });
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <input
        type="text"
        placeholder="Rechercher un symbole…"
        value={filters.search}
        onChange={(e) => update({ search: e.target.value })}
        className="flex-1 bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent/60"
      />
      <select
        value={filters.strategy}
        onChange={(e) => update({ strategy: e.target.value })}
        className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-accent/60"
      >
        <option value="all">Toutes les approches</option>
        {STRATEGIES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <select
        value={filters.outcome}
        onChange={(e) => update({ outcome: e.target.value })}
        className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-accent/60"
      >
        <option value="all">Tous les résultats</option>
        <option value="win">Gagnants</option>
        <option value="loss">Perdants</option>
      </select>
      <select
        value={filters.period}
        onChange={(e) => update({ period: e.target.value })}
        className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-accent/60"
      >
        <option value="all">Toute la période</option>
        <option value="7d">7 derniers jours</option>
        <option value="30d">30 derniers jours</option>
        <option value="90d">90 derniers jours</option>
      </select>
    </div>
  );
}

TradeFilters.propTypes = {
  filters: PropTypes.shape({
    search: PropTypes.string,
    strategy: PropTypes.string,
    outcome: PropTypes.string,
    period: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};
