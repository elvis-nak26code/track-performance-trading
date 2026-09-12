// Conteneur de carte réutilisable : fond légèrement plus clair que le fond
// principal, coins arrondis, bordure fine — respecte le design "terminal".
import PropTypes from 'prop-types';

export default function Card({ children, className = '', title, action }) {
  return (
    <div className={`bg-card border border-card-border rounded-card shadow-[0_2px_14px_rgba(0,0,0,0.22)] ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-4 pt-4">
          {title && (
            <h3 className="text-xs uppercase tracking-wide text-text-secondary font-mono">{title}</h3>
          )}
          {action}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  title: PropTypes.string,
  action: PropTypes.node,
};
