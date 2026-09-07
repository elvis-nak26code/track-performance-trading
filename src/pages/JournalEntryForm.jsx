// Page de création / édition d'une entrée de journal (/journal/nouveau et
// /journal/:id/modifier).
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJournalEntries } from '../hooks/useJournalEntries';
import { useTrades } from '../hooks/useTrades';
import { useMarkets } from '../hooks/useMarkets';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import MoodSelector from '../components/journal/MoodSelector';
import ScreenshotUploader from '../components/journal/ScreenshotUploader';
import LinkedTradesSelector from '../components/journal/LinkedTradesSelector';
import { LoadingState } from '../components/common/LoadingState';
import { MARKET_CATEGORIES, getMarketCategoryLabel } from '../constants/markets';

const EMPTY_ENTRY = {
  instrument: '',
  date: new Date().toISOString().slice(0, 10),
  mood: 'calme',
  text: '',
  screenshots: [],
  linkedTradeIds: [],
};

export default function JournalEntryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { entries, isLoading, addEntry, editEntry } = useJournalEntries();
  const { trades } = useTrades();
  const { markets } = useMarkets();
  const [form, setForm] = useState(EMPTY_ENTRY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(id);

  const marketsByCategory = useMemo(() => {
    return MARKET_CATEGORIES.map((cat) => ({
      ...cat,
      options: markets.filter((m) => m.category === cat.value),
    })).filter((cat) => cat.options.length > 0);
  }, [markets]);

  useEffect(() => {
    if (isEditing && entries.length > 0) {
      const existing = entries.find((e) => e.id === id);
      if (existing) setForm(existing);
    }
  }, [isEditing, id, entries]);

  if (isEditing && isLoading) return <LoadingState label="Chargement de l'entrée…" />;

  function update(patch) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await editEntry(id, form);
        navigate(`/journal/${id}`);
      } else {
        const created = await addEntry(form);
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
        description="Prenez quelques minutes pour analyser votre session à froid."
      />
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

          <div>
            <p className="text-xs uppercase tracking-wide text-text-secondary font-mono mb-2">Humeur</p>
            <MoodSelector value={form.mood} onChange={(mood) => update({ mood })} />
          </div>

          <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-text-secondary font-mono">
            Analyse libre
            <textarea
              required
              rows={8}
              value={form.text}
              onChange={(e) => update({ text: e.target.value })}
              placeholder="Qu'a fait le marché ? Qu'avez-vous fait ? Pourquoi ?"
              className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary normal-case font-sans leading-relaxed focus:outline-none focus:border-accent/60 resize-y"
            />
          </label>

          <LinkedTradesSelector
            trades={trades}
            selectedIds={form.linkedTradeIds || []}
            onChange={(linkedTradeIds) => update({ linkedTradeIds })}
          />

          <ScreenshotUploader
            screenshots={form.screenshots || []}
            onChange={(screenshots) => update({ screenshots })}
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement…' : "Enregistrer l'entrée"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
