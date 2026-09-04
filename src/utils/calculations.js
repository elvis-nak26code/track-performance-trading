// Fonctions de calcul statistique utilisées par le tableau de bord et la page
// analytics. Chaque fonction documente la formule qu'elle applique.

/**
 * Taux de réussite (win rate).
 * Formule : (nombre de trades gagnants / nombre total de trades) * 100
 * @param {Array} trades
 * @returns {number} pourcentage entre 0 et 100
 */
export function computeWinRate(trades) {
  if (!trades.length) return 0;
  const wins = trades.filter((t) => t.pnl > 0).length;
  return (wins / trades.length) * 100;
}

/**
 * P&L total.
 * Formule : somme du P&L de chaque trade.
 * @param {Array} trades
 * @returns {number}
 */
export function computeTotalPnl(trades) {
  return trades.reduce((sum, t) => sum + t.pnl, 0);
}

/**
 * Profit factor.
 * Formule : somme des gains bruts / valeur absolue de la somme des pertes brutes.
 * Un profit factor > 1 signifie que la stratégie est globalement profitable.
 * @param {Array} trades
 * @returns {number}
 */
export function computeProfitFactor(trades) {
  const grossProfit = trades.filter((t) => t.pnl > 0).reduce((s, t) => s + t.pnl, 0);
  const grossLoss = Math.abs(trades.filter((t) => t.pnl < 0).reduce((s, t) => s + t.pnl, 0));
  if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0;
  return grossProfit / grossLoss;
}

/**
 * R moyen (moyenne du multiple de risque R sur l'ensemble des trades).
 * Formule : somme des R / nombre de trades.
 * @param {Array} trades
 * @returns {number}
 */
export function computeAverageR(trades) {
  if (!trades.length) return 0;
  return trades.reduce((sum, t) => sum + t.r, 0) / trades.length;
}

/**
 * Construit les points de la courbe d'équité (cumul du P&L trade après trade),
 * en supposant que les trades sont triés par date croissante.
 * Formule : équité[i] = équité[i-1] + pnl[i], équité[0] = pnl[0]
 * @param {Array} trades triés par date croissante
 * @returns {Array<{date: string, equity: number}>}
 */
export function computeEquityCurve(trades) {
  let running = 0;
  return trades.map((t) => {
    running += t.pnl;
    return { date: t.date, equity: Math.round(running * 100) / 100 };
  });
}

/**
 * Courbe de drawdown : écart entre l'équité courante et le plus haut niveau
 * d'équité atteint jusqu'ici (le "high water mark").
 * Formule : drawdown[i] = équité[i] - max(équité[0..i])
 * @param {Array<{date: string, equity: number}>} equityCurve
 * @returns {Array<{date: string, drawdown: number}>}
 */
export function computeDrawdownCurve(equityCurve) {
  let peak = -Infinity;
  return equityCurve.map((point) => {
    peak = Math.max(peak, point.equity);
    return { date: point.date, drawdown: Math.round((point.equity - peak) * 100) / 100 };
  });
}

/**
 * Win rate glissant (moyenne mobile) sur une fenêtre de N trades.
 * Formule : pour chaque trade i >= windowSize - 1,
 * winRate[i] = (gagnants parmi les windowSize derniers trades / windowSize) * 100
 * @param {Array} trades triés par date croissante
 * @param {number} windowSize ex. 10 ou 20
 * @returns {Array<{date: string, winRate: number}>}
 */
export function computeRollingWinRate(trades, windowSize) {
  const result = [];
  for (let i = 0; i < trades.length; i++) {
    if (i < windowSize - 1) continue;
    const windowTrades = trades.slice(i - windowSize + 1, i + 1);
    const wins = windowTrades.filter((t) => t.pnl > 0).length;
    result.push({
      date: trades[i].date,
      winRate: Math.round((wins / windowSize) * 1000) / 10,
    });
  }
  return result;
}

/**
 * Distribution des R : regroupe les trades par tranche de R (ex: -2 à -1, -1 à 0, 0 à 1, etc.)
 * @param {Array} trades
 * @returns {Array<{bucket: string, count: number}>}
 */
export function computeRDistribution(trades) {
  const buckets = [
    { label: '< -2R', min: -Infinity, max: -2 },
    { label: '-2R à -1R', min: -2, max: -1 },
    { label: '-1R à 0R', min: -1, max: 0 },
    { label: '0R à 1R', min: 0, max: 1 },
    { label: '1R à 3R', min: 1, max: 3 },
    { label: '3R à 5R', min: 3, max: 5 },
    { label: '> 5R', min: 5, max: Infinity },
  ];
  return buckets.map((b) => ({
    bucket: b.label,
    count: trades.filter((t) => t.r > b.min && t.r <= b.max).length,
  }));
}

/**
 * R total réalisé (somme brute des multiples R, pas une moyenne).
 * Formule : somme des R de chaque trade.
 * @param {Array} trades
 * @returns {number}
 */
export function computeTotalR(trades) {
  return trades.reduce((sum, t) => sum + t.r, 0);
}

