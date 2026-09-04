// Sélecteur d'humeur sous forme de pilules cliquables, utilisé dans le
// formulaire de création/édition d'une entrée de journal.
import PropTypes from 'prop-types';
import { MOODS } from '../../constants/moods';

export default function MoodSelector({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {MOODS.map((mood) => {
        const isSelected = value === mood.value;
        return (
          <button
            key={mood.value}
            type="button"
            onClick={() => onChange(mood.value)}
            className={`px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wide border transition-colors ${
              isSelected ? mood.color : 'text-text-secondary border-card-border hover:border-text-secondary'
            }`}
          >
            {mood.label}
          </button>
        );
      })}
    </div>
  );
}

MoodSelector.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};
