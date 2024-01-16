import type { UserConfig } from "@farmfe/core";
import solid from "vite-plugin-solid";
import postcss from "@farmfe/js-plugin-postcss";
import path from "node:path";

function defineFarmConfig(config: UserConfig) {
  return config;
}

export default defineFarmConfig({
  compilation: {
    resolve: {
      alias: {
        "~/": path.join(process.cwd(), "src"),
      },
    },
  },
  server: {
    port: 3000,
  },
  plugins: [postcss()],
  vitePlugins: [solid()],
});
