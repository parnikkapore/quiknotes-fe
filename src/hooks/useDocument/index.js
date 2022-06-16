import { emptyPDF, addPDFAsync } from "./pdf";
import { addImageAsync } from "./image";
import layout from "./layouter";
import React from "react";
import { Image, Rect } from "react-konva";

export default function useDocument(docInfo) {
  const [rawDoc, setRawDoc] = React.useState(emptyPDF);

  React.useEffect(() => {
    switch (true) {
      case docInfo.type === "":
        console.log("File type is empty?? - trying to open as PDF");
      // falls through
      case /application\/pdf/.test(docInfo.type):
        addPDFAsync(docInfo.url, setRawDoc, docInfo.name);
        break;
      case /image\/.*/.test(docInfo.type):
        addImageAsync(docInfo.url, setRawDoc, docInfo.name);
        break;
      default:
        console.log(`Unknown file type ${docInfo.type} opened!`);
    }

    return () => URL.revokeObjectURL(docInfo.url);
  }, [docInfo]);

  const [laidDoc, setLaidDoc] = React.useState(emptyPDF);
  React.useEffect(() => {
    setLaidDoc(layout(rawDoc));
  }, [rawDoc]);

  const addPage = React.useMemo(
    () => (pageNr) => {
      const docPages = rawDoc.pages.slice();
      docPages.splice(pageNr + 1, 0, emptyPDF.pages[0]);
      setRawDoc({ ...rawDoc, pages: docPages });
    },
    [rawDoc]
  );

  const DocumentRenderer = React.useMemo(
    () => (props) => {
      return props.doc.pages.map((page) =>
        page.image ? (
          <React.Fragment key={page.id}>
            <Image
              key={page.id}
              x={page.xpos}
              y={page.ypos}
              image={page.image[1]}
            />
            <Rect
              x={page.xpos + page.width + 16}
              y={page.ypos + page.height - 50}
              width={50}
              height={50}
              fill="red"
              cornerRadius={10}
              onClick={(e) => {
                console.log(e);

                addPage(page.pageNumber);
                e.cancelBubble = true;
              }}
            />
          </React.Fragment>
        ) : (
          <>
            <Rect
              x={15}
              y={17}
              width={50}
              height={50}
              fill="violet"
              cornerRadius={10}
            />
          </>
        )
      );
    },
    [addPage]
  );

  return [laidDoc, DocumentRenderer];
}
