import { Image } from "react-konva";
import React from "react";
import * as pdfjs from "pdfjs-dist/webpack";

// Functions for handling PDF pages

const pdfPageTemplate = {
  name: "Document",
  xpos: 0,
  ypos: 0,
  width: 0,
  height: 0,
  image: {},
  render() {
    return this.image ? (
      <Image x={this.xpos} y={this.ypos} image={this.image[1]} />
    ) : (
      <></>
    );
  },
};

export const emptyPDF = { name: "None", pages: [pdfPageTemplate] };

export async function addPDFAsync(url, setDoc, name = "Document") {
  const docP = pdfjs.getDocument(url).promise;

  const pagesP = [
    docP.then((pdf) => {
      console.log("PDF loaded");

      // Fetch the first page
      const pageNumber = 1;
      return pdf.getPage(pageNumber);
    }),
  ];

  const parsedPagesP = [
    pagesP[0].then(async (page) => {
      console.log("Page loaded");

      const scale = 1.0;
      const viewport = page.getViewport({ scale: scale });

      return {
        viewport: viewport,
        width: viewport.width,
        height: viewport.height,
        page: page,
      };
    }),
  ];

  const locatedPagesP = [
    parsedPagesP[0].then((page) => {
      return { ...page, xpos: 0, ypos: 0 };
    }),
  ];

  const renderedPagesP = [
    locatedPagesP[0].then(async (page) => {
      // Prepare canvas using PDF page dimensions
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = page.width;
      canvas.height = page.height;

      // Render PDF page into canvas context
      const renderContext = {
        canvasContext: context,
        viewport: page.viewport,
      };
      await page.page.render(renderContext).promise;

      return {
        ...page,
        image: canvas,
      };
    }),
  ];

  try {
    const pageInfo = await renderedPagesP[0];
    console.log("Page rendered");
    const page = Object.assign(Object.create(pdfPageTemplate), {
      xpos: pageInfo.xpos,
      ypos: pageInfo.ypos,
      width: pageInfo.width,
      height: pageInfo.height,
      image: { 1: pageInfo.image },
    });
    setDoc({
      name: name,
      pages: [page],
    });
  } catch (e) {
    // PDF loading error
    console.error(e);
  }
}

export function usePDFRenderer(pdfURL) {
  const [pdfDoc, setPDFDoc] = React.useState(emptyPDF);
  React.useEffect(() => {
    addPDFAsync(pdfURL, setPDFDoc);
  }, [pdfURL]);
  return pdfDoc;
}
