// Page Analytics (/analytics) : répartitions, distributions, courbes
// d'équité/drawdown, win rate glissant, corrélation humeur/performance.
// Un filtre de période (mois ou plage personnalisée) s'applique à
// l'ensemble des statistiques de la page.
import { useMemo, useState } from 'react';
import { useTrades } from '../hooks/useTrades';
import { useJournalEntries } from '../hooks/useJournalEntries';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import KpiCard from '../components/common/KpiCard';
import PeriodFilter from '../components/common/PeriodFilter';
import { LoadingState, EmptyState } from '../components/common/LoadingState';
import WinRateDonut from '../components/analytics/WinRateDonut';
import WinLossBarChart from '../components/analytics/WinLossBarChart';
import PnlByDayBarChart from '../components/analytics/PnlByDayBarChart';
import RDistributionChart from '../components/analytics/RDistributionChart';
import EquityCurveChart from '../components/analytics/EquityCurveChart';
import DrawdownChart from '../components/analytics/DrawdownChart';
import RCumulativeChart from '../components/analytics/RCumulativeChart';
import RollingWinRateChart from '../components/analytics/RollingWinRateChart';
import BreakdownTable from '../components/analytics/BreakdownTable';
import MoodPerformanceChart from '../components/analytics/MoodPerformanceChart';
import { listAvailableMonths, filterByPeriod } from '../utils/dateHelpers';
import {
  computeEquityCurve,
  computeDrawdownCurve,
  computeCumulativeR,
  computeRDistribution,
  computeRollingWinRate,
  computeStrategyBreakdown,
  computeTotalR,
  groupTradesBy,
  computeMoodPerformance,
} from '../utils/calculations';

const DEFAULT_PERIOD = { mode: 'all' };

export default function Analytics() {
  const { trades, isLoading: tradesLoading } = useTrades();
  const { entries, isLoading: entriesLoading } = useJournalEntries();
  const [period, setPeriod] = useState(DEFAULT_PERIOD);

  const availableMonths = useMemo(() => listAvailableMonths(trades), [trades]);
  const filteredTrades = useMemo(() => filterByPeriod(trades, period), [trades, period]);

  const sortedTrades = useMemo(
    () => [...filteredTrades].sort((a, b) => a.date.localeCompare(b.date)),
    [filteredTrades]
  );

  const equityCurve = useMemo(() => computeEquityCurve(sortedTrades), [sortedTrades]);
  const drawdownCurve = useMemo(() => computeDrawdownCurve(equityCurve), [equityCurve]);
  const cumulativeR = useMemo(() => computeCumulativeR(sortedTrades), [sortedTrades]);
  const rDistribution = useMemo(() => computeRDistribution(filteredTrades), [filteredTrades]);
  const rollingWinRate10 = useMemo(() => computeRollingWinRate(sortedTrades, 10), [sortedTrades]);
  const rollingWinRate20 = useMemo(() => computeRollingWinRate(sortedTrades, 20), [sortedTrades]);

  const byStrategy = useMemo(() => computeStrategyBreakdown(filteredTrades), [filteredTrades]);
  const byInstrument = useMemo(() => groupTradesBy(filteredTrades, (t) => t.symbol), [filteredTrades]);
  const byDirection = useMemo(
    () => groupTradesBy(filteredTrades, (t) => (t.direction === 'long' ? 'Long' : 'Short')),
    [filteredTrades]
  );

  const moodPerformance = useMemo(
    () => computeMoodPerformance(entries, filteredTrades),
    [entries, filteredTrades]
  );

  const wins = filteredTrades.filter((t) => t.pnl > 0).length;
  const losses = filteredTrades.filter((t) => t.pnl <= 0).length;
  const totalR = computeTotalR(filteredTrades);
  const totalPnlPeriod = filteredTrades.reduce((s, t) => s + t.pnl, 0);

  if (tradesLoading || entriesLoading) return <LoadingState label="Chargement des analytics…" />;

  if (trades.length === 0) {
    return (
      <div>
        <PageHeader eyebrow="analytics" title="Analytics" description="Analysez votre edge en profondeur." />
        <EmptyState title="Pas encore de données" description="Ajoutez des trades pour débloquer les analytics." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="analytics"
        title="Analytics"
        description="Analysez votre edge par stratégie, instrument et direction."
      />

      <Card className="mb-4">
        <PeriodFilter value={period} onChange={setPeriod} availableMonths={availableMonths} />
      </Card>

      {filteredTrades.length === 0 ? (
        <EmptyState
          title="Aucun trade sur cette période"
          description="Choisissez une autre période ou réinitialisez le filtre."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <KpiCard label="Trades" value={filteredTrades.length} />
            <KpiCard label="Gagnants / Perdants" value={`${wins} / ${losses}`} />
            <KpiCard
              label="R total réalisé"
              value={`${totalR >= 0 ? '+' : ''}${totalR.toFixed(1)}R`}
              tone={totalR >= 0 ? 'positive' : 'negative'}
            />
            <KpiCard
              label="P&L période"
              value={`${totalPnlPeriod >= 0 ? '+' : ''}${totalPnlPeriod.toFixed(2)} $`}
              tone={totalPnlPeriod >= 0 ? 'positive' : 'negative'}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <Card title="Taux de réussite">
              <WinRateDonut wins={wins} losses={losses} />
            </Card>
            <Card title="Gagnants vs perdants">
              <WinLossBarChart wins={wins} losses={losses} />
            </Card>
            <Card title="Distribution des R">
              <RDistributionChart data={rDistribution} />
            </Card>
          </div>

          <Card title="Gains et pertes sur la période choisie" className="mb-4">
            <PnlByDayBarChart trades={filteredTrades} />
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <Card title="Courbe d'équité ($)">
              <EquityCurveChart data={equityCurve} />
            </Card>
            <Card title="R cumulé réalisé">
              <RCumulativeChart data={cumulativeR} />
            </Card>
          </div>

          <Card title="Courbe de drawdown" className="mb-4">
            <DrawdownChart data={drawdownCurve} />
          </Card>

          <Card title="Win rate glissant (10 / 20 derniers trades)" className="mb-4">
            <RollingWinRateChart data10={rollingWinRate10} data20={rollingWinRate20} />
          </Card>

          <Card title="Répartition par approche" className="mb-4">
            <p className="text-xs text-text-secondary mb-3">
              Fondamentale et Price Action sont souvent combinées sur un même trade : elles apparaissent donc
              aussi dans un groupe dédié « Fondamentale + Price Action ».
            </p>
            <BreakdownTable rows={byStrategy} keyLabel="Approche" />
          </Card>

          <Card title="Répartition par instrument" className="mb-4">
            <BreakdownTable rows={byInstrument} keyLabel="Instrument" />
          </Card>

          <Card title="Répartition par direction" className="mb-4">
            <BreakdownTable rows={byDirection} keyLabel="Direction" />
          </Card>

          <Card title="Corrélation humeur / performance">
            <MoodPerformanceChart data={moodPerformance} />
          </Card>
        </>
      )}
    </div>
  );
}
