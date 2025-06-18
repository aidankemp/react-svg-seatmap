import { ReactNode } from "react";
import { SeatmapControl } from "../../../types/SeatmapControl.types";

export interface SeatDisplay {
  id: number;
  cssSelector: string; // How can we find the seat in the SVG?
  color?: string;
  icon?: ReactNode;
  tooltipContent?: ReactNode;
}

export interface RawSeatmapProps {
  availableSeats: SeatDisplay[];
  selectedSeatIds?: number[]; // Array of selected seat IDs
  svg: string;
  showZoomControls?: boolean;
  allowDragAndPan?: boolean;
  leftControls?: SeatmapControl[];
  rightControls?: SeatmapControl[];
  onSeatSelect?: (selectedSeat: SeatDisplay) => void;
  onSeatDeselect?: (selectedSeat: SeatDisplay) => void;
  onSeatHover?: (hoveredSeat: SeatDisplay) => void;
  onSeatHoverEnd?: (hoveredSeat: SeatDisplay) => void;
}
