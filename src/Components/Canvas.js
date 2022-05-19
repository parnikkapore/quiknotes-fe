import React, { useCallback, useEffect } from "react";
import { Layer, Line, Star } from "react-konva";
import ScrollableStage from "./ScrollableStage";
import PDFPageContents from "./PDFPageContents";
import "./Canvas.css";

// === For undo & redo =====

let history = [
  [],
];
let historyStep = 0;

export default function Canvas(props) {
  // === Paint functionality =====

  const [tool, setTool] = React.useState('pen');
  const [lines, setLines] = React.useState([]);
  const isDrawing = React.useRef(false);

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getRelativePointerPosition();
    setLines([...lines, { tool, points: [pos.x, pos.y, pos.x, pos.y] }]);
  };

  const handleMouseMove = (e) => {
    // no drawing - skipping
    if (!isDrawing.current) {
      return;
    }

    const stage = e.target.getStage();
    const point = stage.getRelativePointerPosition();
    let lastLine = lines[lines.length - 1];
    // add point
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    // replace last
    lines.splice(lines.length - 1, 1, lastLine);
    setLines(lines.concat());

  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    // add to history
    history = history.slice(0, historyStep + 1);
    history = history.concat([lines]);
    historyStep += 1;
  };

  // === Undo and Redo ====

  const handleUndo = () => {
    if (historyStep === 0) {
      return;
    }
    historyStep -= 1;
    const previous = history[historyStep];
    setLines(previous);
  };

  const handleRedo = () => {
    if (historyStep === history.length - 1) {
      return;
    }
    historyStep += 1;
    const next = history[historyStep];
    setLines(next);
  };

  // === Undo keyboard shortcut ====

  const handleKeyPress = useCallback((event) => {
    event.preventDefault();
    if (event.ctrlKey === true || event.metaKey === true) {
      if (event.key === 'z'){
        handleUndo();
      }
      if (event.key === 'y'){
        handleRedo();
      }
    }
  }, []);

  useEffect(() => {
    // attach the event listener
    document.addEventListener('keydown', handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

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
      <button onClick={handleUndo}>undo</button>
      <button onClick={handleRedo}>redo</button>
      <ScrollableStage
        id="canvas"
        enabled={tool === "drag"}
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={tool !== "drag" ? handleMouseDown : () => { }}
        onMouseUp={tool !== "drag" ? handleMouseUp : () => { }}
        onMouseMove={tool !== "drag" ? handleMouseMove : () => { }}
      >
        <Layer>
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
      </ScrollableStage>
    </>
  );
}