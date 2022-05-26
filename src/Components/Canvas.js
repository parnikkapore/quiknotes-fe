import React, { useCallback, useEffect } from "react";
import { Layer, Line, Star } from "react-konva";
import ScrollableStage from "./ScrollableStage";
import { usePDFRenderer } from "./pdfPage";
import "./Canvas.css";

// === For undo & redo =====

let history = [[]];
let historyStep = 0;

export default function Canvas(props) {
  // === Paint functionality =====

  const [tool, setTool] = React.useState("pen");
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
    setLines(lines.slice(0, -1).concat(lastLine));
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    let newLines = lines;

    // if there's only one point, dupe it so it draws properly
    const lastLine = lines[lines.length - 1];
    if (lastLine.points.length === 2) {
      newLines = lines.slice(0, -1);
      newLines.push({
        ...lastLine,
        points: lastLine.points.concat(lastLine.points),
      });
      setLines(newLines);
    }

    // add to history
    history = history.slice(0, historyStep + 1);
    history = history.concat([newLines]);
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

    if (event.ctrlKey === true || event.metaKey === true) {
      switch (event.key) {
        case "z":
          event.preventDefault();
          handleUndo();
          break;
        case "y":
        case "Z":
          event.preventDefault();
          handleRedo();
          break;
        default:
          // Do nothing
          break;
      }
    }
  }, []);


  useEffect(() => {
    // attach the event listener
    document.addEventListener("keydown", handleKeyPress);

    // remove the event listener
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  // === File opening and saving =====

  const [docURL, setDocURL] = React.useState("/test1.pdf");
  const docPDF = usePDFRenderer(docURL);

  function handlePDFOpen(e) {
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onload = (e) => {
      history = [[]];
      historyStep = 0;
      setLines([]);

      setDocURL(e.target.result);
    };
    reader.readAsArrayBuffer(file);
  }

  const the_stage = React.useRef(null);

  function handleExportImage(e) {
    // https://stackoverflow.com/a/15832662/512042
    function downloadURI(uri, name) {
      var link = document.createElement("a");
      link.download = name;
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    const stage = the_stage.current;

    const oldAttrs = { ...stage.getAttrs() };
    stage.position({ x: 0, y: 0 });
    stage.scale({ x: 1, y: 1 });

    var dataURL = stage.toDataURL({
      pixelRatio: 3,
      x: 0,
      y: 0,
      width: docPDF.width,
      height: docPDF.height,
    });
    downloadURI(dataURL, "export.png");

    stage.setAttrs(oldAttrs);
  }

  // === Canvas resize =====

  const stage_container = React.useRef(null);

  const handleResize = React.useCallback(
    (e) => {
      the_stage.current.width(stage_container.current.offsetWidth);
      the_stage.current.height(stage_container.current.offsetHeight);
    },
    [the_stage, stage_container]
  );

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  return (
    <div id="canvas">
      <div id="toolbar">
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
          <input
            type="file"
            accept="application/pdf"
            onChange={handlePDFOpen}
          ></input>
        </span>
        <span>
          <button onClick={handleExportImage}>Export as image</button>
        </span>
      </div>
      <div id="stage-container" ref={stage_container}>
        <ScrollableStage
          ref={the_stage}
          enabled={tool === "drag"}
          width={window.innerWidth}
          height={window.innerHeight}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          onMouseDown={tool !== "drag" ? handleMouseDown : () => {}}
          onMouseUp={tool !== "drag" ? handleMouseUp : () => {}}
          onMouseMove={tool !== "drag" ? handleMouseMove : () => {}}
        >
          <Layer>
            <Star
              key={"A"}
              id="1"
              x={100}
              y={150}
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
              id="2"
              x={300}
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
            {docPDF.render()}
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke="#df4b26"
                strokeWidth={5}
                tension={0.5}
                lineCap="round"
                globalCompositeOperation={
                  line.tool === "eraser" ? "destination-out" : "source-over"
                }
              />
            ))}
          </Layer>
        </ScrollableStage>
      </div>
    </div>
  );
}
