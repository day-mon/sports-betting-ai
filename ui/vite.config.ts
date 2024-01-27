import { defineConfig, loadEnv } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig(({mode}) => {
  const lowercaseMode = mode.toLowerCase();
  loadEnv(lowercaseMode, `${process.cwd()}/env`);
  return {
    plugins: [solid()],
    server: {
      port: 3000,
      cors: false,
    },
    envDir: 'env',
    build: {
      target: 'es2020',
    },
    resolve: {
      alias: {
        '~': '/src',
      },
    },
  }
});
