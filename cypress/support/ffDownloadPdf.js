// ffDownloadPdf.js: Tell Firefox to download PDFs instead of opening them
// Cr https://docs.cypress.io/api/plugins/browser-launch-api#Support-unique-file-download-mime-types

function pluginFfDownloadPdf(on, config) {
  on("before:browser:launch", (browser, options) => {
    // only Firefox requires all mime types to be listed
    if (browser.family === "firefox") {
      const existingMimeTypes =
        options.preferences["browser.helperApps.neverAsk.saveToDisk"];
      const myMimeType = "application/pdf";

      // prevents the browser download prompt
      options.preferences[
        "browser.helperApps.neverAsk.saveToDisk"
      ] = `${existingMimeTypes},${myMimeType}`;

      return options;
    }
  });
}

module.exports = {
  pluginFfDownloadPdf,
};
