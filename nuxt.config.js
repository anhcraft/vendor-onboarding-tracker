import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  modules: ['nuxt-auth-utils'],
  css: ['~/assets/css/main.css'],
  alias: {
    '#lib': resolve(rootDir, 'lib'),
  },
  nitro: {
    alias: {
      '#lib': resolve(rootDir, 'lib'),
    },
  },
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
  },
})
