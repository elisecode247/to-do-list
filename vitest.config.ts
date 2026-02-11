import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
    plugins: [
        tsconfigPaths(), // ✅ makes Vitest respect tsconfig/Vite path aliases
    ],
    test: {
        globals: true,
        environment: 'node', // or 'jsdom' if needed
        exclude: ['node_modules/**', 'dist/**'],
    },

    resolve: {
        // Prevent Vite from trying to bundle node_modules ESM
        conditions: ['node'],
    },

})
