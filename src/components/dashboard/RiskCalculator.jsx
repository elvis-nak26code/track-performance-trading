// Calculateur de risque : capital, % de risque (ou valeur de R fixe),
// distance de stop, instrument → taille de position. Utilise la valeur de
// 1R définie dans le Profil pour rester cohérent avec les statistiques en R
// affichées ailleurs dans l'application.
import { useMemo, useState } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { computePositionSize, computeREquivalent } from '../../utils/calculations';

// Valeurs de point usuelles pour quelques instruments courants (démo).
// L'utilisateur peut toujours choisir "Personnalisé" et saisir sa propre valeur.
const INSTRUMENT_PRESETS = [
  { symbol: 'NQ1!', label: 'NQ1! (Nasdaq futures)', pointValue: 5 },
  { symbol: 'MNQ1!', label: 'MNQ1! (Micro Nasdaq)', pointValue: 0.5 },
  { symbol: 'ES1!', label: 'ES1! (S&P 500 futures)', pointValue: 12.5 },
  { symbol: 'MES1!', label: 'MES1! (Micro S&P 500)', pointValue: 1.25 },
  { symbol: 'custom', label: 'Personnalisé', pointValue: null },
];

export default function RiskCalculator() {
  const { settings } = useSettings();

  const [mode, setMode] = useState('percent'); // 'percent' | 'rvalue'
  const [capital, setCapital] = useState(50000);
  const [riskPercent, setRiskPercent] = useState(settings.defaultRiskPercent || 1);
  const [instrument, setInstrument] = useState('NQ1!');
  const [pointValue, setPointValue] = useState(5);
  const [stopDistance, setStopDistance] = useState(20);

  const parsedCapital = Number(capital) || 0;
  const parsedRiskPercent = Number(riskPercent) || 0;
  const parsedStopDistance = Number(stopDistance) || 0;
  const parsedPointValue = Number(pointValue) || 0;

  // Le risque cible dépend du mode choisi : soit un pourcentage du capital,
  // soit directement la valeur de 1R définie dans le Profil (un trade = 1R de risque).
  const targetRisk = mode === 'percent' ? (parsedCapital * parsedRiskPercent) / 100 : settings.rValueDollars || 0;

  const { positionSize } = useMemo(
    () =>
      computePositionSize({
        capital: parsedCapital,
        riskPercent: mode === 'percent' ? parsedRiskPercent : (targetRisk / (parsedCapital || 1)) * 100,
        stopDistance: parsedStopDistance,
        pointValue: parsedPointValue,
      }),
    [parsedCapital, parsedRiskPercent, mode, targetRisk, parsedStopDistance, parsedPointValue]
  );

  const hasValidInputs = parsedStopDistance > 0 && parsedPointValue > 0 && targetRisk > 0;
  const contractsFloor = hasValidInputs ? Math.floor(positionSize) : 0;
  const actualRiskWithFloor = contractsFloor * parsedStopDistance * parsedPointValue;
  const rEquivalent = computeREquivalent(targetRisk, settings.rValueDollars);

  function handleInstrumentChange(symbol) {
    setInstrument(symbol);
    const preset = INSTRUMENT_PRESETS.find((p) => p.symbol === symbol);
    if (preset && preset.pointValue !== null) {
      setPointValue(preset.pointValue);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-1 bg-bg border border-card-border rounded-card p-1 self-start">
        {[
          { key: 'percent', label: '% du capital' },
          { key: 'rvalue', label: `Valeur de R (${settings.rValueDollars} $)` },
        ].map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setMode(opt.key)}
            className={`px-3 py-1.5 rounded-card text-xs font-mono transition-colors ${
              mode === opt.key ? 'bg-accent/10 text-accent border border-accent/20' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
          Capital ($)
          <input
            type="number"
            min="0"
            value={capital}
            onChange={(e) => setCapital(e.target.value)}
            className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary"
          />
        </label>

        {mode === 'percent' ? (
          <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
            Risque (%)
            <input
              type="number"
              min="0"
              step="0.1"
              value={riskPercent}
              onChange={(e) => setRiskPercent(e.target.value)}
              className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary"
            />
          </label>
        ) : (
          <div className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
            Risque cible ($)
            <div className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary">
              {settings.rValueDollars} $ <span className="text-text-secondary">(= 1R, réglable dans Profil)</span>
            </div>
          </div>
        )}

        <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
          Instrument
          <select
            value={instrument}
            onChange={(e) => handleInstrumentChange(e.target.value)}
            className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary"
          >
            {INSTRUMENT_PRESETS.map((p) => (
              <option key={p.symbol} value={p.symbol}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
          Valeur du point ($)
          <input
            type="number"
            min="0"
            step="0.01"
            value={pointValue}
            onChange={(e) => {
              setInstrument('custom');
              setPointValue(e.target.value);
            }}
            className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary col-span-2">
          Distance du stop (points)
          <input
            type="number"
            min="0"
            step="0.25"
            value={stopDistance}
            onChange={(e) => setStopDistance(e.target.value)}
            className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary"
          />
        </label>
      </div>

      {!hasValidInputs ? (
        <p className="text-sm text-danger">
          Renseignez une distance de stop et une valeur de point supérieures à zéro pour calculer une taille de
          position.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-bg border border-card-border rounded-card p-3">
            <p className="text-[11px] uppercase tracking-wide text-text-secondary font-mono">Risque cible</p>
            <p className="font-mono text-lg text-danger">{targetRisk.toFixed(2)} $</p>
            <p className="text-[11px] text-text-secondary font-mono mt-0.5">≈ {rEquivalent.toFixed(2)} R</p>
          </div>
          <div className="bg-bg border border-card-border rounded-card p-3">
            <p className="text-[11px] uppercase tracking-wide text-text-secondary font-mono">Taille théorique</p>
            <p className="font-mono text-lg text-text-primary">{positionSize.toFixed(2)} contrats</p>
          </div>
          <div className="bg-bg border border-accent/20 border-white/30 rounded-card p-3 col-span-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-wide text-text-secondary font-mono">
                Taille arrondie (entier) recommandée
              </p>
              <p className="font-mono text-xl text-accent">{contractsFloor} contrat{contractsFloor > 1 ? 's' : ''}</p>
            </div>
            <p className="text-[11px] text-text-secondary font-mono mt-1">
              Risque réel avec cette taille : {actualRiskWithFloor.toFixed(2)} $
              {contractsFloor === 0 && ' — taille théorique inférieure à 1 contrat, réduisez le risque ou la distance de stop.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
