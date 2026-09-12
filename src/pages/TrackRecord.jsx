// Page Track record (/track-record) : tableau complet des trades, filtres,
// tri, ajout manuel, import CSV, édition et suppression.
import { useMemo, useState } from 'react';
import { subDays, isAfter, parseISO } from 'date-fns';
import { useTrades } from '../hooks/useTrades';
import { usePlan } from '../context/PlanContext';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { LoadingState } from '../components/common/LoadingState';
import TradesTable from '../components/track-record/TradesTable';
import TradeFilters from '../components/track-record/TradeFilters';
import TradeForm from '../components/track-record/TradeForm';
import CsvImportModal from '../components/track-record/CsvImportModal';

const DEFAULT_FILTERS = { search: '', strategy: 'all', outcome: 'all', period: 'all' };

export default function TrackRecord() {
  const { trades, isLoading, addTrade, addTradesBulk, editTrade, removeTrade } = useTrades();
  const { requirePlan } = usePlan();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);

  const filteredTrades = useMemo(() => {
    return trades.filter((t) => {
      if (filters.search && !t.symbol.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.strategy !== 'all' && !(t.strategies || []).includes(filters.strategy)) return false;
      if (filters.outcome === 'win' && t.pnl <= 0) return false;
      if (filters.outcome === 'loss' && t.pnl > 0) return false;
      if (filters.period !== 'all') {
        const days = filters.period === '7d' ? 7 : filters.period === '30d' ? 30 : 90;
        if (!isAfter(parseISO(t.date), subDays(new Date(), days))) return false;
      }
      return true;
    });
  }, [trades, filters]);

  function handlePrint() {
    window.print();
  }

  if (isLoading) return <LoadingState label="Chargement du track record…" />;

  return (
    <div>
      <PageHeader
        eyebrow="track record"
        title="All Trades"
        description={`${trades.length} trade${trades.length > 1 ? 's' : ''} au total.`}
        actions={
          <>
            <Button variant="secondary" onClick={handlePrint}>
              Exporter / Imprimer PDF
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (requirePlan('importer des trades')) setShowImportModal(true);
              }}
            >
              Importer CSV
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                if (requirePlan('enregistrer un nouveau trade')) {
                  setEditingTrade(null);
                  setShowTradeModal(true);
                }
              }}
            >
              + Log trade
            </Button>
          </>
        }
      />

      <Card>
        <TradeFilters filters={filters} onChange={setFilters} />
        <TradesTable
          trades={filteredTrades}
          onEdit={(trade) => {
            setEditingTrade(trade);
            setShowTradeModal(true);
          }}
          onDelete={(id) => {
            if (window.confirm('Supprimer définitivement ce trade ?')) removeTrade(id);
          }}
        />
      </Card>

      {showTradeModal && (
        <Modal title={editingTrade ? 'Modifier le trade' : 'Nouveau trade'} onClose={() => setShowTradeModal(false)}>
          <TradeForm
            initialTrade={editingTrade}
            onCancel={() => setShowTradeModal(false)}
            onSubmit={async (trade) => {
              if (editingTrade) {
                await editTrade(editingTrade.id, trade);
              } else {
                await addTrade(trade);
              }
              setShowTradeModal(false);
            }}
          />
        </Modal>
      )}

      {showImportModal && (
        <Modal title="Importer des trades (CSV)" onClose={() => setShowImportModal(false)}>
          <CsvImportModal
            onImport={async (rows) => {
              await addTradesBulk(rows);
              setShowImportModal(false);
            }}
            onClose={() => setShowImportModal(false)}
          />
        </Modal>
      )}
    </div>
  );
}
