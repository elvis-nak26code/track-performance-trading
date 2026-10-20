# Journal de Trading — Frontend

Application frontend (React + Vite) de journal de trading et de track record.
**Le logiciel est entièrement gratuit** (aucun paiement, forfait ou code promo).
Toutes les données affichées viennent de la base de données de l'API de votre
compte : aucune donnée de simulation n'existe dans l'application.

## Démarrage

```bash
npm install
npm run dev
```

L'application démarre sur http://localhost:5173.

## Connexion

Un écran de connexion est activé par défaut (`VITE_AUTH_ENABLED=true`) :
- **E-mail / mot de passe** : comptes enregistrés dans la base de données de
  l'API (mots de passe hachés côté serveur) — créez un compte via
  "Créer un compte" au premier lancement.
- **Google** : vrai flux OAuth2 côté client (Google Identity Services). Pour
  l'activer, créez un Client ID sur https://console.cloud.google.com/
  (APIs & Services > Identifiants > ID client OAuth, type "Application Web",
  avec `http://localhost:5173` en origine autorisée) et renseignez-le dans
  `VITE_GOOGLE_CLIENT_ID` (fichier `.env`). Sans Client ID, le bouton Google
  est simplement masqué et seul le formulaire e-mail/mot de passe est utilisable.

Pour désactiver entièrement l'écran de connexion : `VITE_AUTH_ENABLED=false`.

## Configuration

Copiez `.env.example` en `.env` et renseignez au minimum `VITE_API_BASE_URL`
(URL de l'API : le cloud pour le site web, `http://127.0.0.1:43127/api` pour
l'application de bureau, voir `.env.desktop`).

Les préférences de calcul (valeur de 1R, risque par défaut) sont enregistrées
sur le compte et synchronisées entre le web et le desktop ; le zoom de
l'interface reste propre à chaque appareil.

## Fonctionnalités principales

- **Menu latéral gauche responsive** : toujours visible sur desktop, tiroir accessible via un bouton hamburger sur mobile/tablette.
- **Thème clair/sombre** : sombre par défaut, bascule possible depuis le menu latéral (persisté).
- **Mon profil** (`/profil`) : nom, e-mail, et réglage du **facteur R** (valeur en $ de 1R) utilisé de façon cohérente par le calculateur de risque. Accès complet et gratuit, sans limite.
- **Outils d'analyse** (`/outils`) : explication de chaque statistique/outil de la plateforme et de son utilité.
- **Tableau de bord** : KPIs, courbe d'équité, calendrier du mois, calculateur de risque (capital, % ou valeur de R fixe, instrument avec valeurs de point prédéfinies, taille de position arrondie), checklist pré-trade.
- **Journal** : entrées liées à un instrument (indice concerné), tag d'humeur, captures d'écran titrables affichées en grand format (avec zoom plein écran), filtre par mois.
- **Track record** : trades avec une ou plusieurs approches combinées (Fondamentale + Price Action ne sont pas exclusives), filtres, tri, import CSV, export/impression PDF.
- **Analytics** : filtre par mois ou période personnalisée, taux de
  réussite, gagnants vs perdants (donut + barres), graphique des gains/pertes
  par jour sur la période choisie, distribution des R, R total réalisé,
  courbes d'équité/drawdown/R cumulé, win rate glissant, répartitions par
  approche/instrument/direction, corrélation humeur/performance.
- **Marchés** (`/marches`) : catalogue d'actifs de référence (actions, indices,
  forex, matières premières) classés par comportement (risk-on, risk-off,
  actif saisonnier, sensible aux événements), avec possibilité d'ajouter ses
  propres marchés (visibles uniquement par votre compte).
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
  context/      contextes React (état global : Auth, Trades, Journal, Marchés, Stratégies, Réglages)
  services/api/ accès à l'API HTTP (cloud ou serveur local de bureau)
  utils/        fonctions de calcul, dates, CSV
  constants/    stratégies (approches combinables), humeurs, marchés
```

