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
    return this.image ? (
      <Image x={this.xpos} y={this.ypos} image={this.image} />
    ) : (
      <></>
    );
  },
};

export const emptyPDF = pdfTemplate;

export async function addPDFAsync(url, setDoc, xpos = 0, ypos = 0) {
  const docP = pdfjs.getDocument(url).promise;
  const pageP = docP.then((pdf) => {
    console.log("PDF loaded");

    // Fetch the first page
    const pageNumber = 1;
    return pdf.getPage(pageNumber);
  });
  const renderedPageP = pageP.then(async (page) => {
    console.log("Page loaded");

    const scale = 1.0;
    const viewport = page.getViewport({ scale: scale });

    // Prepare canvas using PDF page dimensions
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Render PDF page into canvas context
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    await page.render(renderContext).promise;

    return canvas;
  });
  try {
    const canvas = await renderedPageP;
    console.log("Page rendered");
    const result = Object.assign(Object.create(pdfTemplate), {
      xpos,
      ypos,
      width: canvas.width,
      height: canvas.height,
      image: canvas,
    });
    setDoc(result);
  } catch (e) {
    // PDF loading error
    console.error(e);
  }
}

export function usePDFRenderer(pdfURL) {
  const [pdfDoc, setPDFDoc] = React.useState(pdfTemplate);
  React.useEffect(() => {
    addPDFAsync(pdfURL, setPDFDoc);
  }, [pdfURL]);
  return pdfDoc;
}
