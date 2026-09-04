// États d'attente et d'absence de données, utilisés pendant le chargement
// asynchrone des trades / entrées de journal (simulation d'appels API).
import PropTypes from 'prop-types';

export function LoadingState({ label = 'Chargement en cours…' }) {
  return (
    <div className="flex items-center gap-3 text-text-secondary text-sm py-10 justify-center font-mono">
      <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
      {label}
    </div>
  );
}
LoadingState.propTypes = { label: PropTypes.string };

export function EmptyState({ title, description }) {
  return (
    <div className="text-center py-10 border border-dashed border-card-border rounded-card">
      <p className="text-text-primary font-medium">{title}</p>
      {description && <p className="text-text-secondary text-sm mt-1">{description}</p>}
    </div>
  );
}
EmptyState.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
};
