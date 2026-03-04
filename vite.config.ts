import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    tsconfigPaths(),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    visualizer({
      filename: "stats.html",
      emitFile: true,
      template: "treemap",
    }),
  ],
  resolve: {
    alias: {
      "src/*": "/src/*",
      "app/*": "/src/app/*",
      "category-select/*": "/src/category-select/*",
      "checklist/*": "/src/checklist/*",
      "item-modal": "/src/item-modal",
      "item-modal/*": "./src/item-modal/*",
      "sortable-item/*": "/src/sortable-item/*",
      "utilities/*": "/src/utilities/*"
    },
  },
})
