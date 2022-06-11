import React, { useCallback, useEffect } from "react";
import { Layer, Line } from "react-konva";
import ScrollableStage from "./ScrollableStage";
import { usePDFRenderer } from "./pdfPage";
import { Button, Select, IconButton, MenuItem, Input } from "@mui/material";
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import IosShareIcon from '@mui/icons-material/IosShare';
import { SketchPicker } from 'react-color'
import reactCSS from 'reactcss'
import "./Canvas.css";


// === For undo & redo =====

let history = [[]];
let historyStep = 0;

export default function Canvas(props) {

  // === Paint functionality =====

  const [tool, setTool] = React.useState("pen");
  const [lines, setLines] = React.useState([]);
  const isDrawing = React.useRef(false);
  const [displayColorPicker, setDisplayColorPicker] = React.useState(false);
  const [color, setColor] = React.useState({
    r: '0',
    g: '0',
    b: '0',
    a: '1',
  });
  const [strokeColor, setStrokeColor] = React.useState("#000000");

  // === Color picker functionality =====

  const handleClick = () => {
    setDisplayColorPicker(!displayColorPicker);
  };

  const handleClose = () => {
    setDisplayColorPicker(false);
  };

  const handleChange = (color) => {
    setColor(color.rgb);
    setStrokeColor(color.hex);
    console.log(strokeColor);
  };

  const styles = reactCSS({
    'default': {
      color: {
        width: '36px',
        height: '14px',
        borderRadius: '2px',
        background: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
      },
      swatch: {
        padding: '5px',
        background: '#fff',
        borderRadius: '1px',
        boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
        display: 'inline-block',
        cursor: 'pointer',
      },
      popover: {
        position: 'absolute',
        zIndex: '2',
      },
      cover: {
        position: 'fixed',
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
      },
    },
  });

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getRelativePointerPosition();
    setLines([...lines, { tool, points: [pos.x, pos.y], color: strokeColor, opacity: 1 ,strokeWidth: 5}]);
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
    lastLine.color = strokeColor;
    if (tool === "highlighter") {
      lastLine.opacity = 0.5;
      lastLine.strokeWidth = 50;
    }

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
        color: lastLine.color.concat(lastLine.color),
        opacity: lastLine.opacity.concat(lastLine.opacity),
        strokeWidth: lastLine.strokeWidth.concat(lastLine.strokeWidth),
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
        <Select
          value={tool}
          label="Tool"
          onChange={(e) => {
            setTool(e.target.value);
          }}
        >
          <MenuItem value="pen">Pen</MenuItem>
          <MenuItem value="highlighter">Highlighter</MenuItem>
          <MenuItem value="eraser">Eraser</MenuItem>
          <MenuItem value="drag">Hand</MenuItem>
        </Select>
        <IconButton aria-label="Undo" onClick={handleUndo}>
          <UndoIcon />
        </IconButton>
        <IconButton aria-label="Redo" onClick={handleRedo}>
          <RedoIcon />
        </IconButton>
        <span>
          <span>{"Open PDF: "}</span>
          <Input
            type="file"
            accept="application/pdf"
            onChange={handlePDFOpen}
          ></Input>
        </span>
        <span>
          <Button onClick={handleExportImage} endIcon={<IosShareIcon />}>Export as image</Button>
        </span>
        <span>
          <div style={styles.swatch} onClick={handleClick}>
            <div style={styles.color} />
          </div>
          {displayColorPicker ? <div style={styles.popover}>
            <div style={styles.cover} onClick={handleClose} />
            <SketchPicker color={color} onChange={handleChange} />
          </div> : null}
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
          onMouseDown={tool !== "drag" ? handleMouseDown : () => { }}
          onMouseUp={tool !== "drag" ? handleMouseUp : () => { }}
          onMouseMove={tool !== "drag" ? handleMouseMove : () => { }}
        >
          <Layer>
            {docPDF.render()}
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.color}
                opacity={line.opacity}
                strokeWidth={line.strokeWidth}
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
