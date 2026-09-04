// Carte de présentation d'un marché/instrument : symbole, nom, tags de
// classification comportementale, et description de son comportement.
import PropTypes from 'prop-types';
import { getMarketTagMeta, getMarketCategoryLabel } from '../../constants/markets';

export default function MarketCard({ market }) {
  return (
    <div className="bg-card border border-card-border rounded-card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-mono text-text-primary font-semibold">{market.symbol}</p>
          <p className="text-sm text-text-secondary">{market.name}</p>
        </div>
        <span className="text-[11px] font-mono uppercase tracking-wide text-text-secondary border border-card-border rounded-full px-2 py-0.5 whitespace-nowrap">
          {getMarketCategoryLabel(market.category)}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {market.tags.map((tag) => {
          const meta = getMarketTagMeta(tag);
          return (
            <span
              key={tag}
              className={`px-2 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wide border border-white/30 ${meta.color}`}
              title={meta.description}
            >
              {meta.label}
            </span>
          );
        })}
      </div>
      <p className="text-sm text-text-secondary leading-relaxed">{market.description}</p>
    </div>
  );
}

MarketCard.propTypes = {
  market: PropTypes.shape({
    symbol: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
};
