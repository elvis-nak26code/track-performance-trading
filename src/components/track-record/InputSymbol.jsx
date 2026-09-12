import SearchableSymbolInput from '../common/SearchableSymbolInput';

export default function InputSymbol({ form, update }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
      Symbole
      <SearchableSymbolInput
        value={form.symbol}
        onChange={(symbol) => update({ symbol })}
        placeholder="Paires, actions, matières premières, indices…"
        required
      />
    </label>
  );
}