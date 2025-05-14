import { GroupedSeatmap } from "../base/GroupedSeatmap/GroupedSeatmap";
import { SeatmapInputProps } from "./SeatmapInput.types";
import { useMemo } from "react";

export const SeatmapInput = ({
  seats,
  value,
  onChange,
  svg,
  displayGroupMapping,
  leftControls,
  rightControls,
  withDragSelection,
  withGroupSelection,
}: SeatmapInputProps) => {
  const handleChange = (changedSeatIds: number[], selected: boolean) => {
    let newValue = [...(value || [])];

    for (const changedSeatId of changedSeatIds) {
      if (selected) {
        newValue = [...newValue, changedSeatId];
      } else {
        newValue = newValue.filter((s) => s !== changedSeatId);
      }
    }

    if (onChange) onChange(newValue);
  };

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
        selectedSeatIds={value}
        svg={svg}
        onSeatSelect={(seats) =>
          handleChange(
            seats.map((seat) => seat.id),
            true
          )
        }
        onSeatDeselect={(seats) =>
          handleChange(
            seats.map((seat) => seat.id),
            false
          )
        }
        displayGroupMapping={displayGroupMapping}
        leftControls={leftControls}
        rightControls={rightControls}
        withDragSelection={withDragSelection}
        withGroupSelection={withGroupSelection}
      />
    );
  }
};
