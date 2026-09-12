// Page Journal de trading (/journal) : liste des entrées, et vue détail
// d'une entrée lorsque l'URL contient un identifiant (/journal/:id).
import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJournalEntries } from '../hooks/useJournalEntries';
import { useTrades } from '../hooks/useTrades';
import { usePlan } from '../context/PlanContext';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import PeriodFilter from '../components/common/PeriodFilter';
import { LoadingState, EmptyState } from '../components/common/LoadingState';
import JournalEntryCard from '../components/journal/JournalEntryCard';
import { formatDateFr, formatDateShort, listAvailableMonths, filterByPeriod } from '../utils/dateHelpers';
import { getMoodMeta } from '../constants/moods';

function JournalList() {
  const { entries, isLoading, removeEntry } = useJournalEntries();
  const navigate = useNavigate();
  const { requirePlan } = usePlan();
  const [period, setPeriod] = useState({ mode: 'all' });

  const availableMonths = useMemo(() => listAvailableMonths(entries), [entries]);
  const filteredEntries = useMemo(() => filterByPeriod(entries, period), [entries, period]);
  const sorted = useMemo(
    () => [...filteredEntries].sort((a, b) => b.date.localeCompare(a.date)),
    [filteredEntries]
  );

  if (isLoading) return <LoadingState label="Chargement du journal…" />;

  return (
    <div>
      <PageHeader
        eyebrow="journal"
        title="Journal de trading"
        description="Consignez votre analyse, votre état d'esprit et vos apprentissages après chaque session."
        actions={
          <Button
            variant="primary"
            onClick={() => {
              if (requirePlan('créer une nouvelle entrée de journal')) navigate('/journal/nouveau');
            }}
          >
            + Nouvelle entrée
          </Button>
        }
      />

      <div className="mb-4">
        <PeriodFilter value={period} onChange={setPeriod} availableMonths={availableMonths} />
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title="Aucune entrée de journal"
          description={
            entries.length === 0
              ? 'Créez votre première entrée pour commencer.'
              : 'Aucune entrée ne correspond à la période sélectionnée.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {sorted.map((entry) => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              onDelete={(id) => {
                if (window.confirm('Supprimer définitivement cette entrée de journal ?')) {
                  removeEntry(id);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function JournalDetail({ id }) {
  const { entries, isLoading } = useJournalEntries();
  const { trades } = useTrades();
  const navigate = useNavigate();
  const [lightboxShot, setLightboxShot] = useState(null);

  if (isLoading) return <LoadingState label="Chargement de l'entrée…" />;

  const entry = entries.find((e) => e.id === id);
  if (!entry) {
    return (
      <EmptyState
        title="Entrée introuvable"
        description="Cette entrée de journal n'existe pas ou a été supprimée."
      />
    );
  }

  const mood = getMoodMeta(entry.mood);
  const linkedTrades = (entry.linkedTradeIds || [])
    .map((tradeId) => trades.find((t) => t.id === tradeId))
    .filter(Boolean);

  const hasBlocks = Array.isArray(entry.blocks) && entry.blocks.length > 0;

  // Rend un bloc (texte ou image) dans l'ordre de l'entrée, sur la page
  // blanche. Les images respectent la largeur redimensionnée par l'auteur,
  // sinon pleine largeur.
  function renderBlock(block, index) {
    if (block.type === 'text') {
      if (!block.content) return null;
      return (
        <p key={`blk-${index}`} className="whitespace-pre-wrap leading-relaxed text-[15px] text-neutral-800">
          {block.content}
        </p>
      );
    }

    const shot = entry.screenshots?.find((s) => s.id === block.screenshotId);
    if (!shot) return null;

    return (
      <figure key={`blk-${index}`} className="flex flex-col gap-1.5 my-4">
        <button
          type="button"
          onClick={() => setLightboxShot(shot)}
          className="text-left"
          title="Agrandir la capture"
        >
          <img
            src={shot.url}
            alt={shot.caption || shot.name}
            className="h-auto mx-auto max-h-[75vh] object-contain"
            style={{ width: block.width || '100%' }}
          />
        </button>
        {shot.caption && (
          <figcaption className="text-xs text-neutral-500 font-mono px-1">{shot.caption}</figcaption>
        )}
      </figure>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="no-print flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => navigate('/journal')}
          className="text-xs font-mono text-text-secondary hover:text-accent"
        >
          ← Retour au journal
        </button>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => window.print()}>
            Exporter en PDF
          </Button>
          <Button variant="secondary" onClick={() => navigate(`/journal/${entry.id}/modifier`)}>
            Modifier
          </Button>
        </div>
      </div>

      {/* Feuille blanche façon PDF */}
      <div className="journal-paper rounded-lg px-6 sm:px-12 py-8 sm:py-12 leading-relaxed">
        <p className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-mono uppercase border ${mood.color}`}>
          {mood.label}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 mt-3">{entry.instrument}</h1>
        <p className="text-sm text-neutral-500 font-mono mt-1">{formatDateFr(entry.date)}</p>
        <div className="border-t border-neutral-200 my-6" />

        {hasBlocks ? (
          entry.blocks.map((block, index) => renderBlock(block, index))
        ) : (
          <div>
            {entry.text && (
              <p className="whitespace-pre-wrap leading-relaxed text-[15px] text-neutral-800">{entry.text}</p>
            )}
            {entry.screenshots?.length > 0 && (
              <div className="mt-6 flex flex-col gap-6">
                {entry.screenshots.map((shot) => (
                  <figure key={shot.id} className="flex flex-col gap-1.5 my-4">
                    <button
                      type="button"
                      onClick={() => setLightboxShot(shot)}
                      className="text-left"
                      title="Agrandir la capture"
                    >
                      <img
                        src={shot.url}
                        alt={shot.caption || shot.name}
                        className="w-full h-auto max-h-[75vh] object-contain"
                      />
                    </button>
                    {shot.caption && (
                      <figcaption className="text-xs text-neutral-500 font-mono px-1">{shot.caption}</figcaption>
                    )}
                  </figure>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fallback pour les anciennes entrées sans blocs : le texte est déjà
          affiché ci-dessus, les captures sont rendues dans la page. */}

      {lightboxShot && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-black/85"
          onClick={() => setLightboxShot(null)}
        >
          <img src={lightboxShot.url} alt="Capture agrandie" className="max-w-full max-h-[85vh] rounded-card object-contain" />
          {lightboxShot.caption && (
            <p className="text-sm text-white/90 mt-3 font-mono">{lightboxShot.caption}</p>
          )}
          <button
            type="button"
            onClick={() => setLightboxShot(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl leading-none"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
      )}

      {linkedTrades.length > 0 && (
        <Card title="Trades liés" className="no-print">
          <ul className="flex flex-col gap-2">
            {linkedTrades.map((t) => (
              <li key={t.id} className="flex items-center justify-between text-sm font-mono">
                <span className="text-text-secondary">
                  {formatDateShort(t.date)} · {t.symbol}
                </span>
                <Badge tone={t.direction === 'long' ? 'positive' : 'negative'}>
                  {t.direction === 'long' ? 'Long' : 'Short'}
                </Badge>
                <span className={t.pnl >= 0 ? 'text-accent' : 'text-danger'}>
                  {t.pnl >= 0 ? '+' : ''}
                  {t.pnl.toFixed(2)} $
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

export default function Journal() {
  const { id } = useParams();
  if (id) return <JournalDetail id={id} />;
  return <JournalList />;
}
