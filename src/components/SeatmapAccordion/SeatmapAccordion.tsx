import { GroupedSeatmap } from "../base/GroupedSeatmap/GroupedSeatmap";
import { SeatmapAccordionProps } from "./SeatmapAccordion.types";
import { useMemo } from "react";

export const SeatmapAccordion = ({
  seats,
  selectedSeatIds,
  onClick,
  svg,
  displayGroupMapping,
  leftControls,
  rightControls,
}: SeatmapAccordionProps) => {
  const availableSeats = useMemo(
    () =>
      seats.map((seat) => ({
        ...seat,
        cssSelector: seat.cssSelector || "",
      })),
    [seats]
  );

  if (svg) {
    return (
      <GroupedSeatmap
        availableSeats={availableSeats}
        selectedSeatIds={selectedSeatIds}
        svg={svg}
        onSeatSelect={(seats) => {
          if (onClick) onClick(seats.map((seat) => seat.id)[0], true);
        }}
        onSeatDeselect={(seats) => {
          if (onClick) onClick(seats.map((seat) => seat.id)[0], false);
        }}
        displayGroupMapping={displayGroupMapping}
        leftControls={leftControls}
        rightControls={rightControls}
        withDragSelection={false}
        withGroupSelection={false}
      />
    );
  }
};
