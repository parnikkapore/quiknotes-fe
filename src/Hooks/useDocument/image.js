import { Image } from "react-konva";
// useDocument/image.js - Image import

const imagePageTemplate = {
  xpos: 0,
  ypos: 0,
  width: 0,
  height: 0,
  image: null,
  render() {
    return this.image ? (
      <Image x={this.xpos} y={this.ypos} image={this.image} />
    ) : (
      <></>
    );
  },
};

export function addImageAsync(url, setDoc, name = "Image") {
  const image = new window.Image();
  image.src = url;
  image.onload = function (e) {
    const page = Object.assign(Object.create(imagePageTemplate), {
      width: image.width,
      height: image.height,
      image: image,
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
