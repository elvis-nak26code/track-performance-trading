// Page Stratégies (/strategies) : définir sa stratégie de trading (règles,
// cadre de risque, sessions) et sa checklist pré-trade 100 % personnalisable.
// La checklist affichée sur le tableau de bord est celle de la stratégie active.
import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Check, Crosshair, Plus, Rocket, Save, Square, Trash2 } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { LoadingState } from '../components/common/LoadingState';
import { useStrategy } from '../hooks/useStrategy';
import { DEFAULT_CHECKLIST_ITEMS } from '../services/api/strategiesApi';

function genItemId() {
  return `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function newStrategyData() {
  return {
    name: 'Ma stratégie',
    description: '',
    rules: [],
    config: {
      maxRiskPerTradePct: 1,
      minRR: 1.5,
      maxDailyLossPct: 3,
      sessionStart: '',
      sessionEnd: '',
      timeframes: [],
      symbols: [],
      directions: ['long', 'short'],
    },
    checklistItems: DEFAULT_CHECKLIST_ITEMS.map((label) => ({ id: genItemId(), label, enabled: true })),
  };
}

function ConfigField({ label, value, onChange, hint, step }) {
  return (
    <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-text-secondary font-mono">
      {label}
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-accent/60"
      />
      {hint && <span className="text-[10px] normal-case text-text-secondary/70">{hint}</span>}
    </label>
  );
}

function ListEditor({ label, placeholder, items, onChange }) {
  const [value, setValue] = useState('');

  function add(e) {
    e.preventDefault();
    const v = value.trim();
    if (!v) return;
    onChange([...items, v]);
    setValue('');
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-text-secondary font-mono mb-2">{label}</p>
      <ul className="flex flex-wrap gap-1.5 mb-2">
        {items.map((item, i) => (
          <li key={`${item}-${i}`} className="group flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-mono border border-card-border bg-bg text-text-primary">
            {item}
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="text-text-secondary hover:text-danger"
              aria-label={`Retirer ${item}`}
            >
              ×
            </button>
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-xs text-text-secondary/60 font-mono italic">Aucun élément.</li>
        )}
      </ul>
      <form onSubmit={add} className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-bg border border-card-border rounded-card px-3 py-1.5 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent/60"
        />
        <button type="submit" className="text-sm font-mono text-accent hover:text-accent-soft px-2">
          Ajouter
        </button>
      </form>
    </div>
  );
}

export default function Strategies() {
  const { strategies, activeStrategy, isLoading, addStrategy, editStrategy, removeStrategy, activate } = useStrategy();
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const selected = useMemo(
    () => strategies.find((s) => s.id === selectedId) || activeStrategy || strategies[0] || null,
    [strategies, selectedId, activeStrategy]
  );

  // Sélectionne et charge la stratégie affichée dans l'éditeur.
  useEffect(() => {
    if (!selected) {
      setDraft(null);
      return;
    }
    setDraft(JSON.parse(JSON.stringify(selected)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  if (isLoading) return <LoadingState label="Chargement des stratégies…" />;

  if (strategies.length === 0) {
    return (
      <div>
        <PageHeader
          eyebrow="préparation"
          title="Stratégies"
          description="Définissez votre stratégie et votre checklist pré-trade pour passer chaque trade en toute conformité."
          actions={
            <Button variant="primary" onClick={handleCreateNew}>
              <Plus size={16} className="mr-1.5" /> Créer ma stratégie
            </Button>
          }
        />
        <div className="text-center py-10 border border-dashed border-card-border rounded-card">
          <p className="flex items-center justify-center gap-2 font-medium text-text-primary">
            <Crosshair size={18} className="text-accent" /> Aucune stratégie pour l'instant
          </p>
          <p className="text-text-secondary text-sm mt-1 max-w-md mx-auto">
            Une stratégie formalise vos règles d'entrée, votre cadre de risque et votre
            checklist pré-trade. Créez la première.
          </p>
          <Button variant="primary" className="mt-4" onClick={handleCreateNew}>
            <Plus size={16} className="mr-1" /> Créer ma première stratégie
          </Button>
        </div>
      </div>
    );
  }

  async function handleCreateNew() {
    const created = await addStrategy(newStrategyData());
    setSelectedId(created.id);
  }

  async function handleSave() {
    if (!selected || !draft) return;
    setSaving(true);
    try {
      const config = { ...draft.config };
      config.maxRiskPerTradePct = Number(config.maxRiskPerTradePct) || 0;
      config.minRR = Number(config.minRR) || 0;
      config.maxDailyLossPct = Number(config.maxDailyLossPct) || 0;
      const updated = await editStrategy(selected.id, { ...draft, config });
      setDraft(JSON.parse(JSON.stringify(updated)));
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1600);
    } finally {
      setSaving(false);
    }
  }

  function patchDraft(patch) {
    if (!draft) return;
    setDraft({ ...draft, ...patch });
  }

  function patchConfig(key, value) {
    if (!draft) return;
    setDraft({ ...draft, config: { ...draft.config, [key]: value } });
  }

  function toggleChecklistItemId(id) {
    if (!draft) return;
    patchDraft({
      checklistItems: draft.checklistItems.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      ),
    });
  }

  function setChecklistLabel(id, label) {
    if (!draft) return;
    patchDraft({
      checklistItems: draft.checklistItems.map((item) => (item.id === id ? { ...item, label } : item)),
    });
  }

  function removeChecklistItem(id) {
    if (!draft) return;
    patchDraft({ checklistItems: draft.checklistItems.filter((item) => item.id !== id) });
  }

  function addChecklistItem() {
    if (!draft) return;
    patchDraft({
      checklistItems: [...draft.checklistItems, { id: genItemId(), label: '', enabled: true }],
    });
  }

  function moveChecklistItem(index, dir) {
    if (!draft) return;
    const next = [...draft.checklistItems];
    const to = index + dir;
    if (to < 0 || to >= next.length) return;
    [next[index], next[to]] = [next[to], next[index]];
    patchDraft({ checklistItems: next });
  }

  function handleToggleDirection(dir) {
    if (!draft) return;
    const has = draft.config.directions.includes(dir);
    const directions = has
      ? draft.config.directions.filter((d) => d !== dir)
      : [...draft.config.directions, dir];
    patchConfig('directions', directions);
  }

  const enabledCount = draft?.checklistItems?.filter((i) => i.enabled).length || 0;

  return (
    <div>
      <PageHeader
        eyebrow="préparation"
        title="Stratégies"
        description="Définissez vos règles et votre cadre de risque, puis activez la stratégie dont la checklist pré-trade doit s'appliquer."
        actions={
          <Button variant="primary" onClick={handleCreateNew}>
            <Plus size={16} className="mr-1.5" /> Nouvelle stratégie
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-4 items-start">
        {/* Liste des stratégies */}
        <Card className="lg:sticky lg:top-4">
          <ul className="flex flex-col gap-2">
            {strategies.map((s) => (
              <li
                key={s.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedId(s.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedId(s.id);
                  }
                }}
                className={`rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
                  selected?.id === s.id
                    ? 'border-accent/50 bg-accent/5'
                    : 'border-card-border hover:border-accent/30'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-text-primary font-mono truncate">{s.name}</p>
                  {s.isActive && <Badge tone="positive">Active</Badge>}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  {s.isActive && (
                    <span className="text-[10px] font-mono text-accent">
                      Checklist pré-trade du tableau de bord
                    </span>
                  )}
                  {!s.isActive && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        activate(s.id);
                      }}
                      className="text-[11px] font-mono text-accent hover:text-accent-soft flex items-center gap-1"
                      title="Utiliser cette stratégie sur le tableau de bord"
                    >
                      <Rocket size={12} /> Activer
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* Éditeur de la stratégie sélectionnée */}
        {draft && selected && (
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-4">
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={draft.name}
                  onChange={(e) => patchDraft({ name: e.target.value })}
                  placeholder="Nom de la stratégie"
                  className="w-full bg-transparent text-xl sm:text-2xl font-bold text-text-primary focus:outline-none placeholder:text-text-secondary/40"
                />
                <textarea
                  value={draft.description}
                  onChange={(e) => patchDraft({ description: e.target.value })}
                  placeholder="Décrivez votre stratégie en quelques mots (contexte favori, logique d'entrée…)."
                  rows={2}
                  className="mt-2 w-full bg-transparent text-sm text-text-secondary resize-none focus:outline-none placeholder:text-text-secondary/40"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {selected.isActive ? (
                  <Badge tone="positive">Stratégie active</Badge>
                ) : (
                  <Button variant="secondary" size="sm" onClick={() => activate(selected.id)}>
                    <Rocket size={14} className="mr-1" /> Activer
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {/* Règles */}
              <ListEditor
                label="Règles de la stratégie"
                placeholder="Une règle… (ex : entrer uniquement sur retour dans les zones)"
                items={draft.rules || []}
                onChange={(rules) => patchDraft({ rules })}
              />

              {/* Cadre de risque */}
              <div>
                <p className="text-xs uppercase tracking-wide text-text-secondary font-mono mb-2">Cadre de risque</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <ConfigField
                    label="Risque max / trade (%)"
                    value={draft.config.maxRiskPerTradePct}
                    hint="% du compte engagé sur un trade"
                    step="0.1"
                    onChange={(v) => patchConfig('maxRiskPerTradePct', v)}
                  />
                  <ConfigField
                    label="R : R minimum"
                    value={draft.config.minRR}
                    hint="Récompense / risque exigée"
                    step="0.1"
                    onChange={(v) => patchConfig('minRR', v)}
                  />
                  <ConfigField
                    label="Perte max journalière (%)"
                    value={draft.config.maxDailyLossPct}
                    hint="Stop total pour la journée"
                    step="0.1"
                    onChange={(v) => patchConfig('maxDailyLossPct', v)}
                  />
                </div>
              </div>

              {/* Créneaux de session */}
              <div>
                <p className="text-xs uppercase tracking-wide text-text-secondary font-mono mb-2">
                  Créneaux de session <span className="normal-case text-text-secondary/60">(optionnel)</span>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-text-secondary font-mono">
                    De
                    <input
                      type="time"
                      value={draft.config.sessionStart || ''}
                      onChange={(e) => patchConfig('sessionStart', e.target.value)}
                      className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-accent/60"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-text-secondary font-mono">
                    À
                    <input
                      type="time"
                      value={draft.config.sessionEnd || ''}
                      onChange={(e) => patchConfig('sessionEnd', e.target.value)}
                      className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-accent/60"
                    />
                  </label>
                </div>
              </div>

              {/* Directions autorisées */}
              <div>
                <p className="text-xs uppercase tracking-wide text-text-secondary font-mono mb-2">Directions autorisées</p>
                <div className="flex gap-2">
                  {['long', 'short'].map((dir) => {
                    const active = (draft.config.directions || []).includes(dir);
                    return (
                      <button
                        key={dir}
                        type="button"
                        onClick={() => handleToggleDirection(dir)}
                        className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-wide border transition-colors ${
                          active ? 'text-accent border-accent/60 bg-accent/10' : 'text-text-secondary border-card-border hover:border-text-secondary'
                        }`}
                      >
                        {dir === 'long' ? 'Long (achat)' : 'Short (vente)'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Timeframes + symboles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ListEditor
                  label="Clôtures / timeframes"
                  placeholder="Ex : H1, H4, M15"
                  items={draft.config.timeframes || []}
                  onChange={(timeframes) => patchConfig('timeframes', timeframes)}
                />
                <ListEditor
                  label="Instruments favoris"
                  placeholder="Ex : PAIR.USD, XAUUSD"
                  items={draft.config.symbols || []}
                  onChange={(symbols) => patchConfig('symbols', symbols)}
                />
              </div>

              {/* Checklist pré-trade (100 % personnalisable) */}
              <div className="border-t border-card-border pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs uppercase tracking-wide text-text-secondary font-mono">
                    Checklist pré-trade <span className="normal-case">({enabledCount} point{enabledCount > 1 ? 's' : ''} actif{enabledCount > 1 ? 's' : ''})</span>
                  </p>
                  <span className="text-[11px] font-mono text-text-secondary/70">
                    {selected.isActive ? 'Affichée sur le tableau de bord' : `Deviendra active à l'activation de « ${draft.name} »`}
                  </span>
                </div>

                <ul className="flex flex-col gap-1.5 mb-3">
                  {draft.checklistItems.map((item, index) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-2 group rounded-lg border border-card-border bg-bg px-2.5 py-1.5"
                    >
                      <input
                        type="checkbox"
                        checked={item.enabled !== false}
                        onChange={() => toggleChecklistItemId(item.id)}
                        title="Inclure ce point dans la checklist active"
                        className="accent-accent w-4 h-4 shrink-0"
                      />
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => setChecklistLabel(item.id, e.target.value)}
                        placeholder="Intitulé du point de contrôle…"
                        className={`flex-1 min-w-0 bg-transparent text-sm focus:outline-none ${
                          item.enabled === false ? 'text-text-secondary/50 line-through' : 'text-text-primary'
                        }`}
                      />
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => moveChecklistItem(index, -1)}
                          disabled={index === 0}
                          title="Monter"
                          className="text-text-secondary hover:text-accent disabled:opacity-30"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveChecklistItem(index, 1)}
                          disabled={index === draft.checklistItems.length - 1}
                          title="Descendre"
                          className="text-text-secondary hover:text-accent disabled:opacity-30"
                        >
                          <ChevronDown size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeChecklistItem(item.id)}
                          title="Supprimer ce point"
                          className="text-text-secondary hover:text-danger"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <Button variant="secondary" size="sm" onClick={addChecklistItem}>
                  <Plus size={14} className="mr-1" /> Ajouter un point de contrôle
                </Button>
              </div>
            </div>

            {/* Barre de sauvegarde */}
            <div className="flex items-center justify-between gap-2 mt-6 pt-4 border-t border-card-border no-print">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Supprimer définitivement la stratégie « ${selected.name} » ?`)) {
                    removeStrategy(selected.id);
                    setSelectedId(null);
                  }
                }}
                className="text-xs font-mono text-text-secondary hover:text-danger flex items-center gap-1.5"
              >
                <Square size={13} /> Supprimer la stratégie
              </button>
              <div className="flex items-center gap-3">
                {savedFlash && (
                  <span className="flex items-center gap-1 text-xs font-mono text-accent">
                    <Check size={14} /> Enregistré
                  </span>
                )}
                <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
                  <Save size={14} className="mr-1" /> {saving ? 'Enregistrement…' : 'Enregistrer'}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}