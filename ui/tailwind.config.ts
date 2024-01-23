import type { Config } from "tailwindcss";
const { createThemes } = require("tw-colors");

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{html,js,jsx,md,mdx,ts,tsx}"],
  presets: [require("./ui.preset.js")],
  plugins: [
    createThemes({
      light: {
        primary: "#ffffff",
        secondary: "#efefef",
        "800": "#dcdcdc",
        "700": "#bdbdbd",
        "600": "#989898",
        "500": "#7c7c7c",
        "400": "#656565",
        "300": "#525252",
        "200": "#464646",
        "100": "#3d3d3d",
        "50": "#292929"
      },
      blackout: {
        "50": "#f2f2f2",
        "100": "#d9d9d9",
        "200": "#bfbfbf",
        "300": "#a6a6a6",
        "400": "#8c8c8c",
        "500": "#737373",
        "600": "#595959",
        "700": "#404040",
        "800": "#262626",
        secondary: "#0d0d0d",
        primary: "#000000"
      },
      logan: {
        "50": "#f8f8fa",
        "100": "#f2f3f5",
        "200": "#e7e6ee",
        "300": "#d3d3df",
        "400": "#bbb9cc",
        "500": "#aaa7bf",
        "600": "#8984a3",
        "700": "#777190",
        "800": "#645e79",
        secondary: "#534e64",
        primary: "#353342"
      },
      lavender: {
        "50": "#fbf8fc",
        "100": "#f6eef9",
        "200": "#f0e0f4",
        "300": "#e4c7eb",
        "400": "#d2a2de",
        "500": "#be7ece",
        "600": "#b471c3",
        "700": "#944da3",
        "800": "#7c4386",
        secondary: "#65376c",
        primary: "#461e4d"
      },
      blue: {
        "50": "#f4f6fb",
        "100": "#e8ecf6",
        "200": "#cbd8ec",
        "300": "#9db6dc",
        "400": "#6990c7",
        "500": "#4672b1",
        "600": "#4B5563",
        "700": "#374151",
        "800": "#374151",
        secondary: "#1F2937",
        primary: "#111827"
      }
    })
  ]
} satisfies Config;
