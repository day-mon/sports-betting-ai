import { defineConfig } from "@farmfe/core";
import solid from "vite-plugin-solid";
import postcss from "@farmfe/js-plugin-postcss";

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [postcss()],
  vitePlugins: [solid()],
});
