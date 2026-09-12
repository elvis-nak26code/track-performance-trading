// Courbe d'équité complète, avec axes et tooltip détaillés (page analytics).
import { memo } from 'react';
import PropTypes from 'prop-types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDateShort } from '../../utils/dateHelpers';

function EquityCurveChart({ data }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="equityFullGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2ed573" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#2ed573" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#252925" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => formatDateShort(d)}
            tick={{ fill: '#8c918c', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={{ stroke: '#252925' }}
            tickLine={false}
            minTickGap={30}
          />
          <YAxis
            tick={{ fill: '#8c918c', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={{ stroke: '#252925' }}
            tickLine={false}
          />
          <Tooltip
            labelFormatter={(d) => formatDateShort(d)}
            formatter={(value) => [`${value.toFixed(2)} $`, 'Équité cumulée']}
            contentStyle={{
              background: '#141714',
              border: '1px solid #252925',
              borderRadius: 8,
              fontSize: 12,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          />
          <Area type="monotone" dataKey="equity" stroke="#2ed573" strokeWidth={2} fill="url(#equityFullGradient)" isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

EquityCurveChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({ date: PropTypes.string, equity: PropTypes.number })).isRequired,
};

export default memo(EquityCurveChart);
