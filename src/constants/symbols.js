// Catalogue central des symboles proposés dans le formulaire de trade et la
// page Outils : toutes les paires de devises possibles (générées), les
// futures, indices, indices synthétiques (Deriv), matières premières,
// crypto, actions et ETF. Chaque entrée peut porter un nom et des mots-clés
// pour améliorer la recherche par saisie.

export const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD', 'CNH', 'HKD',
  'SGD', 'SEK', 'NOK', 'DKK', 'MXN', 'TRY', 'ZAR', 'INR', 'BRL', 'PLN',
  'CZK', 'HUF', 'KRW', 'THB', 'ILS',
];

// Toutes les paires possibles (base ≠ devise), les paires incluant USD d'abord.
function buildAllPairs() {
  const pairs = [];
  for (const base of CURRENCIES) {
    for (const quote of CURRENCIES) {
      if (base === quote) continue;
      pairs.push(base + quote);
    }
  }
  return pairs.sort((a, b) => {
    const aUsd = a.includes('USD') ? 0 : 1;
    const bUsd = b.includes('USD') ? 0 : 1;
    return aUsd - bUsd || a.localeCompare(b);
  });
}

export const ALL_PAIRS = buildAllPairs();

function item(value, name = '', keywords = '') {
  return { value, name, keywords };
}

function group(key, label, items) {
  return { key, label, items };
}

