// Page Tarifs (/tarifs) : essai gratuit, forfait mensuel, forfait annuel.
// Toutes les fonctionnalités de la plateforme sont incluses dans chaque
// forfait — seules la durée et la formule de facturation changent.
import { useAuth } from '../hooks/useAuth';
import PageHeader from '../components/common/PageHeader';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { PLANS, formatXof } from '../constants/plans';

const ALL_FEATURES = [
  'Tableau de bord & KPIs en temps réel',
  'Journal de trading illimité (captures d\'écran incluses)',
  'Track record complet + import CSV',
  'Analytics avancées (R, drawdown, corrélation humeur)',
  'Calendrier de sessions',
  'Référence des marchés',
  'Calculateur de risque',
  'Support par e-mail',
];

export default function Pricing() {
  const { user, updatePlan } = useAuth();

  return (
    <div>
      <PageHeader
        eyebrow="tarifs"
        title="Un seul niveau, toutes les fonctionnalités"
        description="Chaque forfait donne accès à l'intégralité de la plateforme. Seules la durée et la formule de facturation changent."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {PLANS.map((plan) => {
          const isCurrent = user?.plan === plan.id;
          return (
            <div
              key={plan.id}
              className={`rounded-card border p-5 flex flex-col ${
                plan.highlight ? 'border-accent/50 bg-accent/[0.04]' : 'border-card-border bg-card'
              }`}
            >
              {plan.highlight && (
                <Badge tone="positive" className="self-start mb-3">
                  Le plus populaire
                </Badge>
              )}
              <h3 className="text-lg font-semibold text-text-primary mb-1">{plan.label}</h3>
              <p className="text-sm text-text-secondary mb-4">{plan.tagline}</p>

              <div className="mb-4">
                {plan.priceUsd === 0 ? (
                  <p className="font-mono text-3xl font-semibold text-text-primary">Gratuit</p>
                ) : (
                  <>
                    <p className="font-mono text-3xl font-semibold text-text-primary">
                      ${plan.priceUsd}
                      <span className="text-sm text-text-secondary font-sans">/{plan.period}</span>
                    </p>
                    <p className="text-xs text-text-secondary font-mono mt-1">{formatXof(plan.priceUsd)}</p>
                  </>
                )}
                {plan.discountPercent && (
                  <p className="text-xs text-accent font-mono mt-1">Économie de {plan.discountPercent}% vs mensuel</p>
                )}
                {plan.durationDays && plan.id === 'essai' && (
                  <p className="text-xs text-text-secondary mt-1">Durée : {plan.durationDays} jours</p>
                )}
              </div>

              <ul className="flex flex-col gap-2 mb-5 flex-1">
                {ALL_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span className="text-accent mt-0.5">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.highlight ? 'primary' : 'secondary'}
                disabled={isCurrent}
                onClick={() => updatePlan(plan.id)}
                className="w-full"
              >
                {isCurrent ? 'Forfait actuel' : plan.id === 'essai' ? "Démarrer l'essai" : 'Choisir ce forfait'}
              </Button>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-text-secondary">
        Taux de conversion FCFA indicatif (≈ 600 FCFA pour 1 $), fourni à titre d&apos;ordre de grandeur — le taux
        réel appliqué à la facturation peut varier.
      </p>
    </div>
  );
}
