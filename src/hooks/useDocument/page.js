import { nanoid as rid } from "nanoid";

export default class Page {
  constructor(params = {}) {
    Object.assign(this, {
      id: rid(),
      pageNumber: 0,
      name: "Empty page",
      width: 0,
      height: 0,
      image: [],
      source: { type: "new" },
    });
    Object.assign(this, params);
  }
}
