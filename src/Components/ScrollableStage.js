import React from "react";
import { Stage } from "react-konva";
import Konva from "konva";

function _ScrollableStage(props, ref) {
  const [handleStagePinchMove, handleStagePinchEnd] = (() => {
    // by default Konva prevent some events when node is dragging
    // it improve the performance and work well for 95% of cases
    // we need to enable all events on Konva, even when we are dragging a node
    // so it triggers touchmove correctly
    Konva.hitOnDragEnabled = true;

    function getDistance(p1, p2) {
      return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }

    function getCenter(p1, p2) {
      return {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
      };
    }
    var lastCenter = null;
    var lastDist = 0;

    return [
      function (e) {
        e.evt.preventDefault();
        var touch1 = e.evt.touches[0];
        var touch2 = e.evt.touches[1];
        const stage = e.currentTarget;

        if (touch1 && touch2) {
          // if the stage was under Konva's drag&drop
          // we need to stop it, and implement our own pan logic with two pointers
          if (stage.isDragging()) {
            stage.stopDrag();
          }

          var p1 = {
            x: touch1.clientX,
            y: touch1.clientY,
          };
          var p2 = {
            x: touch2.clientX,
            y: touch2.clientY,
          };

          if (!lastCenter) {
            lastCenter = getCenter(p1, p2);
            return;
          }
          var newCenter = getCenter(p1, p2);

          var dist = getDistance(p1, p2);

          if (!lastDist) {
            lastDist = dist;
          }

          // local coordinates of center point
          var pointTo = {
            x: (newCenter.x - stage.x()) / stage.scaleX(),
            y: (newCenter.y - stage.y()) / stage.scaleX(),
          };

          var scale = stage.scaleX() * (dist / lastDist);

          stage.scaleX(scale);
          stage.scaleY(scale);

          // calculate new position of the stage
          var dx = newCenter.x - lastCenter.x;
          var dy = newCenter.y - lastCenter.y;

          var newPos = {
            x: newCenter.x - pointTo.x * scale + dx,
            y: newCenter.y - pointTo.y * scale + dy,
          };

          stage.position(newPos);

          lastDist = dist;
          lastCenter = newCenter;
        }
      },
      function (e) {
        lastDist = 0;
        lastCenter = null;
      },
    ];
  })();

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

    function handleHorizontalScroll(e) {
      const dy = e.evt.deltaY;

      const x = stage.x() - dy;
      const y = stage.y();

      stage.position({ x, y });
    }

    if (e.evt.ctrlKey) {
      handleZoom(e);
    } else if (e.evt.shiftKey) {
      handleHorizontalScroll(e);
    } else {
      handleScroll(e);
    }
  }

  return (
    <Stage
      id="canvas"
      ref={ref}
      width={10}
      height={10}
      draggable={props.enabled ? "draggable" : false}
      onWheel={handleStageWheel}
      onTouchStart={props.enabled ? () => {} : props.onTouchStart}
      onTouchMove={props.enabled ? handleStagePinchMove : props.onTouchMove}
      onTouchEnd={props.enabled ? handleStagePinchEnd : props.onTouchEnd}
      onMouseDown={props.onMouseDown}
      onMouseMove={props.onMouseMove}
      onMouseUp={props.onMouseUp}
    >
      {props.children}
    </Stage>
  );
}

const ScrollableStage = React.forwardRef(_ScrollableStage);
export default ScrollableStage;
