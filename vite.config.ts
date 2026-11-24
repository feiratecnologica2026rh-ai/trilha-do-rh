import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// base relativo: funciona em https://usuario.github.io/qualquer-nome-de-repo/
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
});
