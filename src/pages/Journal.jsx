// Page Journal de trading (/journal) : liste des entrées, et vue détail
// d'une entrée lorsque l'URL contient un identifiant (/journal/:id).
import { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJournalEntries } from '../hooks/useJournalEntries';
import { useTrades } from '../hooks/useTrades';
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
  const [period, setPeriod] = useState({ mode: 'all' });

  const availableMonths = useMemo(() => listAvailableMonths(entries), [entries]);
  const filteredEntries = useMemo(() => filterByPeriod(entries, period), [entries, period]);

  if (isLoading) return <LoadingState label="Chargement du journal…" />;

  const sorted = [...filteredEntries].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <PageHeader
        eyebrow="journal"
        title="Journal de trading"
        description="Consignez votre analyse, votre état d'esprit et vos apprentissages après chaque session."
        actions={
          <Button variant="primary" onClick={() => navigate('/journal/nouveau')}>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/journal')}
        className="text-xs font-mono text-text-secondary hover:text-accent mb-4"
      >
        ← Retour au journal
      </button>
      <PageHeader
        eyebrow="journal · entrée"
        title={entry.instrument}
        description={formatDateFr(entry.date)}
        actions={
          <Button variant="secondary" onClick={() => navigate(`/journal/${entry.id}/modifier`)}>
            Modifier
          </Button>
        }
      />
      <div className="flex items-center gap-2 mb-4">
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono uppercase border ${mood.color}`}>
          {mood.label}
        </span>
      </div>
      <Card className="mb-4">
        <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">{entry.text}</p>
      </Card>

      {entry.screenshots?.length > 0 && (
        <Card title="Captures d'écran" className="mb-4">
          {/* Grande mise en page : une seule colonne sur mobile, deux sur écran large,
              chaque capture conserve ses proportions natives (pas de recadrage forcé). */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {entry.screenshots.map((shot) => (
              <button
                key={shot.id}
                type="button"
                onClick={() => setLightboxShot(shot)}
                className="rounded-card border border-card-border overflow-hidden bg-bg hover:border-accent/50 transition-colors text-left"
              >
                <img src={shot.url} alt={shot.caption || shot.name} className="w-full h-auto max-h-[480px] object-contain" />
                {shot.caption && (
                  <p className="text-xs text-text-secondary px-3 py-2 border-t border-card-border">{shot.caption}</p>
                )}
              </button>
            ))}
          </div>
        </Card>
      )}

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
        <Card title="Trades liés">
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
