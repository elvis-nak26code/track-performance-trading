// Page Profil (/profil) : informations du compte (nom, e-mail) et paramètres
// de calcul (valeur en dollars de 1R, risque par défaut) utilisés de façon
// cohérente par le calculateur de risque et les statistiques exprimées en R.
// Le logiciel est entièrement gratuit : aucune notion de forfait ni d'abonnement.
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

export default function Profile() {
  const { user } = useAuth();
  const { settings, updateSettings } = useSettings();

  if (!user) return null;

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

        <Card title="Accès">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-card bg-accent/20 text-accent flex items-center justify-center text-lg">✓</span>
            <div>
              <p className="text-text-primary font-medium text-lg">Accès complet et gratuit</p>
              <p className="text-sm text-text-secondary">
                Toutes les fonctionnalités (journal, track record, analytics, stratégie)
                sont disponibles sans limite ni abonnement.
              </p>
            </div>
          </div>
        </Card>
      </div>

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
