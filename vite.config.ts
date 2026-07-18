import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
    base: '/',
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
            "utilities/*": "/src/utilities/*",
            "components/*": "/src/components/*",
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) {
                        return 'react-core-vendor';
                    }

                    if (
                        id.includes('/node_modules/@dnd-kit/') ||
                        id.includes('/node_modules/wouter/') ||
                        id.includes('/node_modules/usehooks-ts/')
                    ) {
                        return 'ui-vendor';
                    }

                    // Leave feature dependencies to Rollup. Explicitly
                    // grouping the editor or every unmatched package can pull
                    // lazy-only code into the initial modulepreload graph.
                }
            },
        },
    },
})
