import { useMemo, useState } from "react";
import { GroupedSeat, GroupedSeatmapProps } from "./GroupedSeatmap.types";

import { RawSeatmap } from "../RawSeatmap/RawSeatmap";
import { SeatDisplay } from "../RawSeatmap/RawSeatmap.types";
import Selecto from "react-selecto";

export const GroupedSeatmap = ({
  availableSeats,
  selectedSeatIds,
  svg,
  displayGroupMapping,
  onSeatSelect,
  onSeatDeselect,
  rightControls,
  leftControls,
  withDragSelection = true,
  withGroupSelection = true,
}: GroupedSeatmapProps) => {
  const [selectionMethod, setSelectionMethod] = useState<
    "group" | "drag" | null
  >(null);
  const [currentGroup, setCurrentGroup] = useState<string | null>(null);

  const findSeatsInGroup = (seat: GroupedSeat, group: string) => {
    const groupValue = seat?.selectionGroups?.[group];

    const groupSeats =
      typeof groupValue === "object"
        ? availableSeats.filter(
            (s) =>
              sameGroup(s, seat, group) && sameGroup(s, seat, groupValue.parent)
          )
        : availableSeats.filter((s) => sameGroup(s, seat, group));

    return groupSeats;
  };

  const sameGroup = (
    seatA: GroupedSeat,
    seatB: GroupedSeat,
    groupName: string
  ) => {
    let seatAGroupValue = seatA.selectionGroups?.[groupName];
    if (typeof seatAGroupValue === "object") {
      seatAGroupValue = seatAGroupValue.value;
    }
    const seatBGroupValue = seatB.selectionGroups?.[groupName];
    if (typeof seatBGroupValue === "object") {
      return seatAGroupValue === seatBGroupValue.value;
    }
    return seatAGroupValue === seatBGroupValue;
  };

  const handleSeatSelect = (changedSeat: SeatDisplay, selected: boolean) => {
    // Add the selected seat to the state value
    const seatObject = availableSeats.find((s) => s.id === changedSeat.id);
    if (!seatObject) return;

    let changedSeats: GroupedSeat[] = [seatObject];

    // If group selection is enabled, add all seats in the current group to the selected seats
    if (selectionMethod === "group" && currentGroup) {
      const groupSeats = findSeatsInGroup(seatObject, currentGroup);

      changedSeats = [...changedSeats, ...groupSeats];
    }

    if (selected && onSeatSelect) onSeatSelect(changedSeats);
    else if (!selected && onSeatDeselect) onSeatDeselect(changedSeats);
  };

  const handleSeatMultiSelect = (e: {
    added: (HTMLElement | SVGElement)[];
  }) => {
    const selectedSeats: GroupedSeat[] = [];
    e.added.forEach((element: HTMLElement | SVGElement) => {
      // Find the seat object associated with the selected element
      const seatObject = availableSeats.find((s) =>
        element.matches(s.cssSelector)
      );
      if (!seatObject) return;

      // Update the styling of the selected seats
      element.classList.add("seat--selected");
      element.classList.remove("seat--available");

      // Add the selected seat to the list of selected seats
      selectedSeats.push(seatObject);
    });

    if (selectedSeats.length > 0 && onSeatSelect) {
      onSeatSelect(selectedSeats);
    }
  };

  const handleHoverMultiSelect = (e: {
    added: (HTMLElement | SVGElement)[];
    removed: (HTMLElement | SVGElement)[];
  }) => {
    e.added.forEach((element: HTMLElement | SVGElement) => {
      element.classList.add("seat--selected");
      element.classList.remove("seat--available");
    });
    e.removed.forEach((element: HTMLElement | SVGElement) => {
      element.classList.remove("seat--selected");
      element.classList.add("seat--available");
    });
  };

  const handleSeatHover = (hoveredSeat: SeatDisplay, hoverStart: boolean) => {
    // Find the grouped seat object associated with the hovered element
    const seatObject = availableSeats.find((s) => s.id === hoveredSeat.id);
    if (!seatObject) return;

    // Update the styling of the hovered seat
    const seatElement = document.querySelector<SVGElement>(
      seatObject.cssSelector
    );
    if (!seatElement) return;
    if (hoverStart) {
      seatElement.classList.add("seat--hover");
    } else {
      seatElement.classList.remove("seat--hover");
    }

    // If group selection is enabled, add the hover effect to all seats in the current group
    if (selectionMethod === "group" && currentGroup) {
      const groupSeats = findSeatsInGroup(seatObject, currentGroup);

      for (const groupSeat of groupSeats) {
        const groupSeatElement = document.querySelector<SVGElement>(
          groupSeat.cssSelector
        );
        if (!groupSeatElement) continue;
        if (hoverStart) {
          groupSeatElement.classList.add("seat--hover");
        } else {
          groupSeatElement.classList.remove("seat--hover");
        }
      }
    }
  };

  const availableSeatDisplays = useMemo(
    () =>
      availableSeats.map((seat) => ({
        id: seat.id,
        cssSelector: seat.cssSelector,
        color:
          seat.displayGroup &&
          typeof displayGroupMapping?.[seat.displayGroup] === "string"
            ? (displayGroupMapping?.[seat.displayGroup] as string)
            : undefined,
        icon:
          seat.displayGroup &&
          typeof displayGroupMapping?.[seat.displayGroup] !== "string"
            ? displayGroupMapping?.[seat.displayGroup]
            : undefined,
        selected: false,
      })),
    [availableSeats, displayGroupMapping]
  );

  const selectionControls = useMemo(() => {
    const selectionControls = [];

    if (withGroupSelection) {
      // Get all the unique sorting groups from the available seats
      const groups = availableSeats
        .map((seat) => {
          if (seat.selectionGroups) return Object.keys(seat.selectionGroups);
        })
        .flat();

      // Remove duplicates and filter out undefined values
      const uniqueGroups = Array.from(new Set(groups)).filter(
        (group) => group !== undefined
      );

      selectionControls.push(
        ...uniqueGroups.map((group) => (
          <button
            key={group}
            type="button"
            className={
              "seatmap__action" +
              (selectionMethod === "group" && currentGroup === group
                ? " seatmap__action--selected"
                : "")
            }
            onClick={() => {
              if (selectionMethod === "group" && currentGroup === group) {
                setSelectionMethod(null);
                setCurrentGroup(null);
              } else {
                setSelectionMethod("group");
                setCurrentGroup(group);
              }
            }}
          >
            {Array.from(group)[0]}
          </button>
        ))
      );
    }

    if (withDragSelection) {
      // Generate the control for dragging and selecting seats
      selectionControls.push(
        <button
          key="multi-select"
          type="button"
          className={
            "seatmap__action" +
            (selectionMethod === "drag" ? " seatmap__action--selected" : "")
          }
          onClick={() =>
            selectionMethod === "drag"
              ? setSelectionMethod(null)
              : setSelectionMethod("drag")
          }
          title="Lasso select"
        >
          <svg
            className="seatmap__icon seatmap__icon--zoom-in"
            viewBox="0 -960 960 960"
          >
            <title>Lasso select</title>
            <path d="m161-516-80-8q6-46 20.5-89.5T141-696l68 42q-20 31-31.5 66T161-516Zm36 316q-33-32-57-70.5T101-352l76-26q12 35 31 65.5t45 56.5l-56 56Zm110-552-42-68q39-25 82.5-39.5T437-880l8 80q-37 5-72 16.5T307-752ZM479-82q-35 0-69.5-5.5T343-106l26-76q27 9 54 14.5t56 5.5v80Zm226-626q-26-26-56.5-45T583-784l26-76q43 15 81.5 39t70.5 57l-56 56Zm86 594L679-226v104h-80v-240h240v80H735l112 112-56 56Zm8-368q0-29-5.5-56T779-592l76-26q13 32 18.5 66.5T879-482h-80Z" />
          </svg>
        </button>
      );
    }

    return selectionControls;
  }, [
    availableSeats,
    currentGroup,
    selectionMethod,
    withDragSelection,
    withGroupSelection,
  ]);

  const combinedLeftControls = useMemo(() => {
    const combinedControls = [];

    if (selectionControls && selectionControls.length) {
      combinedControls.push(selectionControls);
    }
    if (leftControls && leftControls.length) {
      combinedControls.push(...leftControls);
    }
    return combinedControls;
  }, [leftControls, selectionControls]);

  return (
    <>
      {selectionMethod === "drag" && (
        <Selecto
          // The container to add a selection element
          container={document.body}
          // The area to drag selection element (default: container)
          dragContainer={window}
          // Targets to select. You can register a queryselector or an Element.
          selectableTargets={[".seatmap__svg .seat--available"]}
          // Whether to select by click (default: true)
          selectByClick={false}
          // Whether to select from the target inside (default: true)
          selectFromInside={true}
          // After the select, whether to select the next target with the selected target (deselected if the target is selected again).
          continueSelect={true}
          // Determines which key to continue selecting the next target via keydown and keyup.
          toggleContinueSelect={"shift"}
          // The container for keydown and keyup events
          keyContainer={window}
          // The rate at which the target overlaps the drag area to be selected. (default: 100)
          hitRate={100}
          onSelect={handleHoverMultiSelect}
          onSelectEnd={handleSeatMultiSelect}
        />
      )}
      <RawSeatmap
        svg={svg}
        availableSeats={availableSeatDisplays}
        selectedSeatIds={selectedSeatIds}
        onSeatSelect={(s) => handleSeatSelect(s, true)}
        onSeatDeselect={(s) => handleSeatSelect(s, false)}
        onSeatHover={(s) => handleSeatHover(s, true)}
        onSeatHoverEnd={(s) => handleSeatHover(s, false)}
        leftControls={combinedLeftControls}
        rightControls={rightControls}
        allowDragAndPan={selectionMethod !== "drag"}
      />
    </>
  );
};
