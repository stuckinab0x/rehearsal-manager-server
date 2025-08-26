import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cloudflare } from '@cloudflare/vite-plugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    include: /\.(js|jsx|ts|tsx)$/,
  }), 
  cloudflare({
    configPath: '../cloudflare/wrangler.jsonc',
    persistState: { path: '../cloudflare/.wrangler/state' },
  }),
  ],
  server: {
    host: true,
    port: 5173,
    hmr: { port: 5173 },
  },
});
