// Page Calendrier (/calendrier) : vue mensuelle heatmap, résumé du mois,
// navigation mois précédent/suivant.
import { useMemo, useState } from 'react';
import { useTrades } from '../hooks/useTrades';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import { LoadingState } from '../components/common/LoadingState';
import CalendarGrid from '../components/calendar/CalendarGrid';
import MonthNavigator from '../components/calendar/MonthNavigator';
import MonthSummary from '../components/calendar/MonthSummary';
import { addMonths, subMonths, isSameMonth } from '../utils/dateHelpers';

export default function Calendar() {
  const { trades, isLoading } = useTrades();
  const [monthDate, setMonthDate] = useState(new Date());

  const monthTrades = useMemo(
    () => trades.filter((t) => isSameMonth(new Date(`${t.date}T00:00:00`), monthDate)),
    [trades, monthDate]
  );

  if (isLoading) return <LoadingState label="Chargement du calendrier…" />;

  return (
    <div>
      <PageHeader
        eyebrow="calendrier"
        title="Calendrier de sessions"
        description="Visualisez vos jours gagnants et perdants d'un coup d'œil."
      />
      <Card>
        <MonthNavigator
          monthDate={monthDate}
          onPrev={() => setMonthDate((d) => subMonths(d, 1))}
          onNext={() => setMonthDate((d) => addMonths(d, 1))}
          onToday={() => setMonthDate(new Date())}
        />
        <MonthSummary trades={monthTrades} />
        <CalendarGrid trades={trades} monthDate={monthDate} />
      </Card>
    </div>
  );
}
