import React from "react";
import { Stage, Layer, Line, Star, Text } from "react-konva";
import PDFPageContents from "./PDFPageContents";
import HandTool from "./CanvasTools/Hand";
import PenTool from "./CanvasTools/Pen";
import "./Canvas.css";

export default function Canvas(props) {
  const [tool, setTool] = React.useState('pen');

  // pen
  const [lines, setLines] = React.useState([]);
  const isDrawing = React.useRef(false);

  const toolmap = {
    'pen': PenTool(tool, lines, setLines, isDrawing),
    'drag': HandTool(),
  }

  function handleStageWheel(e) {
    // prevent parent scrolling
    e.evt.preventDefault();
    const stage = e.currentTarget;
    // console.log(stage);

    function handleZoom(e) {
      const scaleBy = 1.02;
      var oldScale = stage.scaleX();
      var pointer = stage.getPointerPosition();

      var mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      var newScale = oldScale * Math.pow(scaleBy, e.evt.deltaY / -10);
      stage.scale({ x: newScale, y: newScale });

      var newPos = {
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      };
      stage.position(newPos);
    }

    function handleScroll(e) {
      const dx = e.evt.deltaX;
      const dy = e.evt.deltaY;

      const x = stage.x() - dx;
      const y = stage.y() - dy;

      stage.position({ x, y });
    }

    if (e.evt.ctrlKey) {
      handleZoom(e);
    } else {
      handleScroll(e);
    }
  }

  return (
    <>
      <select
        value={tool}
        onChange={(e) => {
          setTool(e.target.value);
        }}
      >
        <option value="pen">Pen</option>
        <option value="drag">Hand</option>
      </select>
      <Stage
        id="canvas"
        enabled={tool === "drag"}
        width={window.innerWidth}
        height={window.innerHeight}
        draggable={toolmap[tool].canvasDraggable ? "draggable" : false}
        onWheel={handleStageWheel}
        onMouseDown={toolmap[tool].handleMouseDown}
        onMouseMove={toolmap[tool].handleMouseMove}
        onMouseUp={toolmap[tool].handleMouseUp}
        onTouchStart={toolmap[tool].handleTouchStart}
        onTouchMove={toolmap[tool].handleTouchMove}
        onTouchEnd={toolmap[tool].handleTouchEnd}
      >
        <Layer>
          <Text text="Try to draw on the canvas!" />
          <Star
            key={"A"}
            id={1}
            x={100}
            y={100}
            numPoints={5}
            innerRadius={20}
            outerRadius={40}
            fill="#89b717"
            opacity={0.8}
            rotation={0}
            shadowColor="black"
            shadowBlur={10}
            shadowOpacity={0.6}
            shadowOffsetX={5}
            shadowOffsetY={5}
            scaleX={1}
            scaleY={1}
          />
          <Star
            key={"B"}
            id={2}
            x={300}
            y={300}
            numPoints={5}
            innerRadius={20}
            outerRadius={40}
            fill="#aaf"
            opacity={0.8}
            rotation={30}
            shadowColor="black"
            shadowBlur={10}
            shadowOpacity={0.6}
            shadowOffsetX={5}
            shadowOffsetY={5}
            scaleX={1}
            scaleY={1}
          />
          <PDFPageContents src="/test1.pdf" x="0" y="300" />
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke="#df4b26"
              strokeWidth={5}
              tension={0.5}
              lineCap="round"
              globalCompositeOperation={
                line.tool === 'eraser' ? 'destination-out' : 'source-over'
              }
            />
          ))}
        </Layer>
      </Stage>
    </>
  );
}
