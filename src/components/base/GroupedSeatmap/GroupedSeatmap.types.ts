import { ReactNode } from "react";

export interface GroupedSeat {
  id: number;
  cssSelector: string;
  displayGroup?: string; // The group that controls the display of the seat
  selectionGroups?: Record<string, string | { value: string; parent: string }>; // The groups that control the selection of the seat
}

export interface GroupedSeatmapProps {
  svg: string;
  availableSeats: GroupedSeat[];
  selectedSeatIds?: number[]; // Array of selected seat IDs
  displayGroupMapping?: Record<string, string | ReactNode>;
  onSeatSelect?: (selectedSeats: GroupedSeat[]) => void;
  onSeatDeselect?: (deselectedSeats: GroupedSeat[]) => void;
  leftControls?: ReactNode[];
  rightControls?: ReactNode[];
  withGroupSelection?: boolean; // Whether to enable group selection
  withDragSelection?: boolean; // Whether to enable drag selection
}
