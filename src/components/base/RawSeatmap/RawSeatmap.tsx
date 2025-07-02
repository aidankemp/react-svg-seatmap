import { useCallback, useEffect, useMemo, useState } from "react";
import { RawSeatmapProps, SeatDisplay } from "./RawSeatmap.types";

import "./RawSeatmap.scss";
import svgPanZoom from "svg-pan-zoom";
import _ from "lodash";
import { usePrevious } from "../../../utils/usePrevious";
import { SeatmapControl } from "../../../types/SeatmapControl.types";

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
  const [svgFetchingError, setSvgFetchingError] = useState(false);
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
      .then((res) => {
        if (res.ok) {
          return res.text();
        }
        throw new Error("Unable to fetch SVG");
      })
      .then((text) => setSvgContent(text))
      .catch((err) => {
        setSvgFetchingError(true);
        console.error("Failed to load SVG:", err);
      });
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
    if (!svgString || svgFetchingError) {
      console.error("No SVG, exiting");
      return;
    }

    if (mapNeedsPainting) {
      const circles = document.querySelectorAll<SVGCircleElement>(
        ".seatmap__svg circle, .seatmap__svg path, .seatmap__svg ellipse"
      );

      circles.forEach((circle) => {
        const foundSeat = matchingSeat(circle);

        setSeatColour(circle, foundSeat);
      });

      setMapNeedsPainting(false);
    }
  }, [
    mapNeedsPainting,
    matchingSeat,
    setSeatColour,
    svgString,
    svgFetchingError,
  ]);

  // Setup the pan and zoom functionality on the SVG element
  useEffect(() => {
    if (!svgString || svgFetchingError) return;

    const panZoom = getSVGPanZoom();
    panZoom.resize();
    panZoom.center();
    panZoom.fit();
  }, [svgString, getSVGPanZoom, svgFetchingError]);

  // Update the pan and zoom functionality if the related props change
  useEffect(() => {
    if (!svgString || svgFetchingError) return;

    const panZoom = getSVGPanZoom();
    if (!allowDragAndPan) {
      panZoom.disablePan();
    } else {
      panZoom.enablePan();
    }
  }, [svgString, allowDragAndPan, getSVGPanZoom, svgFetchingError]);

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
      target.removeEventListener("pointerdown", handleClick);
      target.removeEventListener("mouseover", handleHover);
      target.removeEventListener("mouseout", handleHover);

      target.addEventListener("pointerdown", handleClick);
      target.addEventListener("mouseover", handleHover);
      target.addEventListener("mouseout", handleHover);
    });

    return () => {
      circles.forEach((circle) => {
        circle.removeEventListener("pointerdown", handleClick);
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
    if (!svgString || svgFetchingError) return;

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
  }, [
    availableSeats,
    previousState?.availableSeats,
    setSeatColour,
    svgString,
    svgFetchingError,
  ]);

  // Update the style of seats that have been selected
  useEffect(() => {
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
  }, [
    availableSeats,
    previousState?.selectedSeatIds,
    selectedSeatIds,
    setSeatColour,
  ]);

  // Take a SeatmapControl object and return the appropriate JSX element
  // This allows users to specify if the control group should be styled or not
  const generateSeatmapControl = (control: SeatmapControl) => {
    if (control && typeof control === "object" && "style" in control) {
      return (
        <div
          className={
            "seatmap__action-group" +
            (control.style === "none" ? " seatmap__action-group--unstyled" : "")
          }
        >
          {control.control}
        </div>
      );
    }
    return <div className="seatmap__action-group">{control}</div>;
  };

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
  const returnValue = useMemo(() => {
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
                  viewBox="0 -960 960 960"
                >
                  <title>Zoom In</title>
                  <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
                </svg>
              </button>
              <button
                type="button"
                className="seatmap__action"
                onClick={handleZoomReset}
                title="Reset Zoom"
              >
                <svg
                  className="seatmap__icon seatmap__icon--reset"
                  viewBox="0 -960 960 960"
                >
                  <title>Reset zoom</title>
                  <path d="M480-160q-134 0-227-93t-93-227q0-134 93-227t227-93q69 0 132 28.5T720-690v-110h80v280H520v-80h168q-32-56-87.5-88T480-720q-100 0-170 70t-70 170q0 100 70 170t170 70q77 0 139-44t87-116h84q-28 106-114 173t-196 67Z" />
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
                  viewBox="0 -960 960 960"
                >
                  <title>Zoom Out</title>
                  <path d="M200-440v-80h560v80H200Z" />
                </svg>
              </button>
            </div>
          )}
          {leftControls?.map((control) => generateSeatmapControl(control))}
        </div>
        {memoizedSvg}
        <div className="seatmap__actions seatmap__actions--right">
          {rightControls?.map((control) => generateSeatmapControl(control))}
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

  // If the SVG could not be fetched, return an error message
  if (svgFetchingError) {
    return (
      <div className="seatmap">
        <div className="seatmap__error">
          ERROR: Unable to fetch SVG from the given URL: {svg}
        </div>
      </div>
    );
  }

  return returnValue;
};
