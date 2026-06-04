import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { traeBadgePlugin } from 'vite-plugin-trae-solo-badge';

function preloadEchartsPlugin(): Plugin {
  return {
    name: 'preload-echarts',
    enforce: 'post',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return html;
        const bundles = ctx.bundle;
        for (const key of Object.keys(bundles)) {
          if (key.startsWith('assets/echarts-') && key.endsWith('.js')) {
            const preloadTag = `<link rel="modulepreload" crossorigin href="/${key}">`;
            return html.replace('</head>', `${preloadTag}\n</head>`);
          }
        }
        return html;
      },
    },
  };
}

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          echarts: ['echarts'],
          lucide: ['lucide-react'],
        },
      },
    },
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    traeBadgePlugin({
      variant: 'dark',
      position: 'bottom-right',
      prodOnly: true,
      clickable: true,
      clickUrl: 'https://www.trae.ai/solo?showJoin=1',
      autoTheme: true,
      autoThemeTarget: '#root'
    }),
    tsconfigPaths(),
    preloadEchartsPlugin(),
  ],
})
