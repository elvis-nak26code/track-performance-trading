// Page Tableau de bord (/) : vue d'ensemble des performances de trading.
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Target } from 'lucide-react';
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
import { useStrategy } from '../hooks/useStrategy';
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
  const { activeStrategy } = useStrategy();

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
              className="flex-1 sm:flex-none justify-center"
              onClick={() => setShowTradeModal(true)}
            >
              + Nouveau trade
            </Button>
            <Button
              variant="secondary"
              className="flex-1 sm:flex-none justify-center"
              onClick={() => navigate('/journal/nouveau')}
            >
              + Nouvelle entrée journal
            </Button>
          </>
        }
      />

      {/* Bandeau stratégie active : à garder en tête avant chaque trade. */}
      <div className="mb-6">
        {activeStrategy ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-card border border-card-border bg-card px-4 py-3">
            <Link
              to="/strategies"
              className="flex items-center gap-2 font-mono text-sm text-text-primary hover:text-accent transition-colors"
              title="Modifier la stratégie active"
            >
              <Target className="text-accent" size={16} />
              {activeStrategy.name}
            </Link>
            {activeStrategy.config?.maxRiskPerTradePct ? (
              <span className="text-[11px] font-mono text-text-secondary">
                Risque ≤ {activeStrategy.config.maxRiskPerTradePct}%
              </span>
            ) : null}
            {activeStrategy.config?.minRR ? (
              <span className="text-[11px] font-mono text-text-secondary">
                R:R ≥ {activeStrategy.config.minRR}
              </span>
            ) : null}
            {activeStrategy.config?.maxDailyLossPct ? (
              <span className="text-[11px] font-mono text-text-secondary">
                Perte max jour ≤ {activeStrategy.config.maxDailyLossPct}%
              </span>
            ) : null}
            {(activeStrategy.config?.directions || []).length > 0 && (
              <span className="text-[11px] font-mono text-text-secondary">
                {(activeStrategy.config.directions || []).join(' / ')}
              </span>
            )}
            <Link to="/strategies" className="ml-auto text-[11px] font-mono text-text-secondary hover:text-accent">
              Modifier →
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-card border border-dashed border-card-border px-4 py-3 text-sm text-text-secondary">
            <Target size={16} className="text-accent" />
            Aucune stratégie active. Appliquez vos règles avant chaque trade.
            <Link to="/strategies" className="ml-auto font-mono text-accent hover:text-accent-soft text-xs">
              Créer ma stratégie →
            </Link>
          </div>
        )}
      </div>

      {trades.length === 0 ? (
        <EmptyState
          title="Aucun trade enregistré"
          description="Ajoutez votre premier trade pour commencer à suivre votre performance."
        />
      ) : (
        <>
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
            <KpiCard label="Nombre de trades" value={trades.length} className="col-span-2 sm:col-span-1" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <Card title="Courbe d'équité" className="lg:col-span-2">
              <EquityMiniChart data={equityCurve} />
            </Card>
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
