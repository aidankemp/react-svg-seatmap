import { useCallback, useEffect, useMemo, useState } from "react";
import { RawSeatmapProps, SeatDisplay } from "./RawSeatmap.types";

import "./RawSeatmap.scss";
import svgPanZoom from "svg-pan-zoom";
import _ from "lodash";
import { usePrevious } from "../../../utils/usePrevious";

export const RawSeatmap = ({
  availableSeats,
  selectedSeatIds,
  svg,
  onSeatSelect,
  onSeatDeselect,
  onSeatHover,
  onSeatHoverEnd,
  allowDragAndPan = true,
  showZoomControls = true,
  leftControls,
  rightControls,
}: RawSeatmapProps) => {
  const [svgString, setSvgContent] = useState<string>("");
  const [mapNeedsPainting, setMapNeedsPainting] = useState(false);
  const previousState = usePrevious({
    svgString,
    selectedSeatIds,
    availableSeats,
  });

  const seatSelected = useCallback(
    (seat: SeatDisplay) => selectedSeatIds && selectedSeatIds.includes(seat.id),
    [selectedSeatIds]
  );

  const matchingSeat = useCallback(
    (circle: SVGElement) =>
      availableSeats.find((seat) => {
        try {
          return circle.matches(seat.cssSelector);
        } catch {
          return false;
        }
      }),
    [availableSeats]
  );

  const getSVGPanZoom = useCallback(
    () =>
      svgPanZoom(".seatmap__svg svg", {
        dblClickZoomEnabled: false,
        mouseWheelZoomEnabled: true,
        zoomScaleSensitivity: 0.5,
      }),
    []
  );

  // Fetch the SVG content from the provided URL
  useEffect(() => {
    fetch(svg)
      .then((res) => res.text())
      .then((text) => setSvgContent(text))
      .catch((err) => console.error("Failed to load SVG:", err));
  }, [svg]);

  // For a given SVG element, set the colour based on the seat's availability and selection status
  const setSeatColour = useCallback(
    (element: SVGElement, seat?: SeatDisplay) => {
      if (seat) {
        element.classList.remove("seat--unavailable");
        if (selectedSeatIds?.includes(seat.id)) {
          element.classList.add("seat--selected");
          element.classList.remove("seat--available");
        } else {
          element.classList.add("seat--available");
          element.classList.remove("seat--selected");
        }

        // Check if there are custom colours for this seat; If so, apply them.
        if (seat.color) {
          element.setAttribute(
            "style",
            `stroke: ${seat.color} !important;${
              seatSelected(seat) ? " fill: " + seat.color + " !important;" : ""
            }`
          );
        }
      } else {
        element.classList.add("seat--unavailable");
        element.classList.remove("seat--available");
        element.classList.remove("seat--selected");
      }
    },
    [seatSelected, selectedSeatIds]
  );

  // Set the initial colour of each seat on the SVG
  useEffect(() => {
    if (!svgString) {
      console.log("No SVG, exiting");
      return;
    }

    if (mapNeedsPainting) {
      console.log("SVG changed, repainting all seats...");
      const circles = document.querySelectorAll<SVGCircleElement>(
        ".seatmap__svg circle, .seatmap__svg path, .seatmap__svg ellipse"
      );

      circles.forEach((circle) => {
        const foundSeat = matchingSeat(circle);

        setSeatColour(circle, foundSeat);
      });

      console.log("Finished initial paint of SVG");

      setMapNeedsPainting(false);
    }
  }, [mapNeedsPainting, matchingSeat, setSeatColour, svgString]);

  // Setup the pan and zoom functionality on the SVG element
  useEffect(() => {
    if (!svgString) return;

    const panZoom = getSVGPanZoom();
    panZoom.resize();
    panZoom.center();
    panZoom.fit();
  }, [svgString, getSVGPanZoom]);

  // Update the pan and zoom functionality if the related props change
  useEffect(() => {
    if (!svgString) return;

    console.log("Updating pan and zoom...", allowDragAndPan);

    const panZoom = getSVGPanZoom();
    if (!allowDragAndPan) {
      panZoom.disablePan();
    } else {
      panZoom.enablePan();
    }
  }, [svgString, allowDragAndPan, getSVGPanZoom]);

  // When the state changes, the event listeners won't naturally pick up the state changes.
  // Consequently, the event listeners need to be replaced with new ones
  useEffect(() => {
    // Callback to handle click events on the SVG elements
    const handleClick = (e: MouseEvent) => {
      const target = e.target as SVGElement;

      const seat = matchingSeat(target);

      if (seat) {
        if (seatSelected(seat) && onSeatDeselect) {
          onSeatDeselect(seat);
        } else if (onSeatSelect) {
          onSeatSelect(seat);
        }
      }
    };

    // Callback to handle hover events on the SVG elements
    const handleHover = (e: MouseEvent) => {
      const target = e.target as SVGElement;

      const seat = matchingSeat(target);

      if (seat) {
        if (e.type === "mouseover" && onSeatHover) {
          onSeatHover(seat);
        } else if (onSeatHoverEnd) {
          onSeatHoverEnd(seat);
        }
      }
    };

    const circles = document.querySelectorAll<SVGCircleElement>(
      ".seatmap__svg circle, .seatmap__svg path, .seatmap__svg ellipse"
    );

    circles.forEach((target) => {
      target.removeEventListener("click", handleClick);
      target.addEventListener("click", handleClick);
      target.addEventListener("mouseover", handleHover);
      target.addEventListener("mouseout", handleHover);
    });

    return () => {
      circles.forEach((circle) => {
        circle.removeEventListener("click", handleClick);
        circle.removeEventListener("mouseover", handleHover);
        circle.removeEventListener("mouseout", handleHover);
      });
    };
  }, [
    onSeatDeselect,
    onSeatSelect,
    availableSeats,
    svgString,
    matchingSeat,
    seatSelected,
  ]);

  // When the available seats change, repaint the SVG.
  // Doing this for every seat is highly time-consuming, so we optimize the paint by
  // only repainting the seats that have changed.
  useEffect(() => {
    if (!svgString) return;

    // console.log("Updating available seats...");

    const changedSeats = availableSeats.filter((seat) => {
      const previousSeat = previousState?.availableSeats.find(
        (s) => s.id === seat.id
      );
      return !_.isEqual(seat, previousSeat);
    });

    // If the seat has changed, repaint the associated SVG element
    for (const seat of changedSeats) {
      const seatDisplayElement = document.querySelector<SVGElement>(
        seat.cssSelector
      );
      if (!seatDisplayElement) continue;
      setSeatColour(seatDisplayElement, seat);
    }

    // console.log("Finished updating available seats");
  }, [availableSeats, previousState?.availableSeats, setSeatColour, svgString]);

  // Update the style of seats that have been selected
  useEffect(() => {
    // console.log("Updating selected seats...");
    // Find all differences between the previous and current selected seats
    let changedSeatIds = selectedSeatIds || [];
    if (selectedSeatIds && previousState?.selectedSeatIds) {
      changedSeatIds = selectedSeatIds
        .filter(
          (x) =>
            previousState.selectedSeatIds &&
            !previousState.selectedSeatIds.includes(x)
        )
        .concat(
          previousState.selectedSeatIds.filter(
            (x) => !selectedSeatIds.includes(x)
          )
        );
    }

    for (const seatId of changedSeatIds) {
      const seatDisplay = availableSeats.find((seat) => seat.id === seatId);
      if (!seatDisplay) continue;

      const seatDisplayElement = document.querySelector<SVGElement>(
        seatDisplay.cssSelector
      );

      if (!seatDisplayElement) continue;

      setSeatColour(seatDisplayElement, seatDisplay);
    }
    // console.log("Finished updating selected seats");
  }, [
    availableSeats,
    previousState?.selectedSeatIds,
    selectedSeatIds,
    setSeatColour,
  ]);

  // We need to memoize the main SVG content separately from the rest of the component to ensure
  // that it NEVER changes unless the SVG itself changes.
  // This is because the SVG pan and zoom library (as well as our seat painting method)
  // will not work correctly if the SVG content changes.
  const memoizedSvg = useMemo(() => {
    setMapNeedsPainting(true);
    return (
      <div
        className="seatmap__svg"
        dangerouslySetInnerHTML={{ __html: svgString }}
      />
    );
  }, [svgString]);

  // Memoize the main HTML structure to avoid unnecessary re-renders
  return useMemo(() => {
    const handleZoomIn = () => {
      getSVGPanZoom().zoomIn();
    };

    const handleZoomReset = () => {
      const panZoom = getSVGPanZoom();
      panZoom.resize();
      panZoom.center();
      panZoom.fit();
    };

    const handleZoomOut = () => {
      getSVGPanZoom().zoomOut();
    };

    return (
      <div className="seatmap">
        <div className="seatmap__actions seatmap__actions--left">
          {showZoomControls && (
            <div className="seatmap__action-group">
              <button
                type="button"
                className="seatmap__action"
                onClick={handleZoomIn}
                title="Zoom In"
              >
                <svg
                  className="seatmap__icon seatmap__icon--zoom-in"
                  viewBox="0 0 16 16"
                >
                  <title>Zoom In</title>
                  <path d="M12.8 8c0 0.442-0.038 0.8-0.481 0.8h-3.519v3.519c0 0.442-0.358 0.481-0.8 0.481s-0.8-0.039-0.8-0.481v-3.519h-3.519c-0.442 0-0.481-0.358-0.481-0.8s0.039-0.8 0.481-0.8h3.519v-3.519c0-0.442 0.358-0.481 0.8-0.481s0.8 0.038 0.8 0.481v3.519h3.519c0.442 0 0.481 0.358 0.481 0.8z"></path>
                </svg>
              </button>
              <button
                type="button"
                className="seatmap__action"
                onClick={handleZoomReset}
                title="Reset Zoom"
              >
                <svg
                  className="seatmap__icon seatmap__icon--close"
                  viewBox="0 0 16 16"
                >
                  <title>Close</title>
                  <path d="M12.656 4.281l-3.719 3.719 3.719 3.719-0.938 0.938-3.719-3.719-3.719 3.719-0.938-0.938 3.719-3.719-3.719-3.719 0.938-0.938 3.719 3.719 3.719-3.719z"></path>
                </svg>
              </button>
              <button
                type="button"
                className="seatmap__action"
                onClick={handleZoomOut}
                title="Zoom Out"
              >
                <svg
                  className="seatmap__icon seatmap__icon--zoom-out"
                  viewBox="0 0 16 16"
                >
                  <title>Zoom Out</title>
                  <path d="M12.8 8c0 0.442-0.038 0.8-0.481 0.8h-8.638c-0.442 0-0.481-0.358-0.481-0.8s0.039-0.8 0.481-0.8h8.639c0.442 0 0.48 0.358 0.48 0.8z"></path>
                </svg>
              </button>
            </div>
          )}
          {leftControls?.map((control) => (
            <div className="seatmap__action-group">{control}</div>
          ))}
        </div>
        {memoizedSvg}
        <div className="seatmap__actions seatmap__actions--right">
          {rightControls?.map((control) => (
            <div className="seatmap__action-group">{control}</div>
          ))}
        </div>
      </div>
    );
  }, [
    leftControls,
    rightControls,
    getSVGPanZoom,
    memoizedSvg,
    showZoomControls,
  ]);
};
