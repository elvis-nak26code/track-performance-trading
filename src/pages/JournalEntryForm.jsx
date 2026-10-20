// Page de création / édition d'une entrée de journal (/journal/nouveau et
// /journal/:id/modifier). Le corps est une feuille blanche (type PDF) sur
// laquelle on écrit librement et on dépose des captures d'écran.
import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, NotebookTabs, Smile } from 'lucide-react';
import { useJournalEntries } from '../hooks/useJournalEntries';
import { useTrades } from '../hooks/useTrades';
import { useMarkets } from '../hooks/useMarkets';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import MoodSelector from '../components/journal/MoodSelector';
import JournalPageEditor from '../components/journal/JournalPageEditor';
import LinkedTradesSelector from '../components/journal/LinkedTradesSelector';
import { LoadingState } from '../components/common/LoadingState';
import { MARKET_CATEGORIES } from '../constants/markets';
import { htmlToBlocks } from '../utils/journalPage';
import { MAX_JOURNAL_SCREENSHOTS } from '../services/api/journalApi';

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
  const [form, setForm] = useState(createEmptyEntry);
  const [ready, setReady] = useState(() => !isEditing);
  const [notFound, setNotFound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState(null);
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
    setSaveError(null);

    // Vérifie le plafond de captures avant d'envoyer : au-delà de la limite du
    // backend, les images supplémentaires seraient refusées (et sembleraient
    // "disparaître"). On prévient au lieu d'échouer silencieusement.
    const shots = form.screenshots || [];
    if (shots.length > MAX_JOURNAL_SCREENSHOTS) {
      setSaveError(
        `Cette entrée contient ${shots.length} captures, mais le maximum est de ${MAX_JOURNAL_SCREENSHOTS}. Supprimez-en ${shots.length - MAX_JOURNAL_SCREENSHOTS} puis réenregistrez.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const { blocks } = htmlToBlocks(pageHtml);
      const used = new Set(shotsUsedRef.current);
      const screenshots = shots.filter((s) => used.has(s.id));
      const text = blocks
        .filter((b) => b.type === 'text')
        .map((b) => b.content)
        .filter(Boolean)
        .join('\n\n');

      // Libère les URL blob des captures déposées puis retirées de la page.
      shots.forEach((s) => {
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
    } catch (err) {
      // Plus d'échec silencieux : on affiche la vraie raison (ex : trop
      // d'images, fichier trop volumineux, entrée de ce serveur en erreur).
      setSaveError(
        err?.message?.includes('Erreur réseau')
          ? "L'entrée n'a pas pu être enregistrée (connexion au serveur impossible). Vos modifications sont restées sur cette page."
          : `L'entrée n'a pas pu être enregistrée : ${err?.message || 'erreur inconnue'}. Vos saisies sont conservées sur cette page.`
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
        {saveError && (
          <div className="rounded-card border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
            {saveError}
          </div>
        )}
        <div className="max-w-3xl mx-auto w-full flex flex-col gap-4">
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wide text-text-secondary mb-1.5">
              <NotebookTabs size={13} />
              {isEditing ? 'Modification' : 'Nouvelle entrée'} de journal
            </p>
            <input
              required
              list="instruments-list"
              value={form.instrument}
              onChange={(e) => update({ instrument: e.target.value })}
              placeholder="Titre de l'analyse (ex : PAIR.USD — session du soir)…"
              className="w-full bg-transparent text-2xl sm:text-3xl font-bold text-text-primary placeholder:text-text-secondary/40 focus:outline-none pt-0.5"
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
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 h-9 px-3 rounded-lg border border-card-border bg-card text-xs font-mono text-text-secondary cursor-pointer">
              <Calendar size={14} className="text-accent" />
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => update({ date: e.target.value })}
                className="bg-transparent w-auto text-text-primary focus:outline-none [color-scheme:light]"
              />
            </label>
            <span className="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-card-border bg-card text-xs font-mono text-text-secondary">
              <Smile size={14} className="text-accent" />
              Humeur
            </span>
            <MoodSelector value={form.mood} onChange={(mood) => update({ mood })} />
          </div>
        </div>

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
          <div className="flex flex-wrap justify-between items-center gap-2 mt-4 no-print">
          <span className="text-[11px] font-mono text-text-secondary/70">
            {(form.screenshots || []).length} / {MAX_JOURNAL_SCREENSHOTS} captures
          </span>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement…' : "Enregistrer l'entrée"}
            </Button>
          </div>
        </div>
        </Card>
      </form>
    </div>
  );
}