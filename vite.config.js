import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Twee build-modi:
//   npm run build         → normale statische build in dist/ (los index.html + JS)
//   npm run build:single  → mode 'standalone': alles (JS + CSS) inline in één
//                           dist-standalone/index.html → dubbelklikbaar in Chrome,
//                           geen server nodig, kan ook als artifact geplakt worden.
export default defineConfig(({ mode }) => {
  const standalone = mode === 'standalone';
  return {
    base: './',
    plugins: standalone ? [viteSingleFile()] : [],
    build: {
      target: 'es2020',
      outDir: standalone ? 'dist-standalone' : 'dist',
      sourcemap: false,
    },
  };
});
