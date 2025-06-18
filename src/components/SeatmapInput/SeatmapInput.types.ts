import { ReactNode } from "react";
import { Seat } from "../../types/Seat.types";
import { SeatmapControl } from "../../types/SeatmapControl.types";

export interface SeatmapInputProps {
  seats: Seat[]; // You can think of this as the "options" for the seatmap
  onChange?: (value: number[]) => void; // Since this is a controlled component, this function is for updating the value of the input
  value?: number[]; // This is the IDs of all the seats that should be currently selected
  svg?: string;
  displayGroupMapping?: Record<string, string | ReactNode>;
  leftControls?: SeatmapControl[];
  rightControls?: SeatmapControl[];
  withGroupSelection?: boolean; // Whether to enable group selection
  withDragSelection?: boolean; // Whether to enable drag selection
}
