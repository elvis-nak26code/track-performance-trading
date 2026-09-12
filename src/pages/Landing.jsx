// Landing page publique de BlackTracker (visiteur non connecté) : esthétique
// "terminal" sombre, cohérente avec l'application. Hero + captures,
// histoire de la création, fonctionnalités, galerie, principes, FAQ, CTA.
//
// — CAPTURES : déposez vos fichiers dans frontend/public/screenshots/ avec
//   exactement ces noms : dashboard.png, journal.png, analytics.png,
//   calendar.png. Tant qu'un fichier est absent, un placeholder élégant
//   s'affiche automatiquement à la place (aucune erreur console visible).
import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  FileText,
  BarChart3,
  CalendarDays,
  BrainCircuit,
  Calculator,
  FileDown,
  MousePointerClick,
  ShieldCheck,
  Mail,
  Terminal,
  Activity,
} from 'lucide-react';

const SHOTS = {
  dashboard: '/screenshots/dashboard.png',
  journal: '/screenshots/journal.png',
  analytics: '/screenshots/analytics.png',
  calendar: '/screenshots/calendar.png',
};

const FEATURES = [
  {
    icon: FileText,
    title: 'Journal façon papier',
    body: "Écrivez librement sur une page blanche, glissez vos captures où vous voulez, redimensionnez-les, surlignez — puis exportez le tout en PDF.",
  },
  {
    icon: BarChart3,
    title: 'Track record & stats',
    body: "Win rate, profit factor, R moyen, courbe d'équité, distribution des R… Vos métriques clés, recalculées automatiquement à chaque trade.",
  },
  {
    icon: BrainCircuit,
    title: 'Humeur × performance',
    body: "Taggez votre état d'esprit à chaque entrée et croisez-le avec vos résultats. Repérez objectivement ce qui dégrade — ou booste — vos trades.",
  },
  {
    icon: Calculator,
    title: 'Calculateur de position',
    body: 'Toutes les paires de devises, futures, indices synthétiques et matières premières, filtrables au clavier. Inspiré de Myfxbook.',
  },
  {
    icon: CalendarDays,
    title: 'Calendrier de sessions',
    body: "Vos jours gagnants et perdants d'un coup d'œil, mois par mois. La discipline devient visible.",
  },
  {
    icon: FileDown,
    title: 'Export PDF & CSV',
    body: 'Votre journal en PDF propre, votre track record en CSV. Vos données restent les vôtres, partout.',
  },
];

