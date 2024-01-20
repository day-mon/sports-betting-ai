import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid()],
  server: {
    port: 3000,
    cors: false,
  },
  build: {
    target: 'es2020',
  },
  resolve: {
    alias: {
      '~': '/src',
    },
  },
});
