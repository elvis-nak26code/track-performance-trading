// Section "Marchés" du tableau de bord : liste des actifs prédéfinis
// (classés par comportement : risk-on, risk-off, saisonnier, événements),
// limitée à un maximum d'éléments, avec possibilité de supprimer un actif
// et un lien vers la page complète /marches.
import { memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarkets } from '../../hooks/useMarkets';
import Card from '../common/Card';
import { getMarketTagMeta, getMarketCategoryLabel } from '../../constants/markets';
import { Trash2, ArrowRight } from 'lucide-react';

const MAX_VISIBLE = 6;

const CATEGORY_ORDER = [
  'indice',
  'action',
  'forex',
  'matiere-premiere',
  'crypto',
  'synthetique',
];

function DashboardMarkets() {
  const navigate = useNavigate();
  const { markets, isLoading, removeMarket } = useMarkets();

  const visible = useMemo(
    () =>
      [...markets]
        .sort(
          (a, b) =>
            CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) ||
            a.symbol.localeCompare(b.symbol)
        )
        .slice(0, MAX_VISIBLE),
    [markets]
  );

  function handleDelete(market) {
    if (!window.confirm(`Supprimer « ${market.name} » de la liste ?`)) return;
    removeMarket(market).catch(() => {});
  }

  return (
    <Card
      title="Marchés"
      action={
        <button
          type="button"
          onClick={() => navigate('/marches')}
          className="inline-flex items-center gap-1 text-xs font-mono text-accent hover:text-accent-soft transition-colors"
        >
          Voir tout
          <ArrowRight size={13} />
        </button>
      }
    >
      {isLoading ? (
        <p className="text-sm text-text-secondary">Chargement des actifs…</p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-text-secondary">Aucun actif référencé.</p>
      ) : (
        <>
          <ul className="divide-y divide-card-border">
            {visible.map((m) => (
              <li key={m.symbol} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-semibold text-text-primary">
                      {m.symbol}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wide text-text-secondary border border-card-border rounded-full px-1.5 py-0.5">
                      {getMarketCategoryLabel(m.category)}
                    </span>
                    {m.tags.slice(0, 2).map((tag) => {
                      const meta = getMarketTagMeta(tag);
                      return (
                        <span
                          key={tag}
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wide border border-white/30 ${meta.color}`}
                          title={meta.description}
                        >
                          {meta.label}
                        </span>
                      );
                    })}
                  </div>
                  <p className="text-xs text-text-secondary truncate mt-0.5">{m.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(m)}
                  title="Supprimer cet actif"
                  aria-label={`Supprimer ${m.name}`}
                  className="p-1.5 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 pt-3 border-t border-card-border text-xs text-text-secondary">
            {markets.length} actifs au total — personnalisez la liste depuis la page Marchés.
          </p>
        </>
      )}
    </Card>
  );
}

export default memo(DashboardMarkets);