// URLs publiques des installateurs BlackTracker (version desktop).
//
// Le site web est volontairement LÉGER : il ne sert plus les binaires en
// interne (anciennement ~650 Mo copiés depuis frontend/public-web/downloads
// dans chaque build → déploiement Render trop lourd). Les installateurs sont
// désormais publiés dans une GitHub Release « latest » du dépôt GitHub du
// desktop par le workflow CI (desktop/.github/workflows/build-windows.yml)
// puis téléchargés depuis le site.
//
// ⚠️ À CONFIGURER : remplacez par votre dépôt GitHub du desktop, ex. :
//   export const GITHUB_DESKTOP_REPO = 'elvis-nak26code/track-performance-desktop';
// Tant que ça reste vide, la section « version desktop » affiche une note de
// prise de contact (aucun lien mort) et le bouton du menu amène à la section.
//
// Noms d'artefacts publiés par le workflow (à maintenir alignés sur ce qui est
// généré dans desktop/release) :
//   - BlackTracker Setup <version>.exe          (NSIS, Windows)
//   - BlackTracker-<version>.AppImage           (Linux)
//   - blacktracker-desktop_<version>_amd64.deb  (Linux)
export const GITHUB_DESKTOP_REPO = '';

const RELEASE_BASE = GITHUB_DESKTOP_REPO
  ? `https://github.com/${GITHUB_DESKTOP_REPO}/releases/latest/download`
  : '';

const VERSION = '1.0.0';

export const DESKTOP_DOWNLOADS = [
  {
    id: 'windows',
    label: 'Windows',
    hint: 'Installateur (recommandé)',
    files: [
      RELEASE_BASE && {
        name: 'Installateur .exe',
        url: `${RELEASE_BASE}/BlackTracker%20Setup%20${VERSION}.exe`,
      },
    ].filter(Boolean),
  },
  {
    id: 'linux',
    label: 'Linux',
    hint: 'AppImage',
    files: [
      RELEASE_BASE && {
        name: 'AppImage (.AppImage)',
        url: `${RELEASE_BASE}/BlackTracker-${VERSION}.AppImage`,
      },
      RELEASE_BASE && {
        name: 'Paquet .deb',
        url: `${RELEASE_BASE}/blacktracker-desktop_${VERSION}_amd64.deb`,
      },
    ].filter(Boolean),
  },
];

export const PRIMARY_DOWNLOAD_URL =
  RELEASE_BASE && `${RELEASE_BASE}/BlackTracker%20Setup%20${VERSION}.exe`;