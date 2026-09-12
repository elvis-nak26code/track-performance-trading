// Carte d'aperçu d'une entrée de journal dans la liste (/journal).
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import { CandlestickChart, NotebookPen } from 'lucide-react';
import { formatDateFr } from '../../utils/dateHelpers';
import { getMoodMeta } from '../../constants/moods';
import Badge from '../common/Badge';

export default function JournalEntryCard({ entry, onDelete }) {
  const navigate = useNavigate();
  const mood = getMoodMeta(entry.mood);

  // Préview basée sur le premier bloc de texte (ou l'ancien champ "text").
  const text = Array.isArray(entry.blocks)
    ? entry.blocks.find((b) => b.type === 'text')?.content || ''
    : entry.text || '';
  const preview = text.length > 100 ? `${text.slice(0, 100)}…` : text;

  // Première capture de l'entrée, si elle en a une.
  const firstShot = entry.screenshots?.[0];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/journal/${entry.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(`/journal/${entry.id}`);
        }
      }}
      className="bg-card border border-card-border rounded-card overflow-hidden flex flex-col cursor-pointer hover:border-accent/40 transition-colors"
    >
      {/* Zone image : même hauteur avec ou sans capture */}
      <div className="aspect-[16/5] overflow-hidden bg-bg/60">
        {firstShot ? (
          <img
            src={firstShot.url}
            alt={firstShot.caption || firstShot.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <JournalMotif />
        )}
      </div>
      <div className="p-2 flex flex-col gap-1 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link
              to={`/journal/${entry.id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-text-primary font-medium font-mono text-[13px] truncate block hover:text-accent transition-colors"
            >
              {entry.instrument}
            </Link>
            <p className="text-[10px] text-text-secondary font-mono mt-0.5">{formatDateFr(entry.date)}</p>
          </div>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono uppercase border whitespace-nowrap shrink-0 ${mood.color}`}>
            {mood.label}
          </span>
        </div>
        <p className="text-xs text-text-secondary leading-snug line-clamp-2">{preview}</p>
        <div className="flex items-center justify-between mt-auto pt-0.5">
          {entry.linkedTradeIds?.length > 0 ? (
            <Badge tone="neutral">
              {entry.linkedTradeIds.length} trade{entry.linkedTradeIds.length > 1 ? 's' : ''} lié
            </Badge>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <Link
              to={`/journal/${entry.id}/modifier`}
              onClick={(e) => e.stopPropagation()}
              className="text-text-secondary hover:text-accent"
            >
              Modifier
            </Link>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(entry.id);
              }}
              className="text-text-secondary hover:text-danger"
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Motif simple et soigné affiché quand l'entrée n'a pas de capture : dégradé
// doux avec gros point d'accent au centre, type carte PDF sans visuel.
function JournalMotif() {
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-accent/15 via-accent/5 to-transparent">
      <span className="absolute left-[-14px] top-[-18px] w-16 h-16 rounded-full bg-accent/10" />
      <span className="absolute right-4 bottom-[-16px] w-10 h-10 rounded-full bg-accent/10" />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="w-9 h-9 rounded-full bg-card border border-accent/25 flex items-center justify-center shadow-lg">
          <CandlestickChart size={16} className="text-accent" />
        </span>
      </div>
      <NotebookPen size={120} className="absolute right-1 -bottom-8 text-accent/[0.06] -rotate-12" aria-hidden="true" />
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
    screenshots: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        url: PropTypes.string,
        caption: PropTypes.string,
        name: PropTypes.string,
      })
    ),
    linkedTradeIds: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
};