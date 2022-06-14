import { Image } from "react-konva";
import React from "react";
import * as pdfjs from "pdfjs-dist/webpack";
import { nanoid as rid } from "nanoid";

// Functions for handling PDF pages

const pdfPageTemplate = {
  id: "foo",
  pageNumber: 0,
  name: "Document",
  xpos: 0,
  ypos: 0,
  width: 0,
  height: 0,
  image: {},
  render() {
    return this.image ? (
      <Image key={this.id} x={this.xpos} y={this.ypos} image={this.image[1]} />
    ) : (
      <></>
    );
  },
};

export const emptyPDF = { name: "None", pages: [pdfPageTemplate] };

export async function addPDFAsync(url, setDoc, name = "Document") {
  const docP = pdfjs.getDocument(url).promise;

  const pagesP = await docP.then((pdf) => {
    console.log("PDF loaded");

    return Array.from(Array(pdf.numPages), (_, i) => pdf.getPage(i + 1));
  });

  const parsedPagesP = pagesP.map((pageP) =>
    pageP.then(async (page) => {
      console.log("Page loaded");

      const scale = 1.0;
      const viewport = page.getViewport({ scale: scale });

      return {
        viewport: viewport,
        width: viewport.width,
        height: viewport.height,
        page: page,
      };
    })
  );

  // Sets the x and y positions of the pages. The x position is always 0, while
  // the Y position is 0 for the first page and MARGIN pixels below the last
  // page's bottom for the remaining.
  //
  // All this is accomplished via an ungodly chain of promises.

  const locatedPagesP = [];
  const MARGIN = 16;
  locatedPagesP.push(
    parsedPagesP[0].then((page) => ({ ...page, xpos: 0, ypos: 0 }))
  );
  for (let i = 1; i < parsedPagesP.length; i++) {
    locatedPagesP.push(
      Promise.all([locatedPagesP[i - 1], parsedPagesP[i]]).then(
        ([last, now]) => {
          return {
            ...now,
            xpos: last.xpos,
            ypos: last.ypos + last.height + MARGIN,
          };
        }
      )
    );
  }

  const renderedPagesP = locatedPagesP.map((pageP) =>
    pageP.then(async (page) => {
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
    })
  );

  try {
    const renderedPages = await Promise.all(renderedPagesP);
    const pages = renderedPages.map((pageInfo, i) =>
      Object.assign(Object.create(pdfPageTemplate), {
        id: rid(),
        pageNumber: i,
        xpos: pageInfo.xpos,
        ypos: pageInfo.ypos,
        width: pageInfo.width,
        height: pageInfo.height,
        image: { 1: pageInfo.image },
      })
    );
    console.log("Pages rendered");
    setDoc({
      name: name,
      pages: pages,
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
