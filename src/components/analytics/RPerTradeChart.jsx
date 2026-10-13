// Graphique "R par trade" : une barre par trade, dans l'ordre chronologique,
// avec un espacement régulier (l'axe horizontal = la succession des trades,
// pas les dates). La hauteur de chaque barre est le multiple de R :
// pertes vers le bas (en rouge), gains vers le haut (en vert). La date d'un
// trade ne s'affiche qu'au survol de sa barre (via l'infobulle).
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
  Cell,
} from 'recharts';
import { formatDateShort } from '../../utils/dateHelpers';

function TradeTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  const rSign = d.r >= 0 ? '+' : '';
  const pnlSign = d.pnl >= 0 ? '+' : '';
  return (
    <div
      style={{
        background: '#141714',
        border: '1px solid #252925',
        borderRadius: 8,
        fontSize: 12,
        fontFamily: 'JetBrains Mono, monospace',
        padding: '8px 10px',
      }}
    >
      <div style={{ color: '#8c918c', marginBottom: 4 }}>{formatDateShort(d.date)}</div>
      <div style={{ color: d.r >= 0 ? '#2ed573' : '#ff5252' }}>
        R : {rSign}
        {d.r.toFixed(2)}
      </div>
      <div style={{ color: '#cfd6cf', marginTop: 2 }}>
        P&amp;L : {pnlSign}
        {d.pnl.toFixed(2)} $
      </div>
    </div>
  );
}

TradeTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
};

function RPerTradeChart({ trades, fullscreen = false }) {
  if (!trades || trades.length === 0) return null;

  const data = trades.map((t, i) => ({
    index: i + 1,
    date: t.date,
    r: t.r,
    pnl: t.pnl,
  }));

  // Espace les labels d'axe : affiche ~15 numéros de trade max.
  const tickInterval = Math.max(0, Math.ceil(data.length / 15) - 1);

  return (
    <div className={fullscreen ? 'h-[calc(100vh-5rem)]' : 'h-[480px]'}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }} barCategoryGap="12%">
          <CartesianGrid stroke="#252925" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="index"
            tick={{ fill: '#8c918c', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={{ stroke: '#252925' }}
            tickLine={false}
            interval={tickInterval}
          />
          <YAxis
            tick={{ fill: '#8c918c', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
            axisLine={{ stroke: '#252925' }}
            tickLine={false}
            width={40}
          />
          <ReferenceLine y={0} stroke="#6b726b" strokeDasharray="4 4" />
          <Tooltip
            content={<TradeTooltip />}
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          />
          <Bar dataKey="r" radius={[1, 1, 1, 1]} isAnimationActive={false}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.r > 0 ? '#2ed573' : entry.r < 0 ? '#ff5252' : '#8c918c'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

RPerTradeChart.propTypes = {
  trades: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      r: PropTypes.number,
      pnl: PropTypes.number,
    })
  ).isRequired,
  fullscreen: PropTypes.bool,
};

export default memo(RPerTradeChart);