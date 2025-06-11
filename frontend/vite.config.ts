/// <reference types="vitest" />
import path from "path"
import tailwindcss from "@tailwindcss/vite"

import { defineConfig } from 'vite' // Removed UserConfig from here
import type { UserConfig } from 'vite' // Added type-only import for UserConfig
import react from '@vitejs/plugin-react'
import { configDefaults } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    ...configDefaults,
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
  },
} as UserConfig)
