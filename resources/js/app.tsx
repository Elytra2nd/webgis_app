import './bootstrap';
import '../css/app.css';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import axios from 'axios';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Konfigurasi CSRF Token untuk Axios
const setupCSRF = () => {
    // Set default headers untuk semua request
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

    // Ambil CSRF token dari meta tag
    const token = document.head.querySelector('meta[name="csrf-token"]');
    if (token) {
        axios.defaults.headers.common['X-CSRF-TOKEN'] = token.getAttribute('content');
    }

    // Set base URL jika diperlukan
    axios.defaults.baseURL = window.location.origin;

    // Interceptor untuk refresh token jika expired
    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 419) {
                // CSRF token expired, refresh page untuk mendapatkan token baru
                console.warn('CSRF token expired, refreshing page...');
                window.location.reload();
            }
            return Promise.reject(error);
        }
    );
};

setupCSRF();

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.tsx`, import.meta.glob('./Pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
        delay: 250,
        includeCSS: true,
        showSpinner: false,
    },
});

document.addEventListener('inertia:start', () => {
    setupCSRF();
});
