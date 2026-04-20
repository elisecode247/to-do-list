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
            "utilities/*": "/src/utilities/*",
            "components/*": "/src/components/*",
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    // React core (must load first)
                    if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/scheduler')) {
                        return 'react-core-vendor';
                    }
                    if (id.includes('node_modules/react')) {
                        return 'react-vendor';
                    }
                    // MDX Editor (huge, lazy-loaded)
                    if (id.includes('@mdxeditor/editor') || id.includes('lexical')) {
                        return 'editor-vendor';
                    }
                    // UI utilities
                    if (id.includes('@dnd-kit') || id.includes('wouter') || id.includes('usehooks-ts')) {
                        return 'ui-vendor';
                    }
                    // rest of node_modules
                    if (id.includes('node_modules')) {
                        return 'vendor';
                    }
                },
            },
        },
    },
})
