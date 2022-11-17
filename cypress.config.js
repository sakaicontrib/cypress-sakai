const { defineConfig } = require('cypress')

module.exports = defineConfig({
  defaultCommandTimeout: 18000,
  video: false,
  projectId: 'ggdvuy',
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://127.0.0.1:8080',
    excludeSpecPattern: '**/examples/*.spec.js',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
  },
})
