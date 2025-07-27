import { defineConfig } from 'vite';

// Vite config for Neutralino-compatible hybrid apps
export default defineConfig({
    root: '.',
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        target: 'esnext',
        rollupOptions: {
            input: 'index.html'
        }
    },
    server: {
        port: 5173,
        strictPort: true,
        open: false,
        fs: {
            strict: true
        }
    }
});
