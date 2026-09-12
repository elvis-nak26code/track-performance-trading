// Page de création / édition d'une entrée de journal (/journal/nouveau et
// /journal/:id/modifier). Le corps est une feuille blanche (type PDF) sur
// laquelle on écrit librement et on dépose des captures d'écran.
import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJournalEntries } from '../hooks/useJournalEntries';
import { useTrades } from '../hooks/useTrades';
import { useMarkets } from '../hooks/useMarkets';
import { usePlan } from '../context/PlanContext';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import MoodSelector from '../components/journal/MoodSelector';
import JournalPageEditor from '../components/journal/JournalPageEditor';
import LinkedTradesSelector from '../components/journal/LinkedTradesSelector';
import { LoadingState } from '../components/common/LoadingState';
import { MARKET_CATEGORIES } from '../constants/markets';
import { htmlToBlocks } from '../utils/journalPage';

function createEmptyEntry() {
  return {
    instrument: '',
    date: new Date().toISOString().slice(0, 10),
    mood: 'calme',
    text: '',
    blocks: [],
    screenshots: [],
    linkedTradeIds: [],
  };
}

// Anciennes entrées sans blocs : on matérialise leur texte en un bloc texte
// pour pré-remplir la page éditable.
function pageInitialBlocks(entry) {
  const blocks = entry.blocks || [];
  if (blocks.length) return blocks;
  return entry.text ? [{ type: 'text', content: entry.text }] : [];
}

export default function JournalEntryForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { entries, addEntry, editEntry } = useJournalEntries();
  const { trades } = useTrades();
  const { markets } = useMarkets();
  const { isExpired, requirePlan } = usePlan();
  const [form, setForm] = useState(createEmptyEntry);
  const [ready, setReady] = useState(() => !isEditing);
  const [notFound, setNotFound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageHtml, setPageHtml] = useState('');
  const shotsUsedRef = useRef([]);

  const marketsByCategory = useMemo(() => {
    return MARKET_CATEGORIES.map((cat) => ({
      ...cat,
      options: markets.filter((m) => m.category === cat.value),
    })).filter((cat) => cat.options.length > 0);
  }, [markets]);

  useEffect(() => {
    if (!isEditing) return;
    if (!entries.length) return;
    const existing = entries.find((e) => e.id === id);
    if (existing) {
      setForm({ ...existing });
      setReady(true);
    } else {
      setNotFound(true);
    }
  }, [isEditing, id, entries]);

  // Accès direct à /journal/nouveau par un utilisateur dont le forfait est
  // terminé : on l'informe (modal) et on le ramène sur la liste du journal
  // (qui reste lisible, seule la création est verrouillée).
  useEffect(() => {
    if (isExpired && !isEditing) {
      requirePlan('créer une nouvelle entrée de journal');
      navigate('/journal', { replace: true });
    }
  }, [isExpired, isEditing, requirePlan, navigate]);

  // Petite bascule : prêt directement en création, après chargement en édition.
  useEffect(() => {
    if (!isEditing) setReady(true);
  }, [isEditing]);

  if (!ready) return <LoadingState label="Chargement de l'entrée…" />;
  if (notFound) {
    return (
      <div className="text-center py-16 text-text-secondary">
        Cette entrée de journal n'existe pas.
      </div>
    );
  }

  function update(patch) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { blocks } = htmlToBlocks(pageHtml);
      const used = new Set(shotsUsedRef.current);
      const screenshots = (form.screenshots || []).filter((s) => used.has(s.id));
      const text = blocks
        .filter((b) => b.type === 'text')
        .map((b) => b.content)
        .filter(Boolean)
        .join('\n\n');

      // Libère les URL blob des captures déposées puis retirées de la page.
      (form.screenshots || []).forEach((s) => {
        if (s.url?.startsWith('blob:') && !used.has(s.id)) URL.revokeObjectURL(s.url);
      });

      const payload = { ...form, text, blocks, screenshots };

      if (isEditing) {
        await editEntry(id, payload);
        navigate(`/journal/${id}`);
      } else {
        const created = await addEntry(payload);
        navigate(`/journal/${created.id}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="journal"
        title={isEditing ? "Modifier l'entrée" : 'Nouvelle entrée de journal'}
        description="Prenez quelques minutes pour analyser votre session à froid : écrivez sur une page blanche, glissez vos captures d'écran, redimensionnez-les."
      />
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-text-secondary font-mono">
              Indice concerné
              <input
                required
                list="instruments-list"
                value={form.instrument}
                onChange={(e) => update({ instrument: e.target.value })}
                placeholder="Choisir ou saisir un instrument…"
                className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-accent/60"
              />
              <datalist id="instruments-list">
                {marketsByCategory.map((cat) =>
                  cat.options.map((m) => (
                    <option
                      key={m.symbol}
                      value={m.symbol}
                      label={`${m.symbol} — ${m.name}`}
                    />
                  ))
                )}
              </datalist>
            </label>
            <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-text-secondary font-mono">
              Date
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => update({ date: e.target.value })}
                className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-accent/60"
              />
            </label>
          </div>

          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-text-secondary font-mono mb-2">Humeur</p>
            <MoodSelector value={form.mood} onChange={(mood) => update({ mood })} />
          </div>
        </Card>

        <JournalPageEditor
          key={isEditing ? id : 'new'}
          initialBlocks={pageInitialBlocks(form)}
          initialScreenshots={form.screenshots || []}
          onChange={({ html, screenshots, shotsUsed }) => {
            setPageHtml(html);
            shotsUsedRef.current = shotsUsed;
            update({ screenshots });
          }}
        />

        <Card>
          <LinkedTradesSelector
            trades={trades}
            selectedIds={form.linkedTradeIds || []}
            onChange={(linkedTradeIds) => update({ linkedTradeIds })}
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement…' : "Enregistrer l'entrée"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}