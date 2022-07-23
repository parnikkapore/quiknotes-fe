import { emptyPDF, addPDFAsync } from "./pdf";
import { addImageAsync } from "./image";
import layout from "./layouter";
import React from "react";
import { Image, Rect } from "react-konva";
import Page from "./page";
import pageBkgImage from "./pageBkg.png";
import addButtonImage from "./plusButton.svg";
import useImage from "use-image";

function addPage([rawDoc, setRawDoc], pageNr) {
  const docPages = rawDoc.pages.slice();
  const currentPage = docPages[pageNr];
  docPages.splice(
    pageNr + 1,
    0,
    new Page({ width: currentPage.width, height: currentPage.height })
  );
  setRawDoc({ ...rawDoc, pages: docPages });
}

function DocumentRenderer(pageBkg) {
  return (props) =>
    props.doc.pages.map((page) =>
      page.image ? (
        <Image
          key={page.id}
          x={page.xpos}
          y={page.ypos}
          width={page.width}
          height={page.height}
          image={page.image[1]}
          fillPatternImage={pageBkg}
          fillPatternRepeat="repeat"
        />
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
}

function DocumentAddButtons(rawDoc, setRawDoc, addButton) {
  const RIGHT_MARGIN = 16;
  const SIZE = 50;

  return (props) =>
    props.doc.pages.map((page) => (
      <Image
        key={page.id}
        x={page.xpos + page.width + RIGHT_MARGIN}
        y={page.ypos + page.height - SIZE}
        width={SIZE}
        height={SIZE}
        image={addButton}
        cornerRadius={10}
        onMouseDown={(e) => {
          e.cancelBubble = true;
        }}
        onTouchStart={(e) => {
          e.cancelBubble = true;
        }}
        onClick={(e) => {
          addPage([rawDoc, setRawDoc], page.pageNumber);
          e.cancelBubble = true;
        }}
        onTouchEnd={(e) => {
          // touchClick does not exist :(
          addPage([rawDoc, setRawDoc], page.pageNumber);
          e.cancelBubble = true;
        }}
      />
    ));
}

export default function useDocument(docInfo) {
  const [pageBkg] = useImage(pageBkgImage);
  const [addButton] = useImage(addButtonImage);

  const [rawDoc, setRawDoc] = React.useState(emptyPDF);

  React.useEffect(() => {
    switch (true) {
      case docInfo.type === "":
        console.log("File type is empty?? - trying to open as PDF");
      // falls through
      case /application\/pdf/.test(docInfo.type):
        addPDFAsync(docInfo, setRawDoc);
        break;
      case /image\/.*/.test(docInfo.type):
        addImageAsync(docInfo, setRawDoc);
        break;
      default:
        console.log(`Unknown file type ${docInfo.type} opened!`);
    }

    // return () => URL.revokeObjectURL(docInfo.url);
  }, [docInfo]);

  const [laidDoc, setLaidDoc] = React.useState(emptyPDF);
  React.useEffect(() => {
    setLaidDoc(layout(rawDoc));
  }, [rawDoc]);

  const renderer = React.useMemo(() => DocumentRenderer(pageBkg), [pageBkg]);

  const addButtons = React.useMemo(
    () => DocumentAddButtons(rawDoc, setRawDoc, addButton),
    [rawDoc, setRawDoc, addButton]
  );

  return [laidDoc, renderer, addButtons];
}
