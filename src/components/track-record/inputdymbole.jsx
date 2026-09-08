export default function Inputsymbol({ form, update }) {
  return (
    <>
      <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
        Symbole

        <input
          type="text"
          required
          list="trading-symbols"
          value={form.symbol}
          onChange={(e) => update({ symbol: e.target.value })}
          placeholder="Choisir ou saisir un symbole…"
          className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60"
        />
      </label>

      <datalist id="trading-symbols">
        <option value="EURUSD" />
        <option value="GBPUSD" />
        <option value="USDJPY" />
        <option value="USDCHF" />
        <option value="USDCAD" />
        <option value="AUDUSD" />
        <option value="NZDUSD" />

        <option value="EURGBP" />
        <option value="EURJPY" />
        <option value="EURCHF" />
        <option value="EURAUD" />
        <option value="EURCAD" />
        <option value="EURNZD" />

        <option value="GBPJPY" />
        <option value="GBPCHF" />
        <option value="GBPAUD" />
        <option value="GBPCAD" />
        <option value="GBPNZD" />

        <option value="AUDJPY" />
        <option value="AUDCAD" />
        <option value="AUDCHF" />
        <option value="AUDNZD" />

        <option value="CADJPY" />
        <option value="CADCHF" />
        <option value="CHFJPY" />
        <option value="NZDJPY" />

        {/* Indices */}
        <option value="NAS100" />
        <option value="US30" />
        <option value="US500" />
        <option value="SPX500" />
        <option value="GER40" />
        <option value="DE40" />
        <option value="DAX" />
        <option value="UK100" />
        <option value="FTSE100" />
        <option value="FRA40" />
        <option value="CAC40" />
        <option value="JPN225" />
        <option value="NIKKEI225" />
        <option value="HK50" />
        <option value="AUS200" />
        <option value="VIX" />

        {/* Indices synthétiques */}
        <option value="Volatility 10 Index" />
        <option value="Volatility 10 (1s) Index" />
        <option value="Volatility 25 Index" />
        <option value="Volatility 25 (1s) Index" />
        <option value="Volatility 50 Index" />
        <option value="Volatility 50 (1s) Index" />
        <option value="Volatility 75 Index" />
        <option value="Volatility 75 (1s) Index" />
        <option value="Volatility 100 Index" />
        <option value="Volatility 100 (1s) Index" />

        <option value="Boom 300 Index" />
        <option value="Boom 500 Index" />
        <option value="Boom 1000 Index" />
        <option value="Crash 300 Index" />
        <option value="Crash 500 Index" />
        <option value="Crash 1000 Index" />
        <option value="Step Index" />
        <option value="Jump 10 Index" />
        <option value="Jump 25 Index" />
        <option value="Jump 50 Index" />
        <option value="Jump 75 Index" />
        <option value="Jump 100 Index" />

        {/* Matières premières */}
        <option value="XAUUSD" />
        <option value="GOLD" />
        <option value="XAGUSD" />
        <option value="SILVER" />
        <option value="XPTUSD" />
        <option value="PLATINUM" />
        <option value="XPDUSD" />
        <option value="PALLADIUM" />
        <option value="USOIL" />
        <option value="WTI" />
        <option value="UKOIL" />
        <option value="BRENT" />
        <option value="NATGAS" />
        <option value="COPPER" />
        <option value="CORN" />
        <option value="WHEAT" />
        <option value="SOYBEAN" />
        <option value="COFFEE" />
        <option value="COCOA" />
        <option value="SUGAR" />
        <option value="COTTON" />

        {/* Crypto */}
        <option value="BTCUSD" />
        <option value="ETHUSD" />
        <option value="BNBUSD" />
        <option value="XRPUSD" />
        <option value="SOLUSD" />
        <option value="ADAUSD" />
        <option value="DOGEUSD" />
        <option value="AVAXUSD" />
        <option value="DOTUSD" />
        <option value="LINKUSD" />
        <option value="LTCUSD" />
        <option value="BCHUSD" />
        <option value="MATICUSD" />
        <option value="ATOMUSD" />
        <option value="UNIUSD" />

        {/* Actions US */}
        <option value="AAPL" />
        <option value="MSFT" />
        <option value="GOOGL" />
        <option value="AMZN" />
        <option value="META" />
        <option value="NVDA" />
        <option value="TSLA" />
        <option value="NFLX" />
        <option value="AMD" />
        <option value="INTC" />
        <option value="ORCL" />
        <option value="IBM" />
        <option value="ADBE" />
        <option value="CRM" />
        <option value="CSCO" />
        <option value="QCOM" />
        <option value="AVGO" />
        <option value="PYPL" />
        <option value="UBER" />
        <option value="COIN" />
        <option value="PLTR" />
        <option value="BA" />
        <option value="JPM" />
        <option value="BAC" />
        <option value="GS" />
        <option value="V" />
        <option value="MA" />
        <option value="WMT" />
        <option value="COST" />
        <option value="KO" />
        <option value="PEP" />
        <option value="MCD" />
        <option value="DIS" />
        <option value="NKE" />
        <option value="XOM" />
        <option value="CVX" />

        {/* Actions Europe */}
        <option value="ASML" />
        <option value="SAP" />
        <option value="LVMH" />
        <option value="AIR" />
        <option value="MC" />
        <option value="OR" />
        <option value="TTE" />
        <option value="BNP" />
        <option value="SIE" />
        <option value="BMW" />
        <option value="VOW3" />
        <option value="ADS" />
        <option value="DTE" />

        {/* ETF */}
        <option value="SPY" />
        <option value="QQQ" />
        <option value="IWM" />
        <option value="DIA" />
        <option value="VOO" />
        <option value="VTI" />
        <option value="GLD" />
        <option value="SLV" />
        <option value="USO" />
        <option value="TLT" />
      </datalist>
    </>
  );
}