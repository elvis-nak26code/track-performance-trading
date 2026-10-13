// Vite build configuration for the trading journal frontend.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En mode "desktop" (vite build --mode desktop, utilisé par l'app Electron),
// on sort le build dans dist-desktop avec les variables du fichier .env.desktop.
// En mode desktop on utilise `public` (captures seulement) : les installateurs
// embarqués dans public-web/downloads ne doivent PAS alourdir le bundle de
// l'app de bureau (ils sont servis uniquement par le site web, dans `dist`).
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // En mode desktop, l'app est servie sous /app/ par le serveur local Electron.
  base: mode === 'desktop' ? '/app/' : '/',
  server: {
    port: 5173,
  },
  publicDir: mode === 'desktop' ? 'public' : 'public-web',
  build: {
    outDir: mode === 'desktop' ? 'dist-desktop' : 'dist',
  },
}));