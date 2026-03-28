import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import babel from '@rolldown/plugin-babel'

import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    allowedHosts: [
      "c693-2409-40c2-641f-7643-44b0-1a33-c4b-73e7.ngrok-free.app",
      "fd63-2409-40c2-641f-7643-b5c9-a58e-f0ad-5a6a.ngrok-free.app",
      ".ngrok-free.app"
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
