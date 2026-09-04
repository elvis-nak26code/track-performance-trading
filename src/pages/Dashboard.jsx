// Page Tableau de bord (/) : vue d'ensemble des performances de trading.
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrades } from '../hooks/useTrades';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import KpiCard from '../components/common/KpiCard';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { LoadingState, EmptyState } from '../components/common/LoadingState';
import EquityMiniChart from '../components/dashboard/EquityMiniChart';
import RecentTradesTable from '../components/dashboard/RecentTradesTable';
import MiniCalendarHeatmap from '../components/dashboard/MiniCalendarHeatmap';
import RiskCalculator from '../components/dashboard/RiskCalculator';
import PreTradeChecklist from '../components/dashboard/PreTradeChecklist';
import TradeForm from '../components/track-record/TradeForm';
import {
  computeWinRate,
  computeTotalPnl,
  computeProfitFactor,
  computeAverageR,
  computeEquityCurve,
} from '../utils/calculations';

export default function Dashboard() {
  const { trades, isLoading, addTrade } = useTrades();
  const [showTradeModal, setShowTradeModal] = useState(false);
  const navigate = useNavigate();

  const sortedTrades = useMemo(
    () => [...trades].sort((a, b) => a.date.localeCompare(b.date)),
    [trades]
  );

  const recentTrades = useMemo(
    () => [...trades].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [trades]
  );

  const equityCurve = useMemo(() => computeEquityCurve(sortedTrades), [sortedTrades]);

  const winRate = computeWinRate(trades);
  const totalPnl = computeTotalPnl(trades);
  const profitFactor = computeProfitFactor(trades);
  const avgR = computeAverageR(trades);

  if (isLoading) return <LoadingState label="Chargement du tableau de bord…" />;

  return (
    <div>
      <PageHeader
        eyebrow="tableau de bord"
        title="Vue d'ensemble"
        description="Le résumé de votre activité de trading, en un coup d'œil."
        actions={
          <>
            <Button variant="primary" onClick={() => setShowTradeModal(true)}>
              + Nouveau trade
            </Button>
            <Button variant="secondary" onClick={() => navigate('/journal/nouveau')}>
              + Nouvelle entrée journal
            </Button>
          </>
        }
      />

      {trades.length === 0 ? (
        <EmptyState
          title="Aucun trade enregistré"
          description="Ajoutez votre premier trade pour commencer à suivre votre performance."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            <KpiCard label="Taux de réussite" value={`${winRate.toFixed(1)}%`} tone={winRate >= 50 ? 'positive' : 'negative'} />
            <KpiCard
              label="P&L total"
              value={`${totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)} $`}
              tone={totalPnl >= 0 ? 'positive' : 'negative'}
            />
            <KpiCard
              label="Profit factor"
              value={Number.isFinite(profitFactor) ? profitFactor.toFixed(2) : '∞'}
              tone={profitFactor >= 1 ? 'positive' : 'negative'}
            />
            <KpiCard label="R moyen" value={`${avgR >= 0 ? '+' : ''}${avgR.toFixed(2)}R`} tone={avgR >= 0 ? 'positive' : 'negative'} />
            <KpiCard label="Nombre de trades" value={trades.length} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <Card title="Courbe d'équité" className="lg:col-span-2">
              <EquityMiniChart data={equityCurve} />
            </Card>
            <Card title="Calendrier du mois">
              <MiniCalendarHeatmap trades={trades} monthDate={new Date()} />
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <Card title="5 derniers trades" className="lg:col-span-2">
              <RecentTradesTable trades={recentTrades} />
            </Card>
            <Card title="Checklist pré-trade">
              <PreTradeChecklist />
            </Card>
          </div>

          <Card title="Calculateur de risque">
            <RiskCalculator />
          </Card>
        </>
      )}

      {showTradeModal && (
        <Modal title="Nouveau trade" onClose={() => setShowTradeModal(false)}>
          <TradeForm
            onCancel={() => setShowTradeModal(false)}
            onSubmit={async (trade) => {
              await addTrade(trade);
              setShowTradeModal(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
