import { Line } from "react-konva";
import { useMemo } from "react";

function coordsToGlobal(line, doc) {
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
  console.log("!line-coord-recalc", line.id);
  return newPoints;
}

export default function CanvasLine(props) {
  const line = props.line;
  const globalCoords = useMemo(
    () => coordsToGlobal(line, props.doc),
    [line, props.doc]
  );
  return (
    <Line
      key={line.id}
      points={globalCoords}
      stroke={line.color}
      opacity={line.opacity}
      strokeWidth={line.strokeWidth}
      tension={0.5}
      lineCap="round"
      globalCompositeOperation={
        line.tool === "eraser" ? "destination-out" : "source-over"
      }
    />
  );
}
