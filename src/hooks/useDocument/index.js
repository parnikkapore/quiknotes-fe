import { emptyPDF, addPDFAsync } from "./pdf";
import { addImageAsync } from "./image";
import React from "react";

export default function useDocument(docInfo) {
  const [doc, setDoc] = React.useState(emptyPDF);

  function onUpdate(docInfo) {
    switch (true) {
      case docInfo.type === "":
        console.log("File type is empty?? - trying to open as PDF");
      // falls through
      case /application\/pdf/.test(docInfo.type):
        addPDFAsync(docInfo.url, setDoc, docInfo.name);
        break;
      case /image\/.*/.test(docInfo.type):
        addImageAsync(docInfo.url, setDoc, docInfo.name);
        break;
      default:
        console.log(`Unknown file type ${docInfo.type} opened!`);
    }

    return () => URL.revokeObjectURL(docInfo.url);
  }

  React.useEffect(() => {
    return onUpdate(docInfo);
  }, [docInfo]);

  return doc;
}
