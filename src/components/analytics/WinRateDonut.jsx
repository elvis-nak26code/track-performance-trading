// Donut chart du taux de réussite global (gagnants vs perdants).
import PropTypes from 'prop-types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function WinRateDonut({ wins, losses }) {
  const data = [
    { name: 'Gagnants', value: wins },
    { name: 'Perdants', value: losses },
  ];
  const total = wins + losses;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

  return (
    <div className="relative h-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius="65%"
            outerRadius="90%"
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            <Cell fill="#2ed573" />
            <Cell fill="#ff5252" />
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#141714',
              border: '1px solid #252925',
              borderRadius: 8,
              fontSize: 12,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="font-mono text-3xl font-semibold text-text-primary">{winRate}%</span>
        <span className="text-[11px] text-text-secondary font-mono uppercase tracking-wide">
          {wins}G / {losses}P
        </span>
      </div>
    </div>
  );
}

WinRateDonut.propTypes = {
  wins: PropTypes.number.isRequired,
  losses: PropTypes.number.isRequired,
};
