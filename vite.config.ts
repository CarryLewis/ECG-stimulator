import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Offline / local-first: relative asset paths so `dist/` can be opened from a
// USB stick, shared folder, or any local static server — no cloud host required.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    // host:true so Cursor / cloud port-forwarding can reach the app;
    // still intended for local offline use, not public cloud hosting.
    host: true,
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
  },
})
