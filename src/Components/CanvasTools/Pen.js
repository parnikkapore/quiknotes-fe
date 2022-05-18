
export default function PenTool(tool, lines, setLines, isDrawing) {
  function handleDown(e) {
    isDrawing.current = true;
    const pos = e.target.getStage().getRelativePointerPosition();
    setLines([...lines, { tool, points: [pos.x, pos.y, pos.x, pos.y] }]);
  };
  
  function handleMove(e) {
    // no drawing - skipping
    if (!isDrawing.current) {
      return;
    }
    
    e.evt.preventDefault();
    
    const stage = e.target.getStage();
    const point = stage.getRelativePointerPosition();
    let lastLine = lines[lines.length - 1];
    // add point
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    // replace last
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());
  };
  
  function handleUp() {
    isDrawing.current = false;
  };
  
  return {
    canvasDraggable: false,
    
    handleTouchStart: handleDown,
    handleTouchMove: handleMove,
    handleTouchEnd: handleUp,
    
    handleMouseDown: handleDown,
    handleMouseMove: handleMove,
    handleMouseUp: handleUp,
  }
}
