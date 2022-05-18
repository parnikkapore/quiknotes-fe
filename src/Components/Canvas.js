import React from "react";
import { Layer, Line, Star, Text } from "react-konva";
import ScrollableStage from "./ScrollableStage";
import PDFPageContents from "./PDFPageContents";
import "./Canvas.css";

export default function Canvas(props) {
  // === Paint functionality =====
  const [tool, setTool] = React.useState('pen');
  const [lines, setLines] = React.useState([]);
  const isDrawing = React.useRef(false);

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getRelativePointerPosition();
    setLines([...lines, { tool, points: [pos.x, pos.y] }]);
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
  };
  
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
    <ScrollableStage
      id="canvas"
      enabled={tool==="drag"}
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={tool!=="drag" ? handleMouseDown : ()=>{}}
      onMouseUp={tool!=="drag" ? handleMouseUp : ()=>{}}
      onMouseMove={tool!=="drag" ? handleMouseMove : ()=>{}}
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
    </ScrollableStage>
    </>
  );
}
