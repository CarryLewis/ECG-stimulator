import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Offline / local-first: relative asset paths so `dist/` can be opened from a
// USB stick, shared folder, or any local static server — no cloud host required.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    // Bind localhost only — this app is meant to run on the developer's machine,
    // not exposed as a cloud service.
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
    strictPort: true,
  },
})
