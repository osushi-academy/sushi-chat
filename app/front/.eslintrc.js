module.exports = {
  env: {
    browser: true,
    node: true,
  },
  extends: [
    "@nuxtjs/eslint-config-typescript",
    // 'plugin:prettier/recommended',
    "prettier",
    "plugin:nuxt/recommended",
  ],
  plugins: [],
  rules: {
    "vue/script-setup-uses-vars": "off",
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
  },
}