const FAQ = [
  {
    q: "À qui s'adresse BlackTracker ?",
    a: "À tout trader — particulier ou pro — qui veut structurer sa discipline, suivre sa progression en R et comprendre ses biais comportementaux sur le long terme.",
  },
  {
    q: "L'application est-elle gratuite ?",
    a: "Le cœur de l'application est accessible après inscription. Les offres avancées sont détaillées sur la page Tarifs, une fois connecté.",
  },
  {
    q: 'Mes données sont-elles en sécurité ?',
    a: "Oui : échanges en HTTPS, données isolées par utilisateur, jamais revendues. Vous pouvez supprimer votre compte et vos données à tout moment.",
  },
  {
    q: 'Faut-il installer quelque chose ?',
    a: "Non. BlackTracker fonctionne directement dans votre navigateur — ordinateur, tablette ou téléphone.",
  },
  {
    q: 'Puis-je récupérer mes données ?',
    a: 'Oui : export CSV du track record, export PDF du journal. Pas de verrouillage, pas de surprise.',
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const goLogin = () => navigate('/connexion');

  return (
    <div className="min-h-screen bg-[#000003] text-[#fdfefd] antialiased font-sans selection:bg-[#00aa44]/30">
      {/* ───────────────── NAV ───────────────── */}
      <header className="sticky top-0 z-40 bg-[#000003]/85 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
          <span className="font-mono text-[#00c853] font-semibold tracking-wide text-xs">
            {'// BLACKTRACKER'}
          </span>
          <nav className="hidden sm:flex items-center gap-8 text-sm text-[#cdd2cd]">
            <a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a>
            <a href="#captures" className="hover:text-white transition-colors">Captures</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>
          <button
            type="button"
            onClick={goLogin}
            className="h-9 px-4 rounded-lg border border-white/20 text-sm font-medium hover:border-[#00c853]/60 hover:text-[#00e065] transition-colors"
          >
            Se connecter
          </button>
        </div>
      </header>

      {/* ───────────────── HERO ───────────────── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 45% at 50% 0%, rgba(0,200,83,0.14), transparent 70%)',
          }}
        />
        {/* Graphique de bougies décoratif en fond : illustre le côté trading,
            très discret (opacité faible), animation de respiration lente. */}
        <CandlesBg className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black_40%,transparent_95%)]" />
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16 sm:pt-28 text-center">
          <span
            className="hero-anim inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full border border-[#00c853]/30 bg-[#00c853]/10 text-[#00e065] text-[11px] font-mono tracking-wide uppercase"
            style={{ animationDelay: '50ms' }}
          >
            <Terminal size={12} />
            Journal de trading — pensé pour durer
          </span>

          <h1
            className="hero-anim text-4xl sm:text-6xl font-bold leading-[1.08] tracking-tight max-w-4xl mx-auto"
            style={{ animationDelay: '120ms' }}
          >
            Arrêtez de deviner.
            <br />
            <span className="text-[#00e065]">Commencez à mesurer.</span>
          </h1>

          <p
            className="hero-anim mt-6 text-base sm:text-lg text-[#cdd2cd] max-w-2xl mx-auto leading-relaxed"
            style={{ animationDelay: '200ms' }}
          >
            BlackTracker transforme chaque session en données exploitables :
            page libre façon papier, track record en R, corrélation
            humeur-performance — et export PDF en un clic.
          </p>

          <div
            className="hero-anim mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
            style={{ animationDelay: '280ms' }}
          >
            <button
              type="button"
              onClick={goLogin}
              className="h-12 px-7 rounded-xl bg-[#00aa44] hover:bg-[#00c853] text-white text-sm font-semibold shadow-[0_8px_30px_-6px_rgba(0,200,83,0.5)] transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] flex items-center gap-2"
            >
              Créer mon compte gratuit
              <ArrowRight size={16} />
            </button>
            <a
              href="#captures"
              className="h-12 px-7 rounded-xl border border-white/20 hover:border-white/50 text-sm font-medium flex items-center transition-colors"
            >
              Voir l&apos;application
            </a>
          </div>

          <p
            className="hero-anim mt-6 font-mono text-[11px] text-[#cdd2cd]/50"
            style={{ animationDelay: '360ms' }}
          >
            {'// gratuit · sans carte bancaire · vos données restent les vôtres'}
          </p>

          {/* Capture hero : dashboard */}
          <div className="hero-anim mt-14 mx-auto max-w-5xl text-left" style={{ animationDelay: '440ms' }}>
            <BrowserFrame url="blacktracker.app">
              <Shot src={SHOTS.dashboard} label="Tableau de bord BlackTracker" aspect="aspect-[16/9]" />
            </BrowserFrame>
          </div>
        </div>
      </section>

      {/* ───────────────── TICKER MARCHÉS ───────────────── */}
      <MarketTicker />

      {/* ───────────────── STATS ───────────────── */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            { value: 'R', label: "L'unité qui compte : chaque trade mesuré en multiple de risque" },
            { value: '600+', label: 'Paires de devises filtrables au clavier dans le calculateur' },
            { value: '1-clic', label: "Export PDF du journal, CSV du track record" },
          ].map((s, i) => (
            <Reveal key={s.value} delay={i * 90}>
              <p className="font-mono text-3xl text-[#00e065]">{s.value}</p>
              <p className="mt-1 text-sm text-[#cdd2cd]">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───────────────── POURQUOI CRÉÉ ───────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20 sm:py-24">
        <p className="font-mono text-[11px] text-[#00e065] uppercase tracking-widest mb-3">
          {'// pourquoi blacktracker existe'}
        </p>
        <Reveal>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight max-w-2xl">
            Né d&apos;un cahier perdu et de captures éparpillées.
          </h2>
        </Reveal>
        <div className="mt-8 grid sm:grid-cols-2 gap-8 text-[#cdd2cd] leading-relaxed text-[15px]">
          <Reveal delay={80}>
            <div className="space-y-4">
              <p>
                Pendant longtemps, mon « journal » tenait dans un cahier, des
                feuilles volantes et des captures d&apos;écran perdues au fond de
                mes dossiers. Je rejouais parfois une idée qui avait marché sans
                comprendre pourquoi — et je refaisais surtout les mêmes erreurs,
                faute de retour objectif.
              </p>
              <p>
                Les tableurs n&apos;aidaient pas : trop rigides, trop lents, et
                incapables d&apos;accueillir une image à l&apos;endroit exact où
                elle compte.
              </p>
            </div>
          </Reveal>
          <Reveal delay={160}>
            <div className="space-y-4">
              <p>
                BlackTracker est né de ce manque : un endroit où l&apos;on écrit
                comme sur papier — librement, sans contrainte de mise en page —
                avec la puissance du numérique : calcul auto du P&amp;L, captures
                intégrées, export PDF, et un suivi en R qui rend la progression
                mesurable.
              </p>
              <p>
                <strong className="text-white">L&apos;objectif est simple :</strong>{' '}
                cinq minutes d&apos;écriture après chaque session, et un vrai
                avantage compétitif — la connaissance de soi.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ───────────────── FONCTIONNALITÉS ───────────────── */}
      <section id="features" className="border-y border-white/10 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-20 sm:py-24">
          <p className="font-mono text-[11px] text-[#00e065] uppercase tracking-widest mb-3 text-center">
            {'// fonctionnalités'}
          </p>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-center mb-14">
            Six modules. Zéro fioriture.
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={(i % 3) * 90}>
                <div className="landing-hover-lift h-full rounded-xl border border-white/10 bg-[#000005] p-6 hover:border-[#00c853]/40">
                  <div className="w-10 h-10 rounded-lg bg-[#00c853]/10 border border-[#00c853]/20 flex items-center justify-center mb-4">
                    <Icon size={20} className="text-[#00e065]" />
                  </div>
                  <h3 className="font-semibold text-white mb-1.5">{title}</h3>
                  <p className="text-sm text-[#cdd2cd] leading-relaxed">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── GALERIE ───────────────── */}
      <section id="captures" className="max-w-6xl mx-auto px-6 py-20 sm:py-24">
        <p className="font-mono text-[11px] text-[#00e065] uppercase tracking-widest mb-3 text-center">
          {'// en images'}
        </p>
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-center mb-4">
          Une interface pensée pour être lue.
        </h2>
        <p className="text-center text-[#cdd2cd] text-sm mb-12">
          Le même terminal sobre partout : écrire, mesurer, relire.
        </p>

        <div className="grid lg:grid-cols-5 gap-5">
          <Reveal className="lg:col-span-3">
            <BrowserFrame url="blacktracker.app/journal" label="Journal — page libre de saisie">
              <Shot src={SHOTS.journal} label="Journal BlackTracker" aspect="aspect-[16/10]" />
            </BrowserFrame>
          </Reveal>
          <div className="lg:col-span-2 flex flex-col gap-5">
            <Reveal delay={100}>
              <BrowserFrame url="blacktracker.app/analytics" label="Analytics — votre edge en chiffres">
                <Shot src={SHOTS.analytics} label="Analytics BlackTracker" aspect="aspect-[16/10]" />
              </BrowserFrame>
            </Reveal>
            <Reveal delay={180}>
              <BrowserFrame url="blacktracker.app/calendrier" label="Calendrier — vos sessions, mois par mois">
                <Shot src={SHOTS.calendar} label="Calendrier BlackTracker" aspect="aspect-[16/10]" />
              </BrowserFrame>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ───────────────── PRINCIPES ───────────────── */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-20 sm:py-24">
          <p className="font-mono text-[11px] text-[#00e065] uppercase tracking-widest mb-3 text-center">
            {'// principes'}
          </p>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-center mb-14">
            Deux idées simples, au fond.
          </h2>

          <div className="grid sm:grid-cols-2 gap-10 max-w-4xl mx-auto">
            {[
              {
                icon: ShieldCheck,
                title: 'Vos données, chez vous',
                body: "Pas de publicité, pas de revente. BlackTracker tourne pour vous — et vous pouvez exporter ou supprimer l'intégralité de vos données à tout moment.",
              },
              {
                icon: MousePointerClick,
                title: 'Conçu pour être utilisé',
                body: "Zéro complexité inutile : un formulaire, des raccourcis, des saisies rapides. L'objectif, c'est cinq minutes d'écriture après chaque session — pas une corvée.",
              },
            ].map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 120}>
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-[#00c853]/10 border border-[#00c853]/20 flex items-center justify-center">
                    <Icon size={20} className="text-[#00e065]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{title}</h3>
                    <p className="text-sm text-[#cdd2cd] leading-relaxed">{body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── FAQ ───────────────── */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-20 sm:py-24">
        <p className="font-mono text-[11px] text-[#00e065] uppercase tracking-widest mb-3 text-center">
          {'// faq'}
        </p>
        <Reveal>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-center mb-12">
            Tout savoir en 2 minutes.
          </h2>
        </Reveal>

        <Reveal delay={80}>
          <div className="divide-y divide-white/10 border border-white/10 rounded-xl overflow-hidden bg-[#000005]">
            {FAQ.map(({ q, a }, i) => (
              <details key={i} className="group">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-medium text-white select-none [&::-webkit-details-marker]:hidden">
                  {q}
                  <span className="text-[#00e065] group-open:rotate-45 transition-transform text-lg leading-none">+</span>
                </summary>
                <div className="px-5 pb-4 text-sm text-[#cdd2cd] leading-relaxed">{a}</div>
              </details>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ───────────────── CTA FINAL ───────────────── */}
      <section className="relative overflow-hidden border-t border-white/10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(55% 60% at 50% 100%, rgba(0,200,83,0.16), transparent 70%)',
          }}
        />
        <Reveal className="relative max-w-6xl mx-auto px-6 py-20 sm:py-24 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-4">
            Prêt à structurer votre trading&nbsp;?
          </h2>
          <p className="text-[#cdd2cd] max-w-lg mx-auto mb-8">
            Créez votre compte en quelques secondes, et écrivez votre prochaine
            session dès aujourd&apos;hui.
          </p>
          <button
            type="button"
            onClick={goLogin}
            className="h-12 px-7 rounded-xl bg-[#00aa44] hover:bg-[#00c853] text-white text-sm font-semibold shadow-[0_8px_30px_-6px_rgba(0,200,83,0.5)] transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] inline-flex items-center gap-2"
          >
            Commencer maintenant
            <ArrowRight size={16} />
          </button>
        </Reveal>
      </section>

      {/* ───────────────── FOOTER ───────────────── */}
      <footer className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-[#cdd2cd]/70">
          <div>
            <p className="font-mono text-xs tracking-widest text-[#00e065] mb-2">{'// BLACKTRACKER'}</p>
            <p>© {new Date().getFullYear()} BlackTracker — conçu pour les traders sérieux.</p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-1.5">
            <a
              href="mailto:nacanaboelvis3@gmail.com"
              className="flex items-center gap-1.5 text-[#cdd2cd] hover:text-white transition-colors"
            >
              <Mail size={14} />
              nacanaboelvis3@gmail.com
            </a>
            <p className="text-xs text-[#cdd2cd]/50">Questions, retours ou partenariats — écrivez-nous.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Fenêtre "navigateur" : encadre joliment les captures.
   ───────────────────────────────────────────────────────────── */
function BrowserFrame({ url, label, children }) {
  return (
    <figure>
      <div className="rounded-xl border border-white/15 bg-[#0a0a10] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="flex items-center gap-2 px-4 h-10 border-b border-white/10">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 flex-1 max-w-xs truncate rounded-md bg-white/5 px-3 py-1 font-mono text-[11px] text-[#cdd2cd]/70">
            {url}
          </span>
        </div>
        {children}
      </div>
      {label && (
        <figcaption className="mt-3 text-center text-xs font-mono text-[#cdd2cd]/60">
          {label}
        </figcaption>
      )}
    </figure>
  );
}

/* ─────────────────────────────────────────────────────────────
   Capture : affiche l'image si le fichier existe, sinon un
   placeholder élégant (aucune erreur visible pour le visiteur).
   ───────────────────────────────────────────────────────────── */
function Shot({ src, label, aspect = 'aspect-video' }) {
  const [failed, setFailed] = useState(false);
  const showImg = Boolean(src) && !failed;

  if (showImg) {
    // L'image s'affiche dans son intégralité : largeur pleine, hauteur
    // naturelle (object-cover rognait le bas des captures).
    return (
      <div className="bg-[#050508] overflow-hidden group">
        <img
          src={src}
          alt={label}
          onError={() => setFailed(true)}
          className="w-full h-auto block group-hover:scale-[1.01] transition-transform duration-500"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className={`relative ${aspect} bg-[#050508] overflow-hidden`}>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-[radial-gradient(60%_60%_at_50%_40%,rgba(0,200,83,0.08),transparent_70%)]">
        <div className="w-10 h-10 rounded-full bg-[#00c853]/10 border border-[#00c853]/25 flex items-center justify-center mb-3">
          <MousePointerClick size={18} className="text-[#00e065]" />
        </div>
        <p className="text-sm font-medium text-white mb-1">{label}</p>
        <p className="text-[11px] text-[#cdd2cd]/50 font-mono">capture à intégrer</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Graphique de bougies décoratif pour le hero. Données générées
   de façon déterministe (module-level) : mêmes bougies à chaque
   rendu. Rendues en SVG très translucides pour rester discrètes.
   ───────────────────────────────────────────────────────────── */
const CANDLES = (() => {
  const data = [];
  let price = 62;
  for (let i = 0; i < 34; i++) {
    const open = price;
    const drift = Math.sin(i * 0.55) * 11 + Math.sin(i * 1.85) * 5;
    const close = open + drift;
    const wickUp = 5 + Math.abs(Math.sin(i * 0.8)) * 9;
    const wickDn = 5 + Math.abs(Math.cos(i * 0.6)) * 9;
    data.push({
      x: 20 + i * 46,
      open,
      close,
      high: Math.max(open, close) + wickUp,
      low: Math.min(open, close) - wickDn,
      up: close >= open,
    });
    price = close;
  }
  return data;
})();

// Moyenne mobile (fenêtre 4) des closes, pour la ligne de tendance.
const CANDLE_MA = (() => {
  const closes = CANDLES.map((c) => c.close);
  return closes.map((_, i) => {
    const win = closes.slice(Math.max(0, i - 3), i + 1);
    return win.reduce((a, b) => a + b, 0) / win.length;
  });
})();

function CandlesBg({ className }) {
  const toY = (v) => Math.max(6, Math.min(396, 330 - (v - 38) * 4.8));
  const maPoints = CANDLE_MA.map((v, i) => `${CANDLES[i].x + 9},${toY(v)}`).join(' ');

  return (
    <div className={className} aria-hidden="true">
      <svg
        viewBox="0 0 1600 600"
        preserveAspectRatio="xMidYMid slice"
        className="candles-bg h-full w-full"
      >
        {/* Grille de chart papier */}
        <g stroke="#ffffff" strokeWidth={1}>
          {[80, 160, 240, 320, 400, 480, 560].map((y) => (
            <line key={`h${y}`} x1={0} y1={y} x2={1600} y2={y} opacity={0.05} />
          ))}
          {[200, 400, 600, 800, 1000, 1200, 1400].map((x) => (
            <line key={`v${x}`} x1={x} y1={0} x2={x} y2={600} opacity={0.04} />
          ))}
        </g>

        {/* Ligne de tendance (moyenne mobile) */}
        <polyline
          points={maPoints}
          fill="none"
          stroke="#1DE9B6"
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity={0.5}
        />

        {/* Bougies */}
        {CANDLES.map((c, i) => {
          const yOpen = toY(c.open);
          const yClose = toY(c.close);
          const yHigh = toY(c.high);
          const yLow = toY(c.low);
          const color = c.up ? '#00aa44' : '#ff5252';
          return (
            <g key={i} opacity={0.32}>
              <line
                x1={c.x + 10}
                y1={yHigh}
                x2={c.x + 10}
                y2={yLow}
                stroke={color}
                strokeWidth={2}
              />
              <rect
                x={c.x + 1}
                y={Math.min(yOpen, yClose)}
                width={18}
                height={Math.max(2, Math.abs(yClose - yOpen))}
                rx={1}
                fill={color}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Bandeau de cotations défilant (façon terminal de trading).
   Valeurs factices et statiques, juste pour l'ambiance.
   ───────────────────────────────────────────────────────────── */
const MARKET_TICKER = [
  { symbol: 'EUR/USD', price: '1.0872', delta: 0.12 },
  { symbol: 'USD/JPY', price: '148.54', delta: -0.08 },
  { symbol: 'GBP/USD', price: '1.2718', delta: 0.21 },
  { symbol: 'USD/CHF', price: '0.8821', delta: 0.04 },
  { symbol: 'AUD/USD', price: '0.6579', delta: -0.16 },
  { symbol: 'USD/CAD', price: '1.3674', delta: 0.05 },
  { symbol: 'EUR/GBP', price: '0.8546', delta: -0.09 },
  { symbol: 'XAU/USD', price: '2,438.60', delta: 0.62 },
  { symbol: 'XAG/USD', price: '29.14', delta: -0.34 },
  { symbol: 'BTC/USD', price: '64,120', delta: 1.25 },
  { symbol: 'ETH/USD', price: '3,485', delta: -0.42 },
  { symbol: 'NAS100', price: '19,260.5', delta: 0.85 },
  { symbol: 'SPX500', price: '5,345.2', delta: 0.31 },
  { symbol: 'US30', price: '39,280.4', delta: -0.12 },
  { symbol: 'GER40', price: '18,240.2', delta: 0.44 },
  { symbol: 'WTI', price: '78.54', delta: 0.92 },
  { symbol: 'BRENT', price: '82.13', delta: -0.18 },
  { symbol: 'NG', price: '2.894', delta: 1.52 },
  { symbol: 'HG', price: '4.521', delta: -0.65 },
];

function MarketTicker() {
  return (
    <section
      aria-label="Cotations de marché"
      className="overflow-hidden border-y border-white/10 bg-[#020208]"
    >
      <div className="flex items-stretch">
        <span className="shrink-0 hidden sm:inline-flex items-center gap-1.5 h-9 px-4 border-r border-white/10 bg-[#000003] font-mono text-[11px] tracking-widest text-[#00e065]">
          <Activity size={13} />
          EN DIRECT
        </span>
        <div className="ticker-mask flex-1 overflow-hidden">
          <div className="ticker-track inline-flex whitespace-nowrap">
            {MARKET_TICKER.concat(MARKET_TICKER).map((t, i) => (
              <span
                key={i}
                className="mx-5 inline-flex items-baseline gap-2 font-mono text-xs leading-9"
              >
                <span className="text-[#cdd2cd]/80">{t.symbol}</span>
                <span className="text-white tabular-nums">{t.price}</span>
                <span className={t.delta >= 0 ? 'text-[#00e065]' : 'text-[#ff5252]'}>
                  {t.delta > 0 ? '+' : ''}
                  {t.delta.toFixed(2)}%
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   Reveal : apparition douce au scroll. Dès que l'élément entre
   dans le viewport, IntersectionObserver ajoute "reveal-visible"
   (animation CSS ci-dessous). Le délai éventuel permet une cascade.
   ───────────────────────────────────────────────────────────── */
function Reveal({ delay = 0, className = '', children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}

Reveal.propTypes = {
  delay: PropTypes.number,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};
