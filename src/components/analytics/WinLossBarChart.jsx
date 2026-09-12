// Graphique en barres simple comparant le nombre de trades gagnants et
// perdants (vue complémentaire du donut, plus lisible pour comparer des
// volumes bruts).
import { memo } from 'react';
import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function WinLossBarChart({ wins, losses }) {
  const data = [
    { label: 'Gagnants', count: wins },
    { label: 'Perdants', count: losses },
  ];

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <CartesianGrid stroke="#252925" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#8c918c', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={{ stroke: '#252925' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#8c918c', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={{ stroke: '#252925' }}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: '#141714',
              border: '1px solid #252925',
              borderRadius: 8,
              fontSize: 12,
              fontFamily: 'JetBrains Mono, monospace',
            }}
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={80} isAnimationActive={false}>
            <Cell fill="#2ed573" />
            <Cell fill="#ff5252" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

WinLossBarChart.propTypes = {
  wins: PropTypes.number.isRequired,
  losses: PropTypes.number.isRequired,
};

export default memo(WinLossBarChart);
