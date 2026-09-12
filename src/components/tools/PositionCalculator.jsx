// Calculateur de position façon Myfxbook : taille de lot en forex (choix de
// la paire parmi toutes les paires majeures / mineures / exotiques, filtrées
// par une saisie libre) et taille de position en futures (contrats).
// Le risque cible suit les réglages du profil (mode "% du capital" ou
// "valeur de R"). Les taux sont des estimations statiques modifiables.
import { useMemo, useState } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { computeREquivalent } from '../../utils/calculations';
import { ALL_PAIRS } from '../../constants/symbols';

// Approximations statiques de taux (1 unité = X USD), servant aux calculs
// de valeur de pip et de remplissage du taux d'une paire. Modifiables par
// l'utilisateur (et recalées par une source de marché dans une v2).
const USD_PER_UNIT = {
  USD: 1, EUR: 1.11, GBP: 1.27, CHF: 1.16, JPY: 0.00655,
  CAD: 0.73, AUD: 0.65, NZD: 0.6, CNH: 0.14, HKD: 0.128,
  SGD: 0.74, SEK: 0.095, NOK: 0.093, DKK: 0.149, MXN: 0.052,
  TRY: 0.029, ZAR: 0.057, INR: 0.0118, BRL: 0.17, PLN: 0.25,
  CZK: 0.043, HUF: 0.00273, KRW: 0.00073, THB: 0.0273, ILS: 0.27,
};

const ACCOUNT_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD'];

function defaultRate(pair) {
  const base = pair.slice(0, 3);
  const quote = pair.slice(3);
  const b = USD_PER_UNIT[base] || 1;
  const q = USD_PER_UNIT[quote] || 1;
  return q > 0 ? b / q : 1;
}

function fmt(n, digits = 2) {
  return Number.isFinite(n) ? n.toFixed(digits) : '0.00';
}

