// delFolder.js: Delete folders!
// Cr https://github.com/cypress-io/cypress-example-recipes/blob/master/examples/testing-dom__download/

const { rm } = require("fs");

function _deleteFolder(folderName, optional = true) {
  console.log("deleting folder %s", folderName);

  return new Promise((resolve, reject) => {
    rm(
      folderName,
      { maxRetries: 10, recursive: true, force: optional },
      (err) => {
          if (err) {
            console.error(err);
            return reject(err);
          }
        resolve(null);
      }
    );
  });
}

function pluginDelFolder(on, config) {
  on("task", {
    deleteFolder(name) {
      _deleteFolder(name, false);
    },
    deleteFolderOptional(name) {
      _deleteFolder(name, true);
    },
    deleteDownloads() {
      return _deleteFolder(config.downloadsFolder, true);
    },
  });
}

module.exports = {
  pluginDelFolder,
};
