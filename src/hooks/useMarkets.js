// Hook de données des marchés, exposé à l'application. Il délègue désormais au
// contexte global MarketsContext (une seule instance partagée) au lieu de lancer
// un fetch par composant. L'API retournée est identique à l'ancienne version
// ({ markets, isLoading, error, reload, addMarket, removeMarket }) pour ne rien
// casser côté consommateurs.
export { useMarkets } from '../context/MarketsContext';