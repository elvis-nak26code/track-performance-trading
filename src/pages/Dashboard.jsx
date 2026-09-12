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
import PositionCalculator from '../components/tools/PositionCalculator';
import PreTradeChecklist from '../components/dashboard/PreTradeChecklist';
import DashboardMarkets from '../components/dashboard/DashboardMarkets';
import PlanBlock from '../components/subscription/PlanBlock';
import { usePlan } from '../context/PlanContext';
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
  const { isExpired, requirePlan } = usePlan();

  const sortedTrades = useMemo(
    () => [...trades].sort((a, b) => a.date.localeCompare(b.date)),
    [trades]
  );

  const recentTrades = useMemo(
    () => [...trades].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [trades]
  );

  const equityCurve = useMemo(() => computeEquityCurve(sortedTrades), [sortedTrades]);

  const kpis = useMemo(() => ({
    winRate: computeWinRate(trades),
    totalPnl: computeTotalPnl(trades),
    profitFactor: computeProfitFactor(trades),
    avgR: computeAverageR(trades),
  }), [trades]);

  // Date du mois affiché dans la mini-heatmap : stable pour tout le cycle de vie
  // de la page (une seule valeur, on ne re-render pas à chaque tick).
  const monthDate = useMemo(() => new Date(), []);

  if (isLoading) return <LoadingState label="Chargement du tableau de bord…" />;

  return (
    <div>
      <PageHeader
        eyebrow="tableau de bord"
        title="Vue d'ensemble"
        description="Le résumé de votre activité de trading, en un coup d'œil."
        actions={
          <>
            <Button
              variant="primary"
              onClick={() => {
                if (requirePlan('créer un nouveau trade')) setShowTradeModal(true);
              }}
            >
              + Nouveau trade
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (requirePlan('créer une nouvelle entrée de journal')) navigate('/journal/nouveau');
              }}
            >
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
          {isExpired ? (
            <Card title="Statistiques verrouillées" className="mb-6">
              <PlanBlock message="Vos statistiques de performance nécessitent un forfait actif. Vos trades et votre journal restent visibles." />
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
              <KpiCard label="Taux de réussite" value={`${kpis.winRate.toFixed(1)}%`} tone={kpis.winRate >= 50 ? 'positive' : 'negative'} />
              <KpiCard
                label="P&L total"
                value={`${kpis.totalPnl >= 0 ? '+' : ''}${kpis.totalPnl.toFixed(2)} $`}
                tone={kpis.totalPnl >= 0 ? 'positive' : 'negative'}
              />
              <KpiCard
                label="Profit factor"
                value={Number.isFinite(kpis.profitFactor) ? kpis.profitFactor.toFixed(2) : '∞'}
                tone={kpis.profitFactor >= 1 ? 'positive' : 'negative'}
              />
              <KpiCard label="R moyen" value={`${kpis.avgR >= 0 ? '+' : ''}${kpis.avgR.toFixed(2)}R`} tone={kpis.avgR >= 0 ? 'positive' : 'negative'} />
              <KpiCard label="Nombre de trades" value={trades.length} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {isExpired ? (
              <Card title="Statistiques verrouillées" className="lg:col-span-2">
                <PlanBlock message="La courbe d'équité nécessite un forfait actif." />
              </Card>
            ) : (
              <Card title="Courbe d'équité" className="lg:col-span-2">
                <EquityMiniChart data={equityCurve} />
              </Card>
            )}
            <Card title="Calendrier du mois">
              <MiniCalendarHeatmap trades={trades} monthDate={monthDate} />
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
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2">
          <DashboardMarkets />
        </div>
      </div>

      <Card title="Calculateur de position" className="mt-4">
        <PositionCalculator />
      </Card>

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
