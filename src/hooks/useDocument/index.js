import { emptyPDF, addPDFAsync } from "./pdf";
import { addImageAsync } from "./image";
import layout from "./layouter";
import React from "react";
import { Image } from "react-konva";

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

  window._ = window._ || {};
  window._.dupePage = () => {
    const nrdp = rawDoc.pages.slice();
    nrdp.splice(1, 0, { ...nrdp[0], id: "HELO" });
    console.log({ ...rawDoc, pages: nrdp });
    setRawDoc({ ...rawDoc, pages: nrdp });
  };

  return laidDoc;
}

export function Page(props) {
  const page = props.page;
  return page.image ? (
    <Image key={page.id} x={page.xpos} y={page.ypos} image={page.image[1]} />
  ) : (
    <></>
  );
}
