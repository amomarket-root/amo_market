import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import compression from 'vite-plugin-compression';

export default defineConfig({
    plugins: [
        react(),
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            refresh: true,
        }),
        compression({
            algorithm: 'gzip',
            ext: '.gz',
            threshold: 10240,
            deleteOriginFile: false,
        }),
    ],
    // server: {
    //     port: 3000, // Different from Project 1's Vite port
    //     host: 'localhost',
    //     strictPort: true, // Prevents automatic port fallback
    // },
    build: {
        assetsInlineLimit: 0,
    },
});
