// Grille calendrier mensuelle complète pour la page /calendrier :
// affiche le P&L du jour et le nombre de trades dans chaque case.
import PropTypes from 'prop-types';
import { buildCalendarGrid, isSameMonth, toIsoDateKey, WEEKDAY_LABELS_FR } from '../../utils/dateHelpers';

export default function CalendarGrid({ trades, monthDate }) {
  const days = buildCalendarGrid(monthDate);

  const statsByDay = new Map();
  trades.forEach((t) => {
    const existing = statsByDay.get(t.date) || { pnl: 0, count: 0, winRateSum: 0 };
    existing.pnl += t.pnl;
    existing.count += 1;
    statsByDay.set(t.date, existing);
  });

  return (
    <div>
      <div className="grid grid-cols-7 gap-2 mb-2">
        {WEEKDAY_LABELS_FR.map((d) => (
          <span key={d} className="text-[11px] text-text-secondary text-center font-mono uppercase tracking-wide">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const key = toIsoDateKey(day);
          const inMonth = isSameMonth(day, monthDate);
          const stats = statsByDay.get(key);

          let cardClass = 'bg-white/[0.02] border-card-border';
          if (stats) {
            cardClass = stats.pnl >= 0
              ? 'bg-accent/10 border-green-400/30 bg-green-400/10'
              : 'bg-danger/10 border-red-400/30 bg-red-400/10';
          }

          return (
            <div
              key={key}
              className={`aspect-square sm:aspect-auto sm:h-28 rounded-card border p-2 flex flex-col justify-between ${cardClass} ${
                inMonth ? '' : 'opacity-30'
              }`}
            >
              <span className="text-xs font-mono text-text-secondary">{day.getDate()}</span>
              {stats && (
                <div className="text-center">
                  <p
                    className={`text-[7px] font-mono text-xs sm:text-sm font-semibold sm:none ${
                      stats.pnl >= 0 ? 'text-accent' : 'text-danger'
                    }`}
                  >
                    {stats.pnl >= 0 ? '+' : ''}
                    {stats.pnl.toFixed(0)} $
                  </p>
                  <p className="text-[7px] sm:text-[10px] text-text-secondary font-mono">
                    {stats.count} trade{stats.count > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

CalendarGrid.propTypes = {
  trades: PropTypes.array.isRequired,
  monthDate: PropTypes.instanceOf(Date).isRequired,
};
