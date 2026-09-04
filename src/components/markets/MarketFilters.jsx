// Filtres pour la page /marches : par catégorie d'actif et par tag de
// classification comportementale, + recherche texte.
import PropTypes from 'prop-types';
import { MARKET_CATEGORIES, MARKET_TAGS } from '../../constants/markets';

export default function MarketFilters({ filters, onChange }) {
  function update(patch) {
    onChange({ ...filters, ...patch });
  }

  return (
    <div className="flex flex-col gap-3 mb-4">
      <input
        type="text"
        placeholder="Rechercher un marché (symbole ou nom)…"
        value={filters.search}
        onChange={(e) => update({ search: e.target.value })}
        className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent/60"
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => update({ category: 'all' })}
          className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wide border transition-colors ${
            filters.category === 'all'
              ? 'text-accent border-accent/20 bg-accent/10'
              : 'text-text-secondary border-card-border hover:border-text-secondary'
          }`}
        >
          Toutes catégories
        </button>
        {MARKET_CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            onClick={() => update({ category: c.value })}
            className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wide border transition-colors ${
              filters.category === c.value
                ? 'text-accent border-accent/20 bg-accent/10'
                : 'text-text-secondary border-card-border hover:border-text-secondary'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => update({ tag: 'all' })}
          className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wide border transition-colors ${
            filters.tag === 'all'
              ? 'text-text-primary border-text-secondary/50 bg-white/[0.04]'
              : 'text-text-secondary border-card-border hover:border-text-secondary'
          }`}
        >
          Tous comportements
        </button>
        {MARKET_TAGS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => update({ tag: t.value })}
            title={t.description}
            className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wide border transition-colors ${
              filters.tag === t.value ? t.color : 'text-text-secondary border-card-border hover:border-text-secondary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

MarketFilters.propTypes = {
  filters: PropTypes.shape({
    search: PropTypes.string,
    category: PropTypes.string,
    tag: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};
