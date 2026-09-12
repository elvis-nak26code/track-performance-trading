// Carte d'aperçu d'une entrée de journal dans la liste (/journal).
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { formatDateFr } from '../../utils/dateHelpers';
import { getMoodMeta } from '../../constants/moods';
import Badge from '../common/Badge';

export default function JournalEntryCard({ entry, onDelete }) {
  const mood = getMoodMeta(entry.mood);

  // Préview basée sur le premier bloc de texte (ou l'ancien champ "text").
  const text = Array.isArray(entry.blocks)
    ? entry.blocks.find((b) => b.type === 'text')?.content || ''
    : entry.text || '';
  const preview = text.length > 140 ? `${text.slice(0, 140)}…` : text;

  return (
    <div className="bg-card border border-card-border rounded-card p-4 flex flex-col gap-2 overflow-hidden">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Link
            to={`/journal/${entry.id}`}
            className="text-text-primary font-medium font-mono hover:text-accent transition-colors"
          >
            {entry.instrument}
          </Link>
          <p className="text-xs text-text-secondary font-mono mt-0.5">{formatDateFr(entry.date)}</p>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono uppercase border ${mood.color}`}>
          {mood.label}
        </span>
      </div>
      <p className="text-sm text-text-secondary">{preview}</p>
      <div className="flex items-center justify-between mt-1">
        {entry.linkedTradeIds?.length > 0 ? (
          <Badge tone="neutral">
            {entry.linkedTradeIds.length} trade{entry.linkedTradeIds.length > 1 ? 's' : ''} lié
            {entry.linkedTradeIds.length > 1 ? 's' : ''}
          </Badge>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-3 text-xs font-mono">
          <Link to={`/journal/${entry.id}/modifier`} className="text-text-secondary hover:text-accent">
            Modifier
          </Link>
          <button type="button" onClick={() => onDelete(entry.id)} className="text-text-secondary hover:text-danger">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

JournalEntryCard.propTypes = {
  entry: PropTypes.shape({
    id: PropTypes.string.isRequired,
    instrument: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    mood: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    linkedTradeIds: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
};
