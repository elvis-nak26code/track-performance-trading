// Barre de navigation mois précédent / mois suivant pour la page /calendrier.
import PropTypes from 'prop-types';
import { formatMonthYear } from '../../utils/dateHelpers';
import Button from '../common/Button';

export default function MonthNavigator({ monthDate, onPrev, onNext, onToday }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-text-primary">{formatMonthYear(monthDate)}</h2>
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={onPrev} className="px-2 py-1">
          ←
        </Button>
        <Button variant="secondary" onClick={onToday} className="text-xs">
          Aujourd&apos;hui
        </Button>
        <Button variant="secondary" onClick={onNext} className="px-2 py-1">
          →
        </Button>
      </div>
    </div>
  );
}

MonthNavigator.propTypes = {
  monthDate: PropTypes.instanceOf(Date).isRequired,
  onPrev: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onToday: PropTypes.func.isRequired,
};
