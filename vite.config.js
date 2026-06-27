import { defineConfig } from 'vite';

// Relatieve base zodat de build ook werkt onder een subpad
// (bv. GitHub Pages: https://user.github.io/lampion-j1701/).
export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: false,
  },
});
