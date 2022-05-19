// Empty tool

const no_op = () => {};

const emptyTool = {
  canvasDraggable: true,

  handleTouchStart: no_op,
  handleTouchMove: no_op,
  handleTouchEnd: no_op,

  handleMouseDown: no_op,
  handleMouseMove: no_op,
  handleMouseUp: no_op,

  handlePointerDown: no_op,
  handlePointerMove: no_op,
  handlePointerUp: no_op,
  handlePointerCancel: no_op,

  _canvas: null,
};

export default function makeTool(entries) {
  return Object.assign(Object.create(emptyTool), entries);
}
