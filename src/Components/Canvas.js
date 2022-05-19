import React from "react";
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
  
  // === File opening and saving =====
  
  const [docPDF, setDocPDF] = React.useState("/test1.pdf");
  
  function handlePDFOpen(e) {
    const file = e.target.files[0];
    
    function readBlob(blob) {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.addEventListener('load', () => resolve(reader.result));
          reader.addEventListener('error', reject)
          reader.readAsDataURL(blob);
      })
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      history = [[]];
      historyStep = 0;
      setLines([]);
      
      setDocPDF(e.target.result);
    }
    reader.readAsDataURL(file);
  }

  const the_canvas = React.useRef(null);
  
  function handleExportImage(e) {
    // https://stackoverflow.com/a/15832662/512042
    function downloadURI(uri, name) {
      var link = document.createElement('a');
      link.download = name;
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    const stage = the_canvas.current;
    
    const oldAttrs = {...stage.getAttrs()};
    stage.position({x: 0, y: 0});
    stage.scale({x: 1, y: 1});
    // stage.width = 
    
    var dataURL = stage.toDataURL({ pixelRatio: 3 });
    downloadURI(dataURL, 'export.png');
    
    console.log(oldAttrs);
    stage.setAttrs(oldAttrs);
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
      <button onClick={handleUndo}>undo</button>
      <button onClick={handleRedo}>redo</button>
      <span>
        <span>{"Open PDF: "}</span>
        <input type="file" accept="application/pdf" onChange={handlePDFOpen}></input>
      </span>
      <span>
        <button onClick={handleExportImage}>Export as image</button>
      </span>
      <ScrollableStage
        id="canvas"
        ref={the_canvas}
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
            x={900}
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
            x={1200}
            y={500}
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
          <PDFPageContents src={docPDF} x="0" y="0" />
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
