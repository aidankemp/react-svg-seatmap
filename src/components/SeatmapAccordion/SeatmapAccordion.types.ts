import { ReactNode } from "react";
import { Seat } from "../../types/Seat.types";

export interface SeatmapAccordionProps {
  seats: Seat[]; // You can think of this as the "options" for the seatmap
  onClick?: (seatId: number, selected: boolean) => void;
  selectedSeatIds?: number[];
  svg?: string;
  displayGroupMapping?: Record<string, string | ReactNode>;
  leftControls?: ReactNode[];
  rightControls?: ReactNode[];
}
