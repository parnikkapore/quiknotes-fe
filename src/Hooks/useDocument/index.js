import { emptyPDF, addPDFAsync } from "./pdf";
import React from "react";

export default function useDocument(docInfo) {
  const [doc, setDoc] = React.useState(emptyPDF);
  
  function onUpdate(docInfo) {
    addPDFAsync(docInfo.url, setDoc, docInfo.name);
  }
  
  React.useEffect(() => {
    onUpdate(docInfo);
  }, [docInfo]);
  
  return doc;
}
