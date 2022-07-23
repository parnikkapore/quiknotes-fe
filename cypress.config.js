const { defineConfig } = require("cypress");
const {
  initPlugin: pluginSnapshots,
} = require("cypress-plugin-snapshots/plugin");
const { pluginFfDownloadPdf } = require("./cypress/support/ffDownloadPdf");
const { pluginDelFolder } = require("./cypress/support/delFolder");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    excludeSpecPattern: ["**/__snapshots__/*", "**/__image_snapshots__/*"],
    setupNodeEvents(on, config) {
      // implement node event listeners here
      pluginSnapshots(on, config);
      pluginFfDownloadPdf(on, config);
      pluginDelFolder(on, config);
    },
  },
});
