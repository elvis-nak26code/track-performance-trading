// Badge en forme de pilule utilisé pour direction (long/short), résultat
// (gain/perte) et humeur. Le "tone" détermine la couleur.
import PropTypes from 'prop-types';

const TONE_CLASSES = {
  positive: 'text-accent border-green-400/20 bg-accent/10 bg-green-400/10',
  negative: 'text-danger border-red-400/20 bg-danger/10 bg-red-400/10',
  neutral: 'text-text-secondary border-card-border bg-white/[0.03]',
};

export default function Badge({ children, tone = 'neutral', className = '' }) {
  return (
   <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wide border  ${TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  tone: PropTypes.oneOf(['positive', 'negative', 'neutral']),
  className: PropTypes.string,
};
