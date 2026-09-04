// Page Profil (/profil) : informations du compte (nom, e-mail), forfait en
// cours et nombre de jours restants, + paramètres de calcul (valeur en
// dollars de 1R, risque par défaut) utilisés de façon cohérente par le
// calculateur de risque et les statistiques exprimées en R.
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { getPlan, computeDaysRemaining } from '../constants/plans';

export default function Profile() {
  const { user } = useAuth();
  const { settings, updateSettings } = useSettings();

  if (!user) return null;

  const plan = getPlan(user.plan || 'essai');
  const daysRemaining = computeDaysRemaining(user.plan || 'essai', user.planStartedAt);
  const isExpiringSoon = daysRemaining <= 2;

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
              {daysRemaining}
            </span>
          </div>
          <Link to="/tarifs">
            <Button variant="secondary" className="w-full mt-3">
              Changer de forfait
            </Button>
          </Link>
        </Card>
      </div>

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