// Sélecteur de paire : saisie libre qui filtre la liste complète.
function PairSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_PAIRS;
    return ALL_PAIRS.filter((p) => p.toLowerCase().includes(q));
  }, [query]);

  function selectPair(pair) {
    onChange(pair);
    setOpen(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (e.key === 'Enter' && open && filtered.length) {
      e.preventDefault();
      selectPair(filtered[0]);
    }
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={open ? query : value}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setQuery('');
          setOpen(true);
        }}
        onBlur={() => setOpen(false)}
        onKeyDown={handleKeyDown}
        placeholder="Rechercher une paire… (ex : EUR, USDJPY, TRY)"
        className="w-full bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-accent/60"
      />
      {open && (
        <ul className="absolute z-30 mt-1 w-full max-h-56 overflow-auto bg-card border border-card-border rounded-card shadow-xl text-sm">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-text-secondary/70 font-mono">Aucune paire trouvée.</li>
          ) : (
            filtered.map((pair) => (
              <li key={pair}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectPair(pair)}
                  className={`w-full text-left px-3 py-1.5 font-mono flex items-center justify-between transition-colors ${
                    pair === value ? 'bg-accent/10 text-accent' : 'text-text-primary hover:bg-accent/5'
                  }`}
                >
                  <span>{pair}</span>
                  <span className="text-[10px] text-text-secondary/70">{defaultRate(pair).toFixed(4)}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

// Petits champs numériques partagés entre les onglets.
function NumField({ label, value, onChange, min = 0, step = 'any', suffix }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
      {label}
      <div className="flex items-stretch">
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary w-full focus:outline-none focus:border-accent/60"
        />
        {suffix && (
          <span className="flex items-center px-2 -ml-px border border-l-0 border-card-border rounded-r-card bg-bg text-text-secondary text-xs">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

export default function PositionCalculator() {
  const { settings } = useSettings();

  const [tab, setTab] = useState('forex'); // 'forex' | 'futures'
  const [mode, setMode] = useState('percent'); // 'percent' | 'rvalue'
  const [capital, setCapital] = useState(50000);
  const [riskPercent, setRiskPercent] = useState(settings.defaultRiskPercent || 1);
  const [account, setAccount] = useState('USD');
  const [pair, setPair] = useState('EURUSD');
  const [rate, setRate] = useState(() => defaultRate('EURUSD'));
  const [stopPips, setStopPips] = useState(50);
  const [instrument, setInstrument] = useState('NQ1!');
  const [pointValue, setPointValue] = useState(5);
  const [stopPoints, setStopPoints] = useState(20);

  const parsedCapital = Number(capital) || 0;
  const parsedRiskPercent = Number(riskPercent) || 0;
  const parsedPips = Number(stopPips) || 0;
  const parsedPoints = Number(stopPoints) || 0;
  const parsedPointValue = Number(pointValue) || 0;
  const parsedRate = Number(rate) || 0;

  const targetRisk =
    mode === 'percent' ? (parsedCapital * parsedRiskPercent) / 100 : settings.rValueDollars || 0;
  const rEquivalent = computeREquivalent(targetRisk, settings.rValueDollars);

  // --- Calculs forex ------------------------------------------------------
  const base = tab === 'forex' ? pair.slice(0, 3) : '';
  const quote = tab === 'forex' ? pair.slice(3) : '';
  const pipSize = quote === 'JPY' ? 0.01 : 0.0001;
  const pipValueInQuote = pipSize * 100000; // valeur d'un pip par lot, en devise de cotation

  let pipValueAccount = 0;
  if (tab === 'forex' && parsedPips > 0) {
    if (quote === account) {
      pipValueAccount = pipValueInQuote;
    } else if (base === account) {
      pipValueAccount = parsedRate > 0 ? pipValueInQuote / parsedRate : 0;
    } else {
      const qUsd = USD_PER_UNIT[quote] || 1;
      const aUsd = USD_PER_UNIT[account] || 1;
      pipValueAccount = (pipValueInQuote * qUsd) / aUsd;
    }
  }
  const lots = pipValueAccount > 0 ? targetRisk / (parsedPips * pipValueAccount) : 0;
  const lotsRounded = Math.floor(lots * 100) / 100;
  const forexValid = parsedPips > 0 && parsedRate > 0 && targetRisk > 0;

  // --- Calculs futures -----------------------------------------------------
  const contracts = parsedPoints > 0 && parsedPointValue > 0 ? targetRisk / (parsedPoints * parsedPointValue) : 0;
  const contractsFloor = Math.floor(contracts);
  const futuresValid = parsedPoints > 0 && parsedPointValue > 0 && targetRisk > 0;

  function selectPair(nextPair) {
    setPair(nextPair);
    setRate(defaultRate(nextPair));
  }

  function selectInstrument(symbol) {
    setInstrument(symbol);
    const preset = FUTURE_PRESETS.find((p) => p.symbol === symbol);
    if (preset && preset.pointValue !== null) setPointValue(preset.pointValue);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Onglets + mode de risque */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 bg-bg border border-card-border rounded-card p-1">
          {[
            { key: 'forex', label: 'Forex' },
            { key: 'futures', label: 'Futures' },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setTab(opt.key)}
              className={`px-3 py-1.5 rounded-card text-xs font-mono transition-colors ${
                tab === opt.key ? 'bg-accent/10 text-accent border border-accent/20' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-bg border border-card-border rounded-card p-1">
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
      </div>

      {tab === 'forex' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
              Paire de devises
              <PairSelector value={pair} onChange={selectPair} />
              <span className="text-[10px] text-text-secondary/70 font-mono">
                {ALL_PAIRS.length} paires possibles — tapez pour filtrer.
              </span>
            </label>

            <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
              Devise du compte
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-accent/60"
              >
                {ACCOUNT_CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>

            <NumField label="Capital ($)" value={capital} onChange={setCapital} />
            {mode === 'percent' ? (
              <NumField label="Risque (%)" value={riskPercent} onChange={setRiskPercent} step="0.1" suffix="%" />
            ) : (
              <div className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
                Risque cible ($)
                <div className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary">
                  {settings.rValueDollars} $ <span className="text-text-secondary">(= 1R, réglable dans Profil)</span>
                </div>
              </div>
            )}

            <NumField label="Taux de change (base / cotation)" value={rate} onChange={setRate} min={0} />
            <NumField label="Stop loss (pips)" value={stopPips} onChange={setStopPips} suffix="pips" />
          </div>

          {!forexValid ? (
            <p className="text-sm text-danger">
              Renseignez un stop, un taux de change et un risque supérieurs à zéro pour calculer la taille de position.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-bg border border-card-border rounded-card p-3">
                <p className="text-[11px] uppercase tracking-wide text-text-secondary font-mono">Valeur du pip</p>
                <p className="font-mono text-lg text-text-primary">{fmt(pipValueAccount)} {account}/lot</p>
                <p className="text-[11px] text-text-secondary font-mono mt-0.5">par pip de {pair}</p>
              </div>
              <div className="bg-bg border border-card-border rounded-card p-3">
                <p className="text-[11px] uppercase tracking-wide text-text-secondary font-mono">Risque cible</p>
                <p className="font-mono text-lg text-danger">{fmt(targetRisk)} $</p>
                <p className="text-[11px] text-text-secondary font-mono mt-0.5">≈ {fmt(rEquivalent)} R</p>
              </div>
              <div className="bg-bg border border-card-border rounded-card p-3 col-span-2 sm:col-span-1">
                <p className="text-[11px] uppercase tracking-wide text-text-secondary font-mono">Taille exacte</p>
                <p className="font-mono text-lg text-text-primary">{fmt(lots)} lots</p>
              </div>
              <div className="bg-bg border border-accent/30 rounded-card p-3 col-span-2 sm:col-span-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] uppercase tracking-wide text-text-secondary font-mono">
                    Taille de position recommandée
                  </p>
                  <p className="font-mono text-2xl text-accent">{fmt(lotsRounded, 2)} lots</p>
                </div>
                <p className="text-[11px] text-text-secondary font-mono mt-1">
                  Risque réel avec cette taille : {fmt(lotsRounded * parsedPips * pipValueAccount)} {account}
                  {lotsRounded < 0.01 && ' — taille inférieure au lot minimum (0.01), réduisez le risque ou le stop.'}
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NumField label="Capital ($)" value={capital} onChange={setCapital} />
            {mode === 'percent' ? (
              <NumField label="Risque (%)" value={riskPercent} onChange={setRiskPercent} step="0.1" suffix="%" />
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
                onChange={(e) => selectInstrument(e.target.value)}
                className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-accent/60"
              >
                {FUTURE_PRESETS.map((p) => (
                  <option key={p.symbol} value={p.symbol}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>

            <NumField
              label="Valeur du point ($)"
              value={pointValue}
              onChange={(v) => {
                setInstrument('custom');
                setPointValue(v);
              }}
              step="0.01"
            />
            <NumField label="Distance du stop (points)" value={stopPoints} onChange={setStopPoints} step="0.25" />
          </div>

          {!futuresValid ? (
            <p className="text-sm text-danger">
              Renseignez une distance de stop et une valeur de point supérieures à zéro pour calculer une taille de
              position.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-bg border border-card-border rounded-card p-3">
                <p className="text-[11px] uppercase tracking-wide text-text-secondary font-mono">Risque cible</p>
                <p className="font-mono text-lg text-danger">{fmt(targetRisk)} $</p>
                <p className="text-[11px] text-text-secondary font-mono mt-0.5">≈ {fmt(rEquivalent)} R</p>
              </div>
              <div className="bg-bg border border-card-border rounded-card p-3">
                <p className="text-[11px] uppercase tracking-wide text-text-secondary font-mono">Taille exacte</p>
                <p className="font-mono text-lg text-text-primary">{fmt(contracts)} contrats</p>
              </div>
              <div className="bg-bg border border-accent/30 rounded-card p-3 col-span-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-wide text-text-secondary font-mono">Taille arrondie recommandée</p>
                  <p className="font-mono text-2xl text-accent">{contractsFloor} contrat{contractsFloor > 1 ? 's' : ''}</p>
                </div>
                <p className="text-[11px] text-text-secondary font-mono mt-1">
                  Risque réel : {fmt(contractsFloor * parsedPoints * parsedPointValue)} $
                  {contractsFloor === 0 && ' — taille théorique inférieure à 1 contrat, réduisez le risque ou le stop.'}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const FUTURE_PRESETS = [
  { symbol: 'NQ1!', label: 'NQ1! (Nasdaq futures)', pointValue: 5 },
  { symbol: 'MNQ1!', label: 'MNQ1! (Micro Nasdaq)', pointValue: 0.5 },
  { symbol: 'ES1!', label: 'ES1! (S&P 500 futures)', pointValue: 12.5 },
  { symbol: 'MES1!', label: 'MES1! (Micro S&P 500)', pointValue: 1.25 },
  { symbol: 'GC1!', label: 'GC1! (Or futures)', pointValue: 10 },
  { symbol: 'CL1!', label: 'CL1! (Pétrole WTI futures)', pointValue: 10 },
  { symbol: 'YM1!', label: 'YM1! (Dow futures)', pointValue: 5 },
  { symbol: 'MYM1!', label: 'MYM1! (Micro Dow)', pointValue: 0.5 },
  { symbol: 'custom', label: 'Personnalisé', pointValue: null },
];