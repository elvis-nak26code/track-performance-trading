// Win rate glissant (moyenne mobile sur 10 et 20 derniers trades).
import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatDateShort } from '../../utils/dateHelpers';

function RollingWinRateChart({ data10, data20 }) {
  // Fusionne les deux séries par date pour un affichage superposé.
  const merged = useMemo(() => {
    const dateSet = Array.from(new Set([...data10.map((d) => d.date), ...data20.map((d) => d.date)])).sort();
    const map10 = new Map(data10.map((d) => [d.date, d.winRate]));
    const map20 = new Map(data20.map((d) => [d.date, d.winRate]));
    return dateSet.map((date) => ({
      date,
      winRate10: map10.get(date) ?? null,
      winRate20: map20.get(date) ?? null,
    }));
  }, [data10, data20]);

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={merged} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
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
            unit="%"
            domain={[0, 100]}
            tick={{ fill: '#8c918c', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={{ stroke: '#252925' }}
            tickLine={false}
          />
          <Tooltip
            labelFormatter={(d) => formatDateShort(d)}
            contentStyle={{
              background: '#141714',
              border: '1px solid #252925',
              borderRadius: 8,
              fontSize: 12,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#8c918c' }} />
          <Line type="monotone" dataKey="winRate10" name="Moy. mobile 10" stroke="#1DE9B6" strokeWidth={2} dot={false} connectNulls isAnimationActive={false} />
          <Line type="monotone" dataKey="winRate20" name="Moy. mobile 20" stroke="#2ed573" strokeWidth={2} dot={false} connectNulls isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

RollingWinRateChart.propTypes = {
  data10: PropTypes.array.isRequired,
  data20: PropTypes.array.isRequired,
};

export default memo(RollingWinRateChart);
