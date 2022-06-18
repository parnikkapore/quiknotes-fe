import { nanoid as rid } from "nanoid";

// useDocument/image.js - Image import

const imagePageTemplate = {
  id: "foo",
  pageNumber: 0,
  width: 0,
  height: 0,
  image: [null, null],
  source: { type: "image", original: null },
};

export function addImageAsync(url, setDoc, name = "Image") {
  const image = new window.Image();
  image.src = url;
  image.onload = function (e) {
    const page = Object.assign(Object.create(imagePageTemplate), {
      id: rid(),
      width: image.width,
      height: image.height,
      image: [null, image],
      source: { type: "image", original: image },
    });

    setDoc({
      name: name,
      pages: [page],
    });
  };
  image.onerror = function (e) {
    console.log("Image loading error", e);
  };
}
