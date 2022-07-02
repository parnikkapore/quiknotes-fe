const { defineConfig } = require("cypress");
const { initPlugin: plugin_snapshots } = require('cypress-plugin-snapshots/plugin');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    "excludeSpecPattern": [
      "**/__snapshots__/*",
      "**/__image_snapshots__/*"
    ],
    setupNodeEvents(on, config) {
      // implement node event listeners here
      plugin_snapshots(on, config);
    },
  },
});
