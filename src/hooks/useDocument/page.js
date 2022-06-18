import { nanoid as rid } from "nanoid";
import { Image } from "react-konva";

export default class Page {
  constructor(params) {
    Object.assign(this, {
      id: rid(),
      pageNumber: 0,
      name: "Empty page",
      width: 0,
      height: 0,
      image: [],
      render() {
        return this.image ? (
          <Image key={this.id} x={this.xpos} y={this.ypos} image={this.image[1]} />
        ) : (
          <></>
        );
      },
    });
    Object.assign(this, params);
  }
}
