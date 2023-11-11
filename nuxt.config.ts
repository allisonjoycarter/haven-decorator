// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    'nuxt-icon'
  ],
  css: ['~/assets/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  runtimeConfig: {
    public: {
      posthogPublicKey: 'phc_pdfUOQFFBR8mzehV9TZmThswTqPcS2Tks0j6qkH4Va6',
      posthogHost: 'https://app.posthog.com'
    }
  },
  $production: {
    generate: {
      exclude: ['/planner/setup']
    }
  }
})
