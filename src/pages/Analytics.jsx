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
import RPerTradeChart from '../components/analytics/RPerTradeChart';
import EquityCurveChart from '../components/analytics/EquityCurveChart';
import DrawdownChart from '../components/analytics/DrawdownChart';
import RCumulativeChart from '../components/analytics/RCumulativeChart';
import RollingWinRateChart from '../components/analytics/RollingWinRateChart';
import BreakdownTable from '../components/analytics/BreakdownTable';
import MoodPerformanceChart from '../components/analytics/MoodPerformanceChart';
import ExpandableCanvas from '../components/analytics/ExpandableCanvas';
import { listAvailableMonths, filterByPeriod } from '../utils/dateHelpers';
import {
  computeEquityCurve,
  computeDrawdownCurve,
  computeCumulativeR,
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
  const [lastN, setLastN] = useState('all');

  // Filtre "derniers N trades" : on garde les N trades les plus récents de la
  // période sélectionnée, triés par date décroissante avant la troncature.
  const rangeTrades = useMemo(() => {
    if (lastN === 'all') return filteredTrades;
    const n = Number(lastN);
    return [...filteredTrades]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, n);
  }, [filteredTrades, lastN]);

  const sortedTrades = useMemo(
    () => [...rangeTrades].sort((a, b) => a.date.localeCompare(b.date)),
    [rangeTrades]
  );

  const equityCurve = useMemo(() => computeEquityCurve(sortedTrades), [sortedTrades]);
  const drawdownCurve = useMemo(() => computeDrawdownCurve(equityCurve), [equityCurve]);
  const cumulativeR = useMemo(() => computeCumulativeR(sortedTrades), [sortedTrades]);
  const rollingWinRate10 = useMemo(() => computeRollingWinRate(sortedTrades, 10), [sortedTrades]);
  const rollingWinRate20 = useMemo(() => computeRollingWinRate(sortedTrades, 20), [sortedTrades]);

  const byStrategy = useMemo(() => computeStrategyBreakdown(rangeTrades), [rangeTrades]);
  const byInstrument = useMemo(() => groupTradesBy(rangeTrades, (t) => t.symbol), [rangeTrades]);
  const byDirection = useMemo(
    () => groupTradesBy(rangeTrades, (t) => (t.direction === 'long' ? 'Long' : 'Short')),
    [rangeTrades]
  );

  const moodPerformance = useMemo(
    () => computeMoodPerformance(entries, rangeTrades),
    [entries, rangeTrades]
  );

  const basicStats = useMemo(() => ({
    wins: rangeTrades.filter((t) => t.pnl > 0).length,
    losses: rangeTrades.filter((t) => t.pnl <= 0).length,
    totalR: computeTotalR(rangeTrades),
    totalPnlPeriod: rangeTrades.reduce((s, t) => s + t.pnl, 0),
  }), [rangeTrades]);

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
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <PeriodFilter value={period} onChange={setPeriod} availableMonths={availableMonths} />
          <div className="h-6 w-px bg-card-border hidden sm:block" />
          <label className="flex items-center gap-2 text-xs text-text-secondary font-mono">
            Derniers
            <select
              value={lastN}
              onChange={(e) => setLastN(e.target.value)}
              className="bg-bg border border-card-border rounded-card px-2 py-1.5 text-sm text-text-primary font-mono focus:outline-none focus:border-accent/60"
            >
              <option value="all">Tous</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="250">250</option>
            </select>
            trades
          </label>
        </div>
      </Card>

      {rangeTrades.length === 0 ? (
        <EmptyState
          title="Aucun trade sur cette période"
          description="Choisissez une autre période ou réinitialisez le filtre."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <KpiCard label="Trades" value={rangeTrades.length} />
            <KpiCard label="Gagnants / Perdants" value={`${basicStats.wins} / ${basicStats.losses}`} />
            <KpiCard
              label="R total réalisé"
              value={`${basicStats.totalR >= 0 ? '+' : ''}${basicStats.totalR.toFixed(1)}R`}
              tone={basicStats.totalR >= 0 ? 'positive' : 'negative'}
            />
            <KpiCard
              label="P&L période"
              value={`${basicStats.totalPnlPeriod >= 0 ? '+' : ''}${basicStats.totalPnlPeriod.toFixed(2)} $`}
              tone={basicStats.totalPnlPeriod >= 0 ? 'positive' : 'negative'}
            />
          </div>

          <Card title="R par trade" className="mb-4">
            <p className="text-xs text-text-secondary mb-3">
              Une barre par trade, dans l'ordre chronologique (axe horizontal =
              le déroulement du temps, pertes et gains se succèdent à espacement
              régulier). L'axe vertical est le multiple de R : les pertes
              descendent en dessous de 0 (rouge), les gains remontent au-dessus
              (vert). Survolez une barre pour voir la date du trade.
            </p>
            <ExpandableCanvas label="R par trade">
              <RPerTradeChart trades={sortedTrades} />
            </ExpandableCanvas>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <Card title="Taux de réussite">
              <ExpandableCanvas label="Taux de réussite">
                <WinRateDonut wins={basicStats.wins} losses={basicStats.losses} />
              </ExpandableCanvas>
            </Card>
            <Card title="Gagnants vs perdants">
              <ExpandableCanvas label="Gagnants vs perdants">
                <WinLossBarChart wins={basicStats.wins} losses={basicStats.losses} />
              </ExpandableCanvas>
            </Card>
          </div>

          <Card title="Gains et pertes sur la période choisie" className="mb-4">
            <ExpandableCanvas label="Gains et pertes par jour">
              <PnlByDayBarChart trades={rangeTrades} />
            </ExpandableCanvas>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <Card title="Courbe d'équité ($)">
              <ExpandableCanvas label="Courbe d'équité">
                <EquityCurveChart data={equityCurve} />
              </ExpandableCanvas>
            </Card>
            <Card title="R cumulé réalisé">
              <ExpandableCanvas label="R cumulé">
                <RCumulativeChart data={cumulativeR} />
              </ExpandableCanvas>
            </Card>
          </div>

          <Card title="Courbe de drawdown" className="mb-4">
            <ExpandableCanvas label="Courbe de drawdown">
              <DrawdownChart data={drawdownCurve} />
            </ExpandableCanvas>
          </Card>

          <Card title="Win rate glissant (10 / 20 derniers trades)" className="mb-4">
            <ExpandableCanvas label="Win rate glissant">
              <RollingWinRateChart data10={rollingWinRate10} data20={rollingWinRate20} />
            </ExpandableCanvas>
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
            <ExpandableCanvas label="Corrélation humeur / performance">
              <MoodPerformanceChart data={moodPerformance} />
            </ExpandableCanvas>
          </Card>
        </>
      )}
    </div>
  );
}
