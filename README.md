# Journal de Trading — Frontend

Application frontend (React + Vite) de journal de trading et de track record,
avec données mockées en local. Aucun backend réel n'est requis.

## Démarrage

```bash
npm install
npm run dev
```

L'application démarre sur http://localhost:5173.

## Connexion

Un écran de connexion est activé par défaut (`VITE_AUTH_ENABLED=true`) :
- **E-mail / mot de passe** : les comptes sont simulés en `localStorage` (pas
  de vraie base de données) — créez un compte via "Créer un compte" au premier lancement.
- **Google** : vrai flux OAuth2 côté client (Google Identity Services). Pour
  l'activer, créez un Client ID sur https://console.cloud.google.com/
  (APIs & Services > Identifiants > ID client OAuth, type "Application Web",
  avec `http://localhost:5173` en origine autorisée) et renseignez-le dans
  `VITE_GOOGLE_CLIENT_ID` (fichier `.env`). Sans Client ID, le bouton Google
  est simplement masqué et seul le formulaire e-mail/mot de passe est utilisable.

Pour désactiver entièrement l'écran de connexion : `VITE_AUTH_ENABLED=false`.

## Configuration

Copiez `.env.example` en `.env` (déjà fait par défaut) et ajustez les
variables si besoin. Tant que `VITE_USE_MOCK_DATA=true`, l'application
fonctionne entièrement avec les données de `src/services/mockData/`.

Pour brancher un vrai backend plus tard :
1. Implémentez les routes REST attendues sous `VITE_API_BASE_URL`
   (`/trades`, `/trades/:id`, `/trades/bulk`, `/journal-entries`, `/journal-entries/:id`, `/markets`).
2. Passez `VITE_USE_MOCK_DATA=false`.
3. Remplacez l'authentification mock de `AuthContext.jsx` par de vrais appels
   à votre backend (la partie Google OAuth2 reste inchangée).

Aucun composant n'a besoin d'être modifié : `src/services/api/*.js` gère
la bascule automatiquement.

## Fonctionnalités principales

- **Menu latéral gauche responsive** : toujours visible sur desktop, tiroir accessible via un bouton hamburger sur mobile/tablette.
- **Thème clair/sombre** : sombre par défaut, bascule possible depuis le menu latéral (persisté).
- **Mon profil** (`/profil`) : nom, e-mail, forfait en cours, jours restants, et réglage du **facteur R** (valeur en $ de 1R) utilisé de façon cohérente par le calculateur de risque.
- **Tarifs** (`/tarifs`) : essai gratuit 7 jours, forfait mensuel, forfait annuel (avec % d'économie affiché), prix en dollars et en FCFA (taux indicatif), toutes les fonctionnalités incluses dans chaque forfait.
- **Outils d'analyse** (`/outils`) : explication de chaque statistique/outil de la plateforme et de son utilité.
- **Tableau de bord** : KPIs, courbe d'équité, calendrier du mois, calculateur de risque (capital, % ou valeur de R fixe, instrument avec valeurs de point prédéfinies, taille de position arrondie), checklist pré-trade.
- **Journal** : entrées liées à un instrument (indice concerné), tag d'humeur, captures d'écran titrables affichées en grand format (avec zoom plein écran), filtre par mois.
- **Track record** : trades avec une ou plusieurs approches combinées (Fondamentale + Price Action ne sont pas exclusives), filtres, tri, import CSV, export/impression PDF.
- **Analytics** : filtre par mois ou période personnalisée, taux de
  réussite, gagnants vs perdants (donut + barres), graphique des gains/pertes
  par jour sur la période choisie, distribution des R, R total réalisé,
  courbes d'équité/drawdown/R cumulé, win rate glissant, répartitions par
  approche/instrument/direction, corrélation humeur/performance.
- **Marchés** (`/marches`) : ~44 actifs de référence (actions, indices,
  forex, matières premières) classés par comportement (risk-on, risk-off,
  actif saisonnier, sensible aux événements), avec possibilité d'en ajouter
  manuellement.
- **Calendrier** : heatmap mensuelle complète.

## Stack

- React (Vite)
- React Router
- TailwindCSS
- Recharts
- date-fns
- @react-oauth/google (connexion Google)
- Context API (pas de Redux)

## Structure

```
src/
  components/   composants réutilisables par domaine
  pages/        pages routées
  hooks/        hooks personnalisés (useTrades, useJournalEntries, useAuth, useMarkets)
  context/      contextes React (état global : Auth, Trades, Journal)
  services/api/ couche d'abstraction API (mock ↔ HTTP)
  services/mockData/ données mockées (JSON)
  utils/        fonctions de calcul, dates, CSV
  constants/    stratégies (approches combinables), humeurs, marchés
```

