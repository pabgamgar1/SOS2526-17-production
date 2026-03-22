import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		proxy: {
			// Esto redirige todas las llamadas que empiecen por /api al backend
			'/api': {
				target: 'http://localhost:3000',
				changeOrigin: true
			}
		}
	}
});
