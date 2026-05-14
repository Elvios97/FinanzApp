import { copyFile, mkdir } from "node:fs/promises";
import { defineConfig } from "vite";

const staticRuntimeFiles = [
  "db.js",
  "category-chart.js",
  "app.js",
  "sw.js",
  "manifest.json",
  "icon-192.png",
  "icon-512.png",
];

export default defineConfig({
  plugins: [
    {
      name: "copy-classic-runtime-files",
      apply: "build",
      async closeBundle() {
        await mkdir("dist", { recursive: true });
        await Promise.all(staticRuntimeFiles.map(file => copyFile(file, `dist/${file}`)));
      },
    },
  ],
});
