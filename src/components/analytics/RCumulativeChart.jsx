// Courbe du R cumulé réalisé au fil des trades (même logique que la courbe
// d'équité, mais exprimée en multiples de R plutôt qu'en dollars).
import PropTypes from 'prop-types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatDateShort } from '../../utils/dateHelpers';

export default function RCumulativeChart({ data }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="rCumulativeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1DE9B6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#1DE9B6" stopOpacity={0} />
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
            unit="R"
            tick={{ fill: '#8c918c', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={{ stroke: '#252925' }}
            tickLine={false}
          />
          <Tooltip
            labelFormatter={(d) => formatDateShort(d)}
            formatter={(value) => [`${value.toFixed(2)}R`, 'R cumulé']}
            contentStyle={{
              background: '#141714',
              border: '1px solid #252925',
              borderRadius: 8,
              fontSize: 12,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          />
          <Area type="monotone" dataKey="cumulativeR" stroke="#1DE9B6" strokeWidth={2} fill="url(#rCumulativeGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

RCumulativeChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({ date: PropTypes.string, cumulativeR: PropTypes.number })).isRequired,
};
