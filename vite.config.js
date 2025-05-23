import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            // Tambahkan alias jika diperlukan
        },
    },
    optimizeDeps: {
        include: ['leaflet', 'leaflet-draw'],
        esbuildOptions: {
            // Opsi untuk membantu esbuild menangani paket yang bermasalah
            define: {
                global: 'globalThis',
            },
        },
    },
});
