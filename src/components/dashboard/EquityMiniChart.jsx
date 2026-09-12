// Mini courbe d'équité affichée sur le tableau de bord (vue condensée,
// sans axes détaillés — pour la vue complète voir analytics/EquityCurveChart).
import { memo } from 'react';
import PropTypes from 'prop-types';
import { ResponsiveContainer, AreaChart, Area, YAxis, Tooltip } from 'recharts';

function EquityMiniChart({ data }) {
  const isPositive = data.length > 0 && data[data.length - 1].equity >= 0;
  const strokeColor = isPositive ? '#2ed573' : '#ff5252';

  return (
    <div className="h-32">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
          <defs>
            <linearGradient id="equityMiniGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.35} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={['dataMin', 'dataMax']} />
          <Tooltip
            contentStyle={{
              background: '#141714',
              border: '1px solid #252925',
              borderRadius: 8,
              fontSize: 12,
              fontFamily: 'JetBrains Mono, monospace',
            }}
            labelStyle={{ color: '#8c918c' }}
            formatter={(value) => [`${value.toFixed(2)} $`, 'Équité']}
          />
          <Area
            type="monotone"
            dataKey="equity"
            stroke={strokeColor}
            strokeWidth={2}
            fill="url(#equityMiniGradient)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

EquityMiniChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({ date: PropTypes.string, equity: PropTypes.number })
  ).isRequired,
};

export default memo(EquityMiniChart);