/**
 * Construit la courbe cumulative du R réalisé au fil des trades (équivalent
 * de la courbe d'équité mais exprimé en multiples de R plutôt qu'en dollars).
 * @param {Array} trades triés par date croissante
 * @returns {Array<{date: string, cumulativeR: number}>}
 */
export function computeCumulativeR(trades) {
  let running = 0;
  return trades.map((t) => {
    running += t.r;
    return { date: t.date, cumulativeR: Math.round(running * 100) / 100 };
  });
}

/**
 * Répartition des trades par approche (stratégie), en tenant compte du fait
 * qu'un trade peut combiner plusieurs approches à la fois (tableau
 * `strategies`). Un trade combinant les deux approches est donc compté dans
 * les deux groupes, plus un groupe dédié "Fondamentale + Price Action".
 * @param {Array} trades
 * @returns {Array<{key: string, trades: number, wins: number, losses: number, winRate: number, avgR: number, pnl: number}>}
 */
export function computeStrategyBreakdown(trades) {
  const groups = new Map();
  const addToGroup = (key, trade) => {
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(trade);
  };

  trades.forEach((t) => {
    const tags = t.strategies && t.strategies.length ? t.strategies : ['non-renseignee'];
    if (tags.length > 1) {
      addToGroup('Fondamentale + Price Action', t);
    } else {
      const label = tags[0] === 'fondamentale' ? 'Fondamentale' : tags[0] === 'price-action' ? 'Price Action' : 'Non renseignée';
      addToGroup(label, t);
    }
  });

  return Array.from(groups.entries()).map(([key, groupTrades]) => ({
    key,
    trades: groupTrades.length,
    wins: groupTrades.filter((t) => t.pnl > 0).length,
    losses: groupTrades.filter((t) => t.pnl <= 0).length,
    winRate: computeWinRate(groupTrades),
    avgR: computeAverageR(groupTrades),
    pnl: computeTotalPnl(groupTrades),
  }));
}

/**
 * Regroupe les trades par une clé (stratégie, direction, etc.) et calcule
 * les statistiques agrégées pour chaque groupe.
 * @param {Array} trades
 * @param {(trade: object) => string} keyFn
 * @returns {Array<{key: string, trades: number, wins: number, losses: number, winRate: number, avgR: number, pnl: number}>}
 */
export function groupTradesBy(trades, keyFn) {
  const groups = new Map();
  trades.forEach((t) => {
    const key = keyFn(t);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(t);
  });
  return Array.from(groups.entries()).map(([key, groupTrades]) => ({
    key,
    trades: groupTrades.length,
    wins: groupTrades.filter((t) => t.pnl > 0).length,
    losses: groupTrades.filter((t) => t.pnl <= 0).length,
    winRate: computeWinRate(groupTrades),
    avgR: computeAverageR(groupTrades),
    pnl: computeTotalPnl(groupTrades),
  }));
}

/**
 * Corrélation humeur / performance : win rate moyen par tag d'humeur, en
 * croisant les entrées de journal avec les trades qui leur sont liés.
 * @param {Array} journalEntries
 * @param {Array} trades
 * @returns {Array<{mood: string, winRate: number, count: number}>}
 */
export function computeMoodPerformance(journalEntries, trades) {
  const tradesById = new Map(trades.map((t) => [t.id, t]));
  const byMood = new Map();
  journalEntries.forEach((entry) => {
    const linkedTrades = (entry.linkedTradeIds || [])
      .map((id) => tradesById.get(id))
      .filter(Boolean);
    if (!linkedTrades.length) return;
    if (!byMood.has(entry.mood)) byMood.set(entry.mood, []);
    byMood.get(entry.mood).push(...linkedTrades);
  });
  return Array.from(byMood.entries()).map(([mood, moodTrades]) => ({
    mood,
    winRate: computeWinRate(moodTrades),
    count: moodTrades.length,
  }));
}

/**
 * Calculateur de taille de position à partir du risque.
 * Formule : taille = (capital * risquePct / 100) / (distanceStop * valeurPoint)
 * @param {object} params
 * @param {number} params.capital
 * @param {number} params.riskPercent
 * @param {number} params.stopDistance distance du stop en points/ticks de prix
 * @param {number} params.pointValue valeur monétaire d'un point pour l'instrument
 * @returns {{ riskAmount: number, positionSize: number }}
 */
export function computePositionSize({ capital, riskPercent, stopDistance, pointValue }) {
  const riskAmount = (capital * riskPercent) / 100;
  if (!stopDistance || !pointValue) return { riskAmount, positionSize: 0 };
  const positionSize = riskAmount / (stopDistance * pointValue);
  return { riskAmount, positionSize };
}

/**
 * Convertit un montant de risque en dollars en équivalent multiple de R,
 * à partir de la valeur de 1R définie par l'utilisateur (page Profil).
 * Formule : R équivalent = risque en $ / valeur de 1R en $
 * @param {number} riskAmount
 * @param {number} rValueDollars
 * @returns {number}
 */
export function computeREquivalent(riskAmount, rValueDollars) {
  if (!rValueDollars) return 0;
  return riskAmount / rValueDollars;
}
