// Corrélation humeur / performance : win rate moyen par tag d'humeur,
// calculé à partir des trades liés à chaque entrée de journal.
import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getMoodMeta } from '../../constants/moods';

export default function MoodPerformanceChart({ data }) {
  if (!data.length) {
    return (
      <p className="text-text-secondary text-sm">
        Aucune donnée : liez des trades à vos entrées de journal pour voir apparaître cette corrélation.
      </p>
    );
  }

  const chartData = data.map((d) => ({ ...d, label: getMoodMeta(d.mood).label }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <CartesianGrid stroke="#252925" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#8c918c', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={{ stroke: '#252925' }}
            tickLine={false}
          />
          <YAxis
            unit="%"
            domain={[0, 100]}
            tick={{ fill: '#8c918c', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={{ stroke: '#252925' }}
            tickLine={false}
          />
          <Tooltip
            formatter={(value, name, props) => [`${value.toFixed(0)}%`, `Win rate (${props.payload.count} trades)`]}
            contentStyle={{
              background: '#141714',
              border: '1px solid #252925',
              borderRadius: 8,
              fontSize: 12,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          />
          <Bar dataKey="winRate" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.winRate >= 50 ? '#2ed573' : '#ff5252'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

MoodPerformanceChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({ mood: PropTypes.string, winRate: PropTypes.number, count: PropTypes.number })
  ).isRequired,
};
