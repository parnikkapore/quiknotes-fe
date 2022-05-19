import { Image } from "react-konva";
import React from "react";
import * as pdfjs from "pdfjs-dist/webpack";

// Functions for handling PDF pages

const pdfTemplate = {
  image: null,
  xpos: 0,
  ypos: 0,
  width: 0,
  height: 0,
  render() {
    return <Image x={this.xpos} y={this.ypos} image={this.image} />;
  },
};

export const emptyPDF = pdfTemplate;

export function addPDFAsync(url, setDoc, xpos = 0, ypos = 0) {
  const result = Object.assign(Object.create(pdfTemplate), { xpos, ypos });
  const loadingTask = pdfjs.getDocument(url);
  loadingTask.promise.then(
    (pdf) => {
      console.log("PDF loaded");

      // Fetch the first page
      const pageNumber = 1;
      pdf.getPage(pageNumber).then((page) => {
        console.log("Page loaded");

        const scale = 1.5;
        const viewport = page.getViewport({ scale: scale });

        // Prepare canvas using PDF page dimensions
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        result.width = viewport.width;
        result.height = viewport.height;
        canvas.height = result.height;
        canvas.width = result.width;

        // Render PDF page into canvas context
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        const renderTask = page.render(renderContext);
        renderTask.promise.then(() => {
          console.log("Page rendered");
          result.image = canvas;
          setDoc(result);
        });
      });
    },
    function (reason) {
      // PDF loading error
      console.error(reason);
    }
  );
}