export const SYMBOL_GROUPS = [
  group(
    'forex',
    'Paires de devises',
    ALL_PAIRS.map((value) => item(value))
  ),

  group('futures', 'Futures', [
    item('NQ1!', 'Nasdaq 100 E-mini'),
    item('MNQ1!', 'Micro Nasdaq 100'),
    item('ES1!', 'S&P 500 E-mini'),
    item('MES1!', 'Micro S&P 500'),
    item('YM1!', 'Dow Jones E-mini'),
    item('MYM1!', 'Micro Dow Jones'),
    item('RTY1!', 'Russell 2000 E-mini'),
    item('NKD1!', 'Nikkei 225 (CME)'),
    item('CL1!', 'Pétrole WTI futures'),
    item('GC1!', 'Or futures'),
    item('SI1!', 'Argent futures'),
    item('HG1!', 'Cuivre futures'),
  ]),

  group('indices', 'Indices', [
    item('NAS100', 'Nasdaq 100'),
    item('US30', 'Dow Jones 30'),
    item('US500', 'S&P 500'),
    item('SPX500', 'S&P 500'),
    item('GER40', 'DAX 40 Allemagne'),
    item('DE40', 'DAX 40'),
    item('DAX', 'DAX 40'),
    item('UK100', 'FTSE 100 Royaume-Uni'),
    item('FTSE100', 'FTSE 100'),
    item('FRA40', 'CAC 40 France'),
    item('CAC40', 'CAC 40'),
    item('JPN225', 'Nikkei 225 Japon'),
    item('NIKKEI225', 'Nikkei 225'),
    item('HK50', 'Hang Seng 50 Hong Kong'),
    item('AUS200', 'ASX 200 Australie'),
    item('VIX', 'CBOE Volatility'),
  ]),

  group('synthetiques', 'Indices synthétiques', [
    item('Volatility 10 Index', 'Indice de volatilité 10', 'volatility volatile'),
    item('Volatility 10 (1s) Index', 'Indice de volatilité 10 (1 seconde)', 'volatility volatile 1s'),
    item('Volatility 25 Index', 'Indice de volatilité 25', 'volatility volatile'),
    item('Volatility 25 (1s) Index', 'Indice de volatilité 25 (1 seconde)', 'volatility volatile 1s'),
    item('Volatility 50 Index', 'Indice de volatilité 50', 'volatility volatile'),
    item('Volatility 50 (1s) Index', 'Indice de volatilité 50 (1 seconde)', 'volatility volatile 1s'),
    item('Volatility 75 Index', 'Indice de volatilité 75', 'volatility volatile'),
    item('Volatility 75 (1s) Index', 'Indice de volatilité 75 (1 seconde)', 'volatility volatile 1s'),
    item('Volatility 100 Index', 'Indice de volatilité 100', 'volatility volatile'),
    item('Volatility 100 (1s) Index', 'Indice de volatilité 100 (1 seconde)', 'volatility volatile 1s'),
    item('Boom 300 Index', 'Indice Boom 300', 'boom'),
    item('Boom 500 Index', 'Indice Boom 500', 'boom'),
    item('Boom 1000 Index', 'Indice Boom 1000', 'boom'),
    item('Crash 300 Index', 'Indice Crash 300', 'crash'),
    item('Crash 500 Index', 'Indice Crash 500', 'crash'),
    item('Crash 1000 Index', 'Indice Crash 1000', 'crash'),
    item('Step Index', 'Indice Step', 'step'),
    item('Jump 10 Index', 'Indice Jump 10', 'jump'),
    item('Jump 25 Index', 'Indice Jump 25', 'jump'),
    item('Jump 50 Index', 'Indice Jump 50', 'jump'),
    item('Jump 75 Index', 'Indice Jump 75', 'jump'),
    item('Jump 100 Index', 'Indice Jump 100', 'jump'),
  ]),

  group('matieres', 'Matières premières', [
    item('XAUUSD', 'Or spot'),
    item('GOLD', 'Or'),
    item('XAGUSD', 'Argent spot'),
    item('SILVER', 'Argent'),
    item('XPTUSD', 'Platine'),
    item('PLATINUM', 'Platine'),
    item('XPDUSD', 'Palladium'),
    item('PALLADIUM', 'Palladium'),
    item('USOIL', 'Pétrole brut WTI'),
    item('WTI', 'Pétrole brut WTI'),
    item('UKOIL', 'Pétrole Brent'),
    item('BRENT', 'Pétrole Brent'),
    item('NATGAS', 'Gaz naturel'),
    item('COPPER', 'Cuivre'),
    item('CORN', 'Maïs'),
    item('WHEAT', 'Blé'),
    item('SOYBEAN', 'Soja'),
    item('COFFEE', 'Café'),
    item('COCOA', 'Cacao'),
    item('SUGAR', 'Sucre'),
    item('COTTON', 'Coton'),
  ]),

  group('crypto', 'Crypto', [
    item('BTCUSD', 'Bitcoin'),
    item('ETHUSD', 'Ethereum'),
    item('BNBUSD', 'BNB'),
    item('XRPUSD', 'Ripple / XRP'),
    item('SOLUSD', 'Solana'),
    item('ADAUSD', 'Cardano'),
    item('DOGEUSD', 'Dogecoin'),
    item('AVAXUSD', 'Avalanche'),
    item('DOTUSD', 'Polkadot'),
    item('LINKUSD', 'Chainlink'),
    item('LTCUSD', 'Litecoin'),
    item('BCHUSD', 'Bitcoin Cash'),
    item('MATICUSD', 'Polygon'),
    item('ATOMUSD', 'Cosmos'),
    item('UNIUSD', 'Uniswap'),
  ]),

  group('actionsUs', 'Actions US', [
    item('AAPL', 'Apple'),
    item('MSFT', 'Microsoft'),
    item('GOOGL', 'Alphabet (Google)'),
    item('AMZN', 'Amazon'),
    item('META', 'Meta Platforms'),
    item('NVDA', 'NVIDIA'),
    item('TSLA', 'Tesla'),
    item('NFLX', 'Netflix'),
    item('AMD', 'Advanced Micro Devices'),
    item('INTC', 'Intel'),
    item('ORCL', 'Oracle'),
    item('IBM', 'IBM'),
    item('ADBE', 'Adobe'),
    item('CRM', 'Salesforce'),
    item('CSCO', 'Cisco'),
    item('QCOM', 'Qualcomm'),
    item('AVGO', 'Broadcom'),
    item('PYPL', 'PayPal'),
    item('UBER', 'Uber'),
    item('COIN', 'Coinbase'),
    item('PLTR', 'Palantir'),
    item('BA', 'Boeing'),
    item('JPM', 'JPMorgan Chase'),
    item('BAC', 'Bank of America'),
    item('GS', 'Goldman Sachs'),
    item('V', 'Visa'),
    item('MA', 'Mastercard'),
    item('WMT', 'Walmart'),
    item('COST', 'Costco'),
    item('KO', "Coca-Cola"),
    item('PEP', 'PepsiCo'),
    item('MCD', "McDonald's"),
    item('DIS', 'Disney'),
    item('NKE', 'Nike'),
    item('XOM', 'Exxon Mobil'),
    item('CVX', 'Chevron'),
  ]),

  group('actionsEu', 'Actions Europe', [
    item('ASML', 'ASML Holding'),
    item('SAP', 'SAP SE'),
    item('LVMH', 'LVMH'),
    item('MC', 'LVMH (Euronext)'),
    item('OR', "L'Oréal"),
    item('AIR', 'Airbus'),
    item('TTE', 'TotalEnergies'),
    item('BNP', 'BNP Paribas'),
    item('SIE', 'Siemens'),
    item('BMW', 'BMW'),
    item('VOW3', 'Volkswagen'),
    item('ADS', 'Adidas'),
    item('DTE', 'Deutsche Telekom'),
  ]),

  group('etf', 'ETF', [
    item('SPY', 'SPDR S&P 500'),
    item('QQQ', 'Invesco Nasdaq 100'),
    item('IWM', 'iShares Russell 2000'),
    item('DIA', 'SPDR Dow Jones'),
    item('VOO', 'Vanguard S&P 500'),
    item('VTI', 'Vanguard Total Market'),
    item('GLD', 'SPDR Gold'),
    item('SLV', 'iShares Silver'),
    item('USO', 'United States Oil'),
    item('TLT', 'iShares 20+ Year Treasury'),
  ]),
];

// Liste plate (pour un tri/affichage simple) et moteur de recherche.
export const ALL_SYMBOLS = SYMBOL_GROUPS.flatMap((g) =>
  g.items.map((entry) => ({ ...entry, categoryKey: g.key, categoryLabel: g.label }))
);

export function searchSymbols(query) {
  const q = query.trim().toLowerCase();
  if (!q) return SYMBOL_GROUPS;
  return SYMBOL_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((entry) =>
      `${entry.value} ${entry.name} ${entry.keywords}`.toLowerCase().includes(q)
    ),
  })).filter((g) => g.items.length > 0);
}