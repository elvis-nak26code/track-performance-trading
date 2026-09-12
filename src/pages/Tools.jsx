// Page Outils d'analyse (/outils) : la liste des outils pédagogiques
// explique chaque statistique. Le calculateur de position vit sur le tableau
// de bord (/tableau-de-bord) et n'est pas dupliqué ici.
import PageHeader from '../components/common/PageHeader';
import Card from '../components/common/Card';

const TOOLS = [
  {
    title: 'Taux de réussite (win rate)',
    description:
      'Pourcentage de trades gagnants sur le total. Un indicateur simple mais insuffisant seul : un win rate élevé avec des pertes plus grosses que les gains peut quand même être perdant. À lire toujours avec le profit factor et le R moyen.',
  },
  {
    title: 'Profit factor',
    description:
      "Rapport entre la somme des gains bruts et la somme des pertes brutes. Un profit factor supérieur à 1 signifie que la stratégie est globalement profitable ; au-dessus de 1.5-2, l'edge est généralement considéré comme solide.",
  },
  {
    title: 'R moyen et R total réalisé',
    description:
      "Le R exprime le résultat d'un trade en multiple de votre risque initial (ex : +3R = un gain de 3 fois ce que vous risquiez). Le R moyen mesure la qualité moyenne de vos trades indépendamment de la taille de position ; le R total réalisé cumule votre performance en unités de risque plutôt qu'en dollars, ce qui facilite la comparaison entre périodes.",
  },
  {
    title: "Courbe d'équité",
    description:
      'Visualise le cumul de votre P&L trade après trade. Elle permet de repérer rapidement les phases de progression régulière, les périodes de stagnation, et les à-coups liés à un trade exceptionnel.',
  },
  {
    title: 'Courbe de drawdown',
    description:
      "Mesure l'écart entre votre équité actuelle et le plus haut niveau jamais atteint (le \"high water mark\"). C'est l'indicateur clé du risque réellement pris : un drawdown profond ou prolongé signale une période à risque de rupture de discipline.",
  },
  {
    title: 'Win rate glissant (moyenne mobile 10/20)',
    description:
      "Calcule votre taux de réussite sur vos 10 ou 20 derniers trades plutôt que sur l'historique complet. Utile pour détecter une dérive récente de performance (positive ou négative) que la moyenne globale masquerait.",
  },
  {
    title: 'Distribution des R',
    description:
      "Histogramme du nombre de trades par tranche de résultat en R. Permet de voir la forme de votre courbe de résultats : beaucoup de petites pertes et quelques gros gains (typique du suivi de tendance), ou l'inverse (typique du scalping/price action).",
  },
  {
    title: 'Corrélation humeur / performance',
    description:
      "Croise vos entrées de journal (tag d'humeur) avec les trades qui leur sont liés pour calculer un win rate moyen par humeur. Objectif : repérer objectivement si certains états mentaux (tilt, avidité, peur) dégradent réellement vos résultats.",
  },
  {
    title: 'Checklist pré-trade',
    description:
      "Liste de vérifications personnalisable à cocher avant de logger un trade. Elle n'analyse pas vos données passées mais vous aide à appliquer votre plan de façon disciplinée avant chaque nouvelle prise de position.",
  },
];

export default function Tools() {
  return (
    <div>
      <PageHeader
        eyebrow="outils d'analyse"
        title="Comprendre vos outils"
        description="Ce que mesure chaque statistique de la plateforme et comment vous en servir pour progresser."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TOOLS.map((tool) => (
          <Card key={tool.title} title={tool.title}>
            <p className="text-sm text-text-secondary leading-relaxed">{tool.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
