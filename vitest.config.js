// vitest.config.js — Pruebas unitarias. Uso: npm run test:unit.
import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@utils': path.resolve(__dirname, './src/utils'),
            '@store': path.resolve(__dirname, './src/store'),
            '@services': path.resolve(__dirname, './src/services'),
            '@features': path.resolve(__dirname, './src/features'),
        },
    },
    test: {
        environment: 'node',
        include: ['src/**/*.test.js'],
        // env.js exige VITE_API_BASE_URL al importarse.
        env: { VITE_API_BASE_URL: 'http://api.test/api/v1/', VITE_APP_VERSION: '1.1.7' },
    },
});
