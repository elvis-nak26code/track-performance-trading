// Histogramme de distribution des R, en version "divergente" :
// l'origine est à 0, les tranches de pertes sont dessinées vers le bas
// (partie négative, en rouge) et les tranches de gains vers le haut
// (partie positive, en vert). Les trades à 0R (ni gain ni perte) restent
// au centre, en gris. L'axe des Y est symétrique autour de 0 afin que la
// ligne d'origine reste toujours au milieu du graphique.
import { memo } from 'react';
import PropTypes from 'prop-types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  LabelList,
  Cell,
} from 'recharts';

function RDistributionChart({ data }) {
  if (!data || data.length === 0) return null;
  const maxCount = Math.max(...data.map((d) => Math.abs(d.count)), 1);

  return (
    <div className="h-[480px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 24, right: 24, bottom: 8, left: 8 }} barCategoryGap="22%">
          <CartesianGrid stroke="#252925" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="short"
            tick={{ fill: '#8c918c', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={{ stroke: '#252925' }}
            tickLine={false}
            interval={0}
          />
          <YAxis
            domain={[-maxCount, maxCount]}
            tick={{ fill: '#8c918c', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={{ stroke: '#252925' }}
            tickLine={false}
            allowDecimals={false}
            width={36}
          />
          <ReferenceLine y={0} stroke="#6b726b" strokeDasharray="4 4" label={{ value: '0', position: 'insideBottomRight', fill: '#6b726b', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }} />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            contentStyle={{
              background: '#141714',
              border: '1px solid #252925',
              borderRadius: 8,
              fontSize: 12,
              fontFamily: 'JetBrains Mono, monospace',
            }}
            formatter={(value, name) => [
              `${Math.abs(value)} trade${Math.abs(value) > 1 ? 's' : ''}`,
              name === 'gain' ? 'Gains (R positif)' : 'Pertes (R négatif)',
            ]}
            labelFormatter={(label, payload) => (payload && payload[0] ? payload[0].payload.label : label)}
          />
          <Bar dataKey="loss" fill="#ff5252" radius={[0, 0, 3, 3]} minBarSize={3} isAnimationActive={false}>
            <LabelList
              dataKey="loss"
              position="bottom"
              offset={6}
              formatter={(v) => `${Math.abs(v)}`}
              style={{ fill: '#ff5252', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            />
          </Bar>
          <Bar dataKey="gain" radius={[3, 3, 0, 0]} minBarSize={3} isAnimationActive={false}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.flat ? '#8c918c' : '#2ed573'} />
            ))}
            <LabelList
              dataKey="count"
              position="top"
              offset={6}
              style={{ fill: '#8c918c', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

RDistributionChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      bucket: PropTypes.string,
      label: PropTypes.string,
      short: PropTypes.string,
      count: PropTypes.number,
      flat: PropTypes.bool,
      loss: PropTypes.number,
      gain: PropTypes.number,
    })
  ).isRequired,
};

export default memo(RDistributionChart);