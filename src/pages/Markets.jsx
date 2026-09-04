// Page de référence des marchés (/marches) : catalogue des principaux
// marchés (actions, indices, forex, matières premières), classés par
// comportement (risk-on, risk-off, saisonnier, sensible aux événements),
// avec une courte description pédagogique pour chacun. L'utilisateur peut
// aussi ajouter manuellement de nouveaux actifs au catalogue.
import { useMemo, useState } from 'react';
import { useMarkets } from '../hooks/useMarkets';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { LoadingState, EmptyState } from '../components/common/LoadingState';
import MarketCard from '../components/markets/MarketCard';
import MarketFilters from '../components/markets/MarketFilters';
import AddMarketForm from '../components/markets/AddMarketForm';

const DEFAULT_FILTERS = { search: '', category: 'all', tag: 'all' };

export default function Markets() {
  const { markets, isLoading, addMarket } = useMarkets();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = useMemo(() => {
    return markets.filter((m) => {
      if (filters.category !== 'all' && m.category !== filters.category) return false;
      if (filters.tag !== 'all' && !m.tags.includes(filters.tag)) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!m.symbol.toLowerCase().includes(q) && !m.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [markets, filters]);

  if (isLoading) return <LoadingState label="Chargement des marchés…" />;

  return (
    <div>
      <PageHeader
        eyebrow="marchés"
        title="Référence des marchés"
        description={`${markets.length} actifs référencés — actions, indices, forex et matières premières, classés par comportement.`}
        actions={
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            + Ajouter un actif
          </Button>
        }
      />

      <MarketFilters filters={filters} onChange={setFilters} />

      {filtered.length === 0 ? (
        <EmptyState title="Aucun marché ne correspond" description="Essayez d'ajuster vos filtres." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <MarketCard key={m.symbol} market={m} />
          ))}
        </div>
      )}

      {showAddModal && (
        <Modal title="Ajouter un actif" onClose={() => setShowAddModal(false)}>
          <AddMarketForm
            onCancel={() => setShowAddModal(false)}
            onSubmit={async (market) => {
              await addMarket(market);
              setShowAddModal(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
