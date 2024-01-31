const { defineConfig } = require('cypress')

module.exports = defineConfig({
  defaultCommandTimeout: 18000,
  pageLoadTimeout: 99000,
  video: false,
  projectId: 'ggdvuy',
  e2e: {
    baseUrl: 'http://127.0.0.1:8080',
    excludeSpecPattern: '**/examples/*.spec.js',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
  },
})
