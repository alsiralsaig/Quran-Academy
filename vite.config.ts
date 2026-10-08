import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import { defineConfig } from 'vite';

// ملاحظة أمنية: مفتاح Gemini ما بيتحط في كود المتصفح أبداً — بيُستعمل من السيرفر فقط (server/ai.ts).
export default defineConfig(() => {
  return {
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(''),
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(''),
      'import.meta.env.GEMINI_API_KEY': JSON.stringify(''),
    },
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'logo.png', 'banner.png'],
        workbox: {
          // طلبات الـ API ما بتتخزّن ولا بتتحوّل لصفحة التطبيق
          navigateFallbackDenylist: [/^\/api\//],
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
        },
        manifest: {
          id: '/',
          name: 'أكاديمية القرآن الكريم',
          short_name: 'أكاديمية القرآن',
          description: 'منصة متكاملة لإدارة حلقات تحفيظ القرآن الكريم مع المصحف المباشر والأذكار',
          theme_color: '#042f2e',
          background_color: '#0f172a',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      allowedHosts: true as const,
      // في التطوير: طلبات ‎/api بتمشي لسيرفر الـ API المحلي (npm run dev:api)
      proxy: {
        '/api': { target: `http://127.0.0.1:${process.env.API_PORT || 3001}`, changeOrigin: false },
      },
    },
    preview: {
      allowedHosts: true as const,
      proxy: {
        '/api': { target: `http://127.0.0.1:${process.env.API_PORT || 3001}`, changeOrigin: false },
      },
    },
  };
});
