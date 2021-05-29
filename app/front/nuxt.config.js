export default {
  vue: {
    devtools: true,
  },
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'sushi-chat',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { charset: 'utf-8' },
      {
        name: 'viewport',
        content:
          'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1',
      },
      { hid: 'description', name: 'description', content: '' },
      {
        hid: 'og:url',
        property: 'og:url',
        content: 'https://sushi-chat-cyan.vercel.app/',
      },
      {
        hid: 'og:type',
        property: 'og:type',
        content: 'website',
      },
      {
        hid: 'og:title',
        property: 'og:title',
        content: 'sushi-chat',
      },
      {
        hid: 'og:description',
        property: 'og:description',
        content: 'プレゼンテーションはもっとおいしくなる。',
      },
      {
        hid: 'og:site_name',
        property: 'og:site_name',
        content: 'sushi-chat',
      },
      { property: 'twitter:card', content: 'summary' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ['@/assets/scss/app.scss'],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    [
      '@nuxt/typescript-build',
      {
        typeCheck: true,
        ignoreNotFoundWarnings: true,
      },
    ],
    '@nuxtjs/pwa',
  ],
  loaders: {
    ts: {
      silent: true,
    },
    tsx: {
      silent: true,
    },
  },

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    'nuxt-webfontloader',
    'socket.io-client',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {},

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},

  // WebFontLoader
  webfontloader: {
    google: {
      families: ['M PLUS 1p:100,400,700', 'Material Icons'],
    },
  },

  env: {
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:7000',
  },
}
