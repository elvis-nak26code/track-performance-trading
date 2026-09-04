// Courbe de drawdown (écart par rapport au plus haut niveau d'équité atteint).
import PropTypes from 'prop-types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDateShort } from '../../utils/dateHelpers';

export default function DrawdownChart({ data }) {
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff5252" stopOpacity={0} />
              <stop offset="100%" stopColor="#ff5252" stopOpacity={0.35} />
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
            formatter={(value) => [`${value.toFixed(2)} $`, 'Drawdown']}
            contentStyle={{
              background: '#141714',
              border: '1px solid #252925',
              borderRadius: 8,
              fontSize: 12,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          />
          <Area type="monotone" dataKey="drawdown" stroke="#ff5252" strokeWidth={2} fill="url(#drawdownGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

DrawdownChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({ date: PropTypes.string, drawdown: PropTypes.number })).isRequired,
};
