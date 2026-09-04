// Parseur CSV minimal pour l'import de trades dans /track-record.
// Format attendu (en-tête obligatoire) :
// date,symbole,strategies,direction,prixEntree,prixSortie,quantite,r,pnl
// La colonne "strategies" accepte une ou plusieurs valeurs séparées par ";"
// (ex: "fondamentale;price-action"), car les deux approches sont souvent
// combinées sur un même trade plutôt que d'être exclusives.

const EXPECTED_HEADERS = [
  'date',
  'symbole',
  'strategies',
  'direction',
  'prixEntree',
  'prixSortie',
  'quantite',
  'r',
  'pnl',
];

/**
 * Parse une chaîne CSV brute en tableau d'objets trade.
 * Lance une erreur descriptive si l'en-tête ne correspond pas au format attendu.
 * @param {string} csvText
 * @returns {Array<object>}
 */
export function parseTradesCsv(csvText) {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    throw new Error('Le fichier CSV est vide ou ne contient aucune ligne de données.');
  }

  const headers = lines[0].split(',').map((h) => h.trim());
  const missing = EXPECTED_HEADERS.filter((h) => !headers.includes(h));
  if (missing.length > 0) {
    throw new Error(
      `Colonnes manquantes dans le CSV : ${missing.join(', ')}. Colonnes attendues : ${EXPECTED_HEADERS.join(', ')}.`
    );
  }

  const rows = lines.slice(1).map((line, index) => {
    const values = line.split(',').map((v) => v.trim());
    const row = {};
    headers.forEach((h, i) => {
      row[h] = values[i];
    });

    return {
      id: `csv-${Date.now()}-${index}`,
      date: row.date,
      symbol: row.symbole,
      strategies: (row.strategies || '')
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean),
      direction: row.direction,
      entryPrice: Number(row.prixEntree),
      exitPrice: Number(row.prixSortie),
      quantity: Number(row.quantite),
      r: Number(row.r),
      pnl: Number(row.pnl),
    };
  });

  return rows;
}

// Génère un export CSV à partir d'un tableau de trades (utilisé pour le bouton d'export, si besoin).
export function tradesToCsv(trades) {
  const header = EXPECTED_HEADERS.join(',');
  const lines = trades.map((t) =>
    [
      t.date,
      t.symbol,
      (t.strategies || []).join(';'),
      t.direction,
      t.entryPrice,
      t.exitPrice,
      t.quantity,
      t.r,
      t.pnl,
    ].join(',')
  );
  return [header, ...lines].join('\n');
}
