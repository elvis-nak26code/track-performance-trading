// En-tête de page standard : petit label "// section", titre, description
// et emplacement pour des actions (boutons) à droite.
import PropTypes from 'prop-types';

export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
      <div>
        {eyebrow && (
          <p className="font-mono text-xs text-text-secondary mb-1">// {eyebrow}</p>
        )}
        <h1 className="text-2xl font-semibold text-text-primary">{title}</h1>
        {description && <p className="text-sm text-text-secondary mt-1">{description}</p>}
      </div>
      {actions && <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">{actions}</div>}
    </div>
  );
}

PageHeader.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  actions: PropTypes.node,
};
