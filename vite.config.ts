import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		VitePWA({
			registerType: 'autoUpdate',
			workbox: {
				globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm}']
			},
			manifest: {
				name: 'Wattefakueat',
				short_name: 'WTF',
				description: 'What did I eat? Track your food with voice',
				theme_color: '#07071a',
				background_color: '#07071a',
				display: 'standalone',
				orientation: 'portrait',
				start_url: '/',
				icons: [
					{ src: '/icons/192.png', sizes: '192x192', type: 'image/png' },
					{ src: '/icons/512.png', sizes: '512x512', type: 'image/png' },
					{ src: '/icons/512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
				]
			}
		})
	]
});
