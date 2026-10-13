// Page Profil (/profil) : informations du compte (nom, e-mail), forfait en
// cours et nombre de jours restants (mis à jour en direct), saisie d'un code
// promo, + paramètres de calcul (valeur en dollars de 1R, risque par défaut)
// utilisés de façon cohérente par le calculateur de risque et les statistiques
// exprimées en R.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';
import { usePlan } from '../context/PlanContext';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { getPlan, computeDaysRemaining } from '../constants/plans';
import { redeemPromo } from '../services/api/subscriptionApi';

// DÉSACTIVATION TEMPORAIRE DES TARIFS : accès gratuit (voir PlanContext).
const FREE_ACCESS = true;

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const { settings, updateSettings } = useSettings();
  const { isLifetime } = usePlan();

  const [, setTick] = useState(0); // force le recalcul du compte à rebours chaque minute
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMsg, setPromoMsg] = useState(null); // { type: 'ok' | 'error', text }

  // Compte à rebours en direct : recompute les jours restants chaque minute.
  useEffect(() => {
    const intervalId = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(intervalId);
  }, []);

  if (!user) return null;

  const planId = user.plan || 'essai';
  const plan = getPlan(planId);
  // Recalculé à chaque rendu : le tick du compte à rebours force un rendu
  // chaque minute, donc Date.now() utilisé par computeDaysRemaining reste frais.
  const daysRemaining = isLifetime ? null : computeDaysRemaining(planId, user.planStartedAt);
  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 2;
  const displayDays = daysRemaining === null ? '∞' : daysRemaining;

  async function handleApplyPromo(e) {
    e.preventDefault();
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoMsg(null);
    try {
      await redeemPromo(promoCode);
      setPromoMsg({ type: 'ok', text: 'Code appliqué avec succès ! Votre forfait a été mis à jour.' });
      setPromoCode('');
      // Remonte l'utilisateur à jour (mode réel : GET /auth/me depuis le backend ;
      // mode mock : re-lecture de la session locale via auth:session-updated).
      if (typeof refreshUser === 'function') refreshUser();
    } catch (err) {
      setPromoMsg({ type: 'error', text: err?.message || "Impossible d'appliquer ce code." });
    } finally {
      setPromoLoading(false);
    }
  }

  return (
    <div>
      <PageHeader eyebrow="profil" title="Mon profil" description="Vos informations de compte et vos préférences de calcul." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card title="Informations du compte">
          <div className="flex items-center gap-3 mb-4">
            {user.picture ? (
              <img src={user.picture} alt={user.name} className="w-12 h-12 rounded-full" />
            ) : (
              <span className="w-12 h-12 rounded-full bg-accent/20 text-accent font-mono flex items-center justify-center text-lg">
                {(user.name || user.email || '?').charAt(0).toUpperCase()}
              </span>
            )}
            <div>
              <p className="text-text-primary font-medium">{user.name || 'Sans nom'}</p>
              <p className="text-sm text-text-secondary font-mono">{user.email}</p>
            </div>
          </div>
          <dl className="text-sm">
            <div className="flex justify-between py-2 border-t border-card-border">
              <dt className="text-text-secondary">Connexion via</dt>
              <dd className="text-text-primary capitalize">{user.provider === 'google' ? 'Google' : 'E-mail'}</dd>
            </div>
          </dl>
        </Card>

        <Card title="Forfait en cours">
          {FREE_ACCESS ? (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="h-10 w-10 rounded-card bg-accent/20 text-accent flex items-center justify-center text-lg">✓</span>
                <div>
                  <p className="text-text-primary font-medium text-lg">Accès complet</p>
                  <p className="text-sm text-text-secondary">
                    La plateforme est entièrement gratuite pour le moment.
                  </p>
                </div>
              </div>
              <div className="rounded-card border border-accent/20 bg-accent/10 p-3 text-sm text-text-secondary">
                La partie « Tarifs » est désactivée : vous pouvez utiliser toutes les fonctionnalités
                (journal, track record, analytics, stratégie) sans limite ni abonnement.
              </div>
              {/* Bouton « Changer de forfait » (page /tarifs) en commentaire : accès gratuit.
                  <Link to="/tarifs">
                    <Button variant="secondary" className="w-full mt-3">Changer de forfait</Button>
                  </Link> */}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-text-primary font-medium text-lg">{plan.label}</p>
                  <p className="text-sm text-text-secondary">{plan.tagline}</p>
                </div>
                {plan.priceUsd > 0 && (
                  <div className="text-right">
                    <p className="font-mono text-text-primary">${plan.priceUsd}</p>
                    <p className="text-xs text-text-secondary">/{plan.period}</p>
                  </div>
                )}
              </div>
              <div
                className={`rounded-card border p-3 flex items-center justify-between ${
                  isExpiringSoon ? 'border-danger/20 bg-danger/10' : 'border-card-border bg-bg'
                }`}
              >
                <span className="text-sm text-text-secondary">Jours restants</span>
                <span className={`font-mono text-xl font-semibold ${isExpiringSoon ? 'text-danger' : 'text-accent'}`}>
                  {displayDays}
                </span>
              </div>
              <Link to="/tarifs">
                <Button variant="secondary" className="w-full mt-3">
                  Changer de forfait
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      <Card title="Code promo" className="mb-4">
        <p className="text-sm text-text-secondary mb-4">
          Entrez un code promo pour bénéficier d&apos;un mois de forfait gratuit ou d&apos;un accès à vie.
        </p>
        <form onSubmit={handleApplyPromo} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="EX : BTMOIS2026"
            className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60 font-mono uppercase flex-1"
          />
          <Button type="submit" variant="primary" disabled={promoLoading || !promoCode.trim()}>
            {promoLoading ? 'Application…' : 'Appliquer'}
          </Button>
        </form>
        {promoMsg && (
          <p className={`mt-3 text-sm ${promoMsg.type === 'ok' ? 'text-accent' : 'text-danger'}`}>{promoMsg.text}</p>
        )}
      </Card>

      <Card title="Affichage & zoom" className="mb-4">
        <p className="text-sm text-text-secondary mb-4">
          Augmentez ou réduisez la taille de toute l&apos;interface pour l&apos;adapter à votre
          écran. Le réglage est mémorisé sur cet appareil.
        </p>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => updateSettings({ uiZoom: Math.max(70, Number(settings.uiZoom || 100) - 10) })}
            aria-label="Réduire le zoom"
          >
            −
          </Button>
          <span className="font-mono text-lg text-text-primary tabular-nums">{settings.uiZoom || 100}%</span>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => updateSettings({ uiZoom: Math.min(150, Number(settings.uiZoom || 100) + 10) })}
            aria-label="Augmenter le zoom"
          >
            +
          </Button>
          <button
            type="button"
            onClick={() => updateSettings({ uiZoom: 100 })}
            className="text-xs font-mono text-text-secondary hover:text-accent ml-2"
          >
            Réinitialiser (100 %)
          </button>
        </div>
      </Card>

      <Card title="Paramètres de calcul">
        <p className="text-sm text-text-secondary mb-4">
          Définissez ici la valeur en dollars de <strong className="text-text-primary">1R</strong> (votre unité de
          risque de référence) et votre risque par défaut. Ces valeurs sont utilisées de façon cohérente par le
          calculateur de risque du tableau de bord et pour interpréter vos statistiques en R dans les analytics.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
            Valeur de 1R ($)
            <input
              type="number"
              min="0"
              step="1"
              value={settings.rValueDollars}
              onChange={(e) => updateSettings({ rValueDollars: Number(e.target.value) })}
              className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-mono text-text-secondary">
            Risque par défaut (% du capital)
            <input
              type="number"
              min="0"
              step="0.1"
              value={settings.defaultRiskPercent}
              onChange={(e) => updateSettings({ defaultRiskPercent: Number(e.target.value) })}
              className="bg-bg border border-card-border rounded-card px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent/60"
            />
          </label>
        </div>
      </Card>
    </div>
  );
}