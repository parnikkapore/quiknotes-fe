import React, { useCallback, useEffect } from "react";
import { Layer, Line, Star } from "react-konva";
import { PDFDocument } from "pdf-lib";
import ScrollableStage from "./ScrollableStage";
import useDocument from "../Hooks/useDocument";
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
    if (isDrawing.current === false) {
      return;
    }

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

  const [docInfo, setDocInfo] = React.useState({
    name: "Test PDF",
    type: "application/pdf",
    url: "/test1.pdf",
  });
  const doc = useDocument(docInfo);

  function handleFileOpen(e) {
    const file = e.target.files[0];

    history = [[]];
    historyStep = 0;
    setLines([]);

    setDocInfo({
      name: file.name.replace(/\.[^/.]+$/, ""),
      type: file.type,
      url: URL.createObjectURL(file),
    });
  }

  const the_stage = React.useRef(null);
  const the_layer = React.useRef(null);

  const RASTERIZER_DPR = 3;

  function rasterizePage(pageNumber) {
    const stage = the_stage.current;
    const { x: minX, width } = the_layer.current.getClientRect({
      skipTransform: true,
    });

    const oldAttrs = { ...stage.getAttrs() };
    let dataURL = null;
    try {
      stage.position({ x: 0, y: 0 });
      stage.scale({ x: 1, y: 1 });

      dataURL = stage.toDataURL({
        pixelRatio: RASTERIZER_DPR,
        x: minX,
        y: doc.pages[pageNumber].ypos,
        width: width,
        height: doc.pages[pageNumber].height,
      });
    } finally {
      stage.setAttrs(oldAttrs);
    }

    return dataURL;
  }

  // https://stackoverflow.com/a/15832662/512042
  function downloadURI(uri, name) {
    var link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleExportImage(e) {
    downloadURI(rasterizePage(0), doc.name);
  }

  function handleExportRasterPDF(e) {
    async function _handleExportRasterPDF(e) {
      const pdf = await PDFDocument.create();

      for (const [i, _] of doc.pages.entries()) {
        const pdfImg = await pdf.embedPng(rasterizePage(i));
        const pdfImgDims = pdfImg.scale(1 / RASTERIZER_DPR);
        const pdfPage = pdf.addPage([pdfImgDims.width, pdfImgDims.height]);
        pdfPage.drawImage(pdfImg, {
          width: pdfImgDims.width,
          height: pdfImgDims.height,
        });
      }

      downloadURI(await pdf.saveAsBase64({ dataUri: true }), doc.name);
    }

    _handleExportRasterPDF(e);
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
          <span>{"Open file: "}</span>
          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={handleFileOpen}
          ></input>
        </span>
        <button onClick={handleExportImage}>Export as image</button>
        <button onClick={handleExportRasterPDF}>Export as bitmap PDF</button>
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
          <Layer ref={the_layer}>
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
            {doc.pages[0].render()}
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
