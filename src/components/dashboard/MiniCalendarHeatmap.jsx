// Mini heatmap calendrier du mois en cours, affichée sur le tableau de bord.
// Vert = jour gagnant, rouge = jour perdant, gris = pas de trade.
import PropTypes from 'prop-types';
import { buildCalendarGrid, isSameMonth, toIsoDateKey, WEEKDAY_LABELS_FR } from '../../utils/dateHelpers';

export default function MiniCalendarHeatmap({ trades, monthDate }) {
  const days = buildCalendarGrid(monthDate);

  const pnlByDay = new Map();
  trades.forEach((t) => {
    const current = pnlByDay.get(t.date) || 0;
    pnlByDay.set(t.date, current + t.pnl);
  });

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_LABELS_FR.map((d) => (
          <span key={d} className="text-[10px] text-text-secondary text-center font-mono">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key = toIsoDateKey(day);
          const inMonth = isSameMonth(day, monthDate);
          const pnl = pnlByDay.get(key);
          let bg = 'bg-white/[0.03]';
          if (pnl !== undefined) {
            bg = pnl >= 0 ? 'bg-accent/70' : 'bg-danger/70';
          }
          return (
            <div
              key={key}
              className={`aspect-square rounded-[4px] flex items-center justify-center text-[10px] font-mono ${
                inMonth ? bg : 'bg-white/[0.02]'
              } ${inMonth ? 'text-text-primary' : 'text-text-secondary/40'}`}
              title={pnl !== undefined ? `${pnl.toFixed(2)} $` : undefined}
            >
              {day.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

MiniCalendarHeatmap.propTypes = {
  trades: PropTypes.array.isRequired,
  monthDate: PropTypes.instanceOf(Date).isRequired,
};
