// Graphique en bâtonnets du P&L agrégé par jour sur la période choisie :
// chaque barre est verte (jour gagnant) ou rouge (jour perdant), ce qui
// donne une vue rapide de la répartition des gains et des pertes dans le
// temps, en complément de la courbe d'équité cumulée.
import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { formatDateShort } from '../../utils/dateHelpers';

export default function PnlByDayBarChart({ trades }) {
  // Agrège le P&L par jour (un trade a un P&L, un jour peut contenir plusieurs trades).
  const byDay = new Map();
  trades.forEach((t) => {
    byDay.set(t.date, (byDay.get(t.date) || 0) + t.pnl);
  });
  const data = Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, pnl]) => ({ date, pnl: Math.round(pnl * 100) / 100 }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <CartesianGrid stroke="#252925" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => formatDateShort(d)}
            tick={{ fill: '#8c918c', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={{ stroke: '#252925' }}
            tickLine={false}
            minTickGap={20}
          />
          <YAxis
            tick={{ fill: '#8c918c', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={{ stroke: '#252925' }}
            tickLine={false}
          />
          <ReferenceLine y={0} stroke="#252925" />
          <Tooltip
            labelFormatter={(d) => formatDateShort(d)}
            formatter={(value) => [`${value >= 0 ? '+' : ''}${value.toFixed(2)} $`, 'P&L du jour']}
            contentStyle={{
              background: '#141714',
              border: '1px solid #252925',
              borderRadius: 8,
              fontSize: 12,
              fontFamily: 'JetBrains Mono, monospace',
            }}
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          />
          <Bar dataKey="pnl" radius={[3, 3, 3, 3]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.pnl >= 0 ? '#2ed573' : '#ff5252'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

PnlByDayBarChart.propTypes = {
  trades: PropTypes.array.isRequired,
};
