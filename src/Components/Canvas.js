import React, { useCallback, useEffect } from "react";
import Konva from "konva";
import { Layer, Line } from "react-konva";
import ScrollableStage from "./ScrollableStage";
import useDocument from "../hooks/useDocument";
import { PDFDocument } from "pdf-lib";
import { Button, IconButton, Input, Box, Slider } from "@mui/material";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import IosShareIcon from "@mui/icons-material/IosShare";
import { SketchPicker } from "react-color";
import reactCSS from "reactcss";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { AiOutlineHighlight } from "react-icons/ai";
import { BsPencil, BsEraser } from "react-icons/bs";
import { IoHandRightOutline } from "react-icons/io5";
import Tooltip, { tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import "./Canvas.css";
import { nanoid as rid } from "nanoid";
import CLine from "./Canvas/Line";

// === For undo & redo =====

let history = [[]];
let historyStep = 0;

export default function Canvas(props) {
  // === Paint functionality =====

  const [tool, setTool] = React.useState("pen");
  const [lines, setLines] = React.useState([]);
  const [currentLine, setCurrentLine] = React.useState(null);
  const [displayColorPicker, setDisplayColorPicker] = React.useState(false);
  const [color, setColor] = React.useState({
    r: "0",
    g: "0",
    b: "0",
    a: "1",
  });
  const [strokeColor, setStrokeColor] = React.useState("#000000");
  const [strokeWidth, setStrokeWidth] = React.useState(5);
  const [highlighterStrokeWidth, setHighlighterStrokeWidth] =
    React.useState(25);

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
  };

  const styles = reactCSS({
    default: {
      color: {
        width: "36px",
        height: "14px",
        borderRadius: "2px",
        background: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
      },
      swatch: {
        padding: "5px",
        background: "#fff",
        borderRadius: "1px",
        boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
        display: "inline-block",
        cursor: "pointer",
      },
      popover: {
        position: "absolute",
        zIndex: "2",
      },
      cover: {
        position: "fixed",
        top: "0px",
        right: "0px",
        bottom: "0px",
        left: "0px",
      },
    },
  });

  const handleMouseDown = (e) => {
    const pos = e.target.getStage().getRelativePointerPosition();
    setCurrentLine({
      id: rid(),
      tool,
      points: [pos.x, pos.y],
      color: strokeColor,
      opacity: 1,
      strokeWidth: strokeWidth,
    });
  };

  const handleMouseMove = (e) => {
    // no drawing - skipping
    if (currentLine === null) {
      return;
    }

    const stage = e.target.getStage();
    const point = stage.getRelativePointerPosition();

    setCurrentLine((_currentLine) => {
      const currentLine = { ..._currentLine };

      // add point
      currentLine.points = _currentLine.points.concat([point.x, point.y]);

      // update color
      currentLine.color = strokeColor;
      if (tool === "highlighter") {
        currentLine.opacity = 0.5;
        currentLine.strokeWidth = highlighterStrokeWidth;
      }

      return currentLine;
    });
  };

  const handleMouseUp = () => {
    if (currentLine === null) {
      return;
    }

    // if there's only one point, dupe it so it draws properly
    let lastLine =
      currentLine.points.length === 2
        ? {
            ...currentLine,
            points: currentLine.points.concat(currentLine.points),
          }
        : { ...currentLine };

    // Find the page that this line should belong to
    {
      let bestPage = "";
      let bestHeight = -Infinity;
      const lineBbox = new Konva.Line({
        points: lastLine.points,
        strokeWidth: lastLine.strokeWidth,
      }).getClientRect();

      for (const cPage of doc.pages) {
        const cHeight =
          Math.min(cPage.ypos + cPage.height, lineBbox.y + lineBbox.height) -
          Math.max(cPage.ypos, lineBbox.y);
        if (cHeight > bestHeight) {
          bestHeight = cHeight;
          bestPage = cPage.id;
        }
      }

      // console.log(doc.pagemap.get(bestPage).pageNumber);
      lastLine.page = bestPage;
    }

    // Convert all coordinates to page-relative
    lastLine.points = coordsToLocal(lastLine);

    // Finally make a new set of lines with our new line
    const newLines = lines.concat([lastLine]);

    // add to history
    history = history.slice(0, historyStep + 1);
    history = history.concat([newLines]);
    historyStep += 1;

    // clear current line
    setCurrentLine(null);

    setLines(newLines);
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
  const [doc, DocRenderer] = useDocument(docInfo);

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

  function handleExportVectorPDF(e) {
    async function _handleExportVectorPDF(e) {
      // 0. Open the PDF, if needed
      let stockPdf = null;
      if (docInfo.type === "application/pdf") {
        stockPdf = await PDFDocument.load(
          await fetch(docInfo.url).then((res) => res.arrayBuffer())
        );
      }

      // 1. Prepare the pages
      let docPdf = await PDFDocument.create();
      for (const page of doc.pages) {
        if (page.source.type === "pdf") {
          const copiedPages = await docPdf.copyPages(stockPdf, [
            page.source.pageNumber,
          ]);
          docPdf.addPage(copiedPages[0]);
        } else {
          const pdfImg = await docPdf.embedPng(rasterizePage(page.pageNumber));
          const pdfImgDims = pdfImg.scale(1 / RASTERIZER_DPR);
          const newPage = docPdf.addPage([pdfImgDims.width, pdfImgDims.height]);
          newPage.drawImage(pdfImg, {
            width: pdfImgDims.width,
            height: pdfImgDims.height,
          });
        }
      }
      // 2. Render the lines
      const pages = docPdf.getPages();
      for (const line of lines) {
        const pageObj = doc.pagemap.get(line.page);
        if (pageObj === undefined) {
          console.error(
            `Cannot find page ${line.page} in pagemap - skipping line ${line.id}!`
          );
          continue;
        }
        const pageId = pageObj.pageNumber;
        if (pageId === undefined) {
          console.error(
            `Page ${line.page} has corrupt page number - skipping line ${line.id}!`
          );
          continue;
        }

        let linePairs = [];
        for (let i = 0; i < line.points.length - 1; i += 2) {
          linePairs.push(`${line.points[i]} ${line.points[i + 1]}`);
        }
        console.log(line, linePairs);
        const svgPath = "M " + linePairs.join(" L ");
        pages[pageId].drawSvgPath(svgPath, {
          x: 0,
          y: pages[pageId].getHeight(),
        });
      }

      // 3. Redirect to finished document
      downloadURI(await docPdf.saveAsBase64({ dataUri: true }), doc.name);
    }

    _handleExportVectorPDF(e);
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

  // === Tooltips =====

  const HtmlTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: "#f5f5f9",
      color: "rgba(0, 0, 0, 0.87)",
      maxWidth: 220,
      fontSize: theme.typography.pxToRem(12),
      border: "1px solid #dadde9",
    },
  }));

  // === Convert line points between global and page-relative coordinates =====

  function coordsToLocal(line) {
    const page = doc.pagemap.get(line.page);
    const [pageX, pageY] = [page.xpos, page.ypos];
    const newPoints = [];
    for (let i = 0; i < line.points.length; i++) {
      if (i % 2 === 0) {
        // x
        newPoints.push(line.points[i] - pageX);
      } else {
        // y
        newPoints.push(line.points[i] - pageY);
      }
    }
    return newPoints;
  }

  function coordsToGlobal(line) {
    const page = doc.pagemap.get(line.page);
    const [pageX, pageY] = [page?.xpos || 0, page?.ypos || 0];
    const newPoints = [];
    for (let i = 0; i < line.points.length; i++) {
      if (i % 2 === 0) {
        // x
        newPoints.push(line.points[i] + pageX);
      } else {
        // y
        newPoints.push(line.points[i] + pageY);
      }
    }
    // console.log("!b", line.id, page?.ypos || "NilPos", newPoints);
    return newPoints;
  }

  // === Debugging use only =====

  window._ = window._ || {};
  window._.shiftPage = () => {
    doc.pages[1].xpos += 50;
  };

  // === Actual app contents =====

  return (
    <div id="canvas">
      <div id="toolbar">
        <ToggleButtonGroup
          value={tool}
          exclusive
          onChange={(e, newValue) => {
            setTool(newValue);
          }}
          aria-label="Tool"
        >
          <ToggleButton value="pen" aria-label="Pen">
            <BsPencil size={30} />
          </ToggleButton>
          <ToggleButton value="eraser" aria-label="Eraser">
            <BsEraser size={30} />
          </ToggleButton>
          <ToggleButton value="highlighter" aria-label="Highlighter">
            <AiOutlineHighlight size={30} />
          </ToggleButton>
          <ToggleButton value="drag" aria-label="Hand">
            <IoHandRightOutline size={30} />
          </ToggleButton>
        </ToggleButtonGroup>
        <IconButton aria-label="Undo" onClick={handleUndo}>
          <UndoIcon />
        </IconButton>
        <IconButton aria-label="Redo" onClick={handleRedo}>
          <RedoIcon />
        </IconButton>
        <span>
          <div style={styles.swatch} onClick={handleClick}>
            <div style={styles.color} />
          </div>
          {displayColorPicker ? (
            <div style={styles.popover}>
              <div style={styles.cover} onClick={handleClose} />
              <SketchPicker color={color} onChange={handleChange} />
            </div>
          ) : null}
        </span>
        <span>
          <Box width={150}>
            <Slider
              value={
                tool === "highlighter" ? highlighterStrokeWidth : strokeWidth
              }
              aria-label="Stroke width"
              valueLabelDisplay="auto"
              min={1}
              max={50}
              onChange={(e, newValue) => {
                tool === "highlighter"
                  ? setHighlighterStrokeWidth(newValue)
                  : setStrokeWidth(newValue);
              }}
            />
          </Box>
        </span>
        <span>
          <HtmlTooltip
            enterTouchDelay={0}
            arrow={true}
            placement="right"
            title={
              <React.Fragment>
                <Input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleFileOpen}
                  color="primary"
                ></Input>
              </React.Fragment>
            }
          >
            <IconButton size="medium" aria-label="Help" color="inherit">
              <AttachFileIcon />
            </IconButton>
          </HtmlTooltip>
        </span>
        <Button onClick={handleExportImage} endIcon={<IosShareIcon />}>
          Export as image
        </Button>
        <Button onClick={handleExportRasterPDF} endIcon={<IosShareIcon />}>
          Export as bitmap PDF
        </Button>
        <Button onClick={handleExportVectorPDF} endIcon={<IosShareIcon />}>
          Export as vector PDF
        </Button>
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
            <DocRenderer doc={doc} />
            {lines.map((line) => (
              <CLine key={line.id} line={line} doc={doc} />
            ))}
            {currentLine !== null && (
              <Line
                key={currentLine.id}
                points={currentLine.points}
                stroke={currentLine.color}
                opacity={currentLine.opacity}
                strokeWidth={currentLine.strokeWidth}
                tension={0.5}
                lineCap="round"
                globalCompositeOperation={
                  currentLine.tool === "eraser"
                    ? "destination-out"
                    : "source-over"
                }
              />
            )}
          </Layer>
        </ScrollableStage>
      </div>
    </div>
  );
}
