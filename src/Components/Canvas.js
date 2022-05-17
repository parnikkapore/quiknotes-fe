import React from 'react';
import { Stage, Layer, Star, Text } from 'react-konva';
import Konva from 'konva';
import ScrollableStage from './ScrollableStage';
import PDFPageContents from './PDFPageContents';
import './Canvas.css';

export default function Canvas(props) {
  return (
    <ScrollableStage id="canvas"
      width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Text text="Try to drag the canvas around" />
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
        <PDFPageContents src="/test1.pdf" x="0" y="400" />
      </Layer>
    </ScrollableStage>
  );
};
