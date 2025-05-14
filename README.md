# react-svg-seatmap

React components built to use SVG seatmaps as form inputs.

This package includes:

- `SeatmapInput`: Use an SVG seatmap as a controlled component for choosing seats
- `SeatmapAccordion`: Use an SVG seatmap as a navigational tool for showing seat details

![summary](https://github.com/user-attachments/assets/e5dfef08-6068-44fe-9ec7-b0e1c35926d3)

## Features

- Use custom icons and colors to group seats
- Pan and zoom functionality
- Select all seats in a group at once
- Drag to quickly multiple seats
  ![drag](https://github.com/user-attachments/assets/4b21c84f-41c7-41c2-a737-6b47e4749df0)

## Installation

Install the package via NPM:

```
npm install --save react-svg-seatmap
```

## Usage

**SeatmapInput**

```jsx
import { useState } from "react";
import { SeatmapInput } from "react-svg-seatmap";

export default () => {
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  const svgUrl = "https://www.test.com/svg";

  const seats = [
    {
      id: 1,
      cssSelector: "#seat-1-1-1", // The query selector that can be used to find this seat on the SVG
      displayGroup: "1", // Optional: The color or icon group that this seat should belong to
      selectionGroups: {
        row: "1",  // Optional: The groups that should be selected when this seat is selected
      },
    },
  ];

  return (
    <form>
      <SeatmapInput
        seats={seats}
        svg={svgUrl}
        value={selectedSeats}
        onChange={setSelectedSeats}
      />
    </form>
  );
};
```

**SeatmapAccordion**

```jsx
import { useState } from "react";
import { SeatmapAccordion } from "react-svg-seatmap";

export default () => {
  const svgUrl = "https://www.test.com/svg";

  const seats = [
    {
      id: 1,
      cssSelector: "#seat-1-1-1", // The query selector that can be used to find this seat on the SVG
      displayGroup: "1", // Optional: The color or icon group that this seat should belong to
      selectionGroups: {
        row: "1", // Optional: The groups that should be selected when this seat is selected
      },
    },
  ];

  const handleSeatSelect = (selectedSeatId: number) => {
    alert(`You have clicked seat ${selectedSeatId}!`);
  };

  return (
    <SeatmapAccordion seats={seats} svg={svgUrl} onClick={handleSeatSelect} />
  );
};
```

## Props

**Seats**
| Name | Type | Description |
| --------- | ------------------- | ------------------------------- |
| id | number | The unique ID of the seat |
| cssSelector | string | The unique query string that be used to find this seat on the SVG |
| displayGroup | string | (Optional) The display group that this seat belongs to. Used to match against values passed in the `displyGroupMapping` prop |
| selectionGroups | Record<string, string> | (Optional) If `groupSelection` is set to `true` in the seatmap component, this prop is used to determine the groups that can be used to select this seat (and that should be selected if this seat is selected). For instance, if this value contains `{ row: "A" }`, clicking on any other seat in the "row A" group while selecting "row" groups will select this seat|

**SeatmapInput**
| Name | Type | Description |
| --------- | ------------------- | ------------------------------- |
| svg | string | URL for an svg to render as the seatmap |
| seats | Seat[] | The seats available to be selected on the seatmap. You can think of this as the "options" for the seatmap |
| value | number[] | The IDs of all currently selected seats. Since this is a controlled component, this prop controls which seats are considered to be selected, and so should be stored in state. |
| onChange | (selectedSeats: number[]) => void | Function that is run when the user changes the selected seats (either selection or deselection). Since this is a controlled component, the function argument is the new "value" for the seatmap. |
| displayGroupMapping | Record<string, string \| ReactNode> <br> For example: <pre>{<br> "A": "#ef857d",<br> "B": "#de5472",<br> "C": "#5a8ef7",<br> "D": "#9b98e5"<br>}</pre> | A mapping object that translates between a display group and a color or icon. If a seat is given a display group value, this object is used to determine how that seat should be displayed |
| leftControls | ReactNode[] | An array of React components that will be rendered on the top left-hand side of the seatmap. This can be useful for setting up extra controls within the seatmap itself. |
| rightControls | ReactNode[] | An array of React components that will be rendered on the top right-hand side of the seatmap. This can be useful for setting up extra controls within the seatmap itself. |

**SeatmapAccordion**
| Name | Type | Description |
| --------- | ------------------- | ------------------------------- |
| svg | string | URL for an svg to render as the seatmap |
| seats | Seat[] | The seats available to be selected on the seatmap. You can think of this as the "options" for the seatmap |
| selectedSeatIds | number[] | The IDs of all currently selected seats. This prop sets the seats that should be selected, and so should be stored in state. |
| onClick | (seatId: number, selected: boolean) => void | Function that is run when an available seat is clicked. The function argument is the ID of the clicked seat, and whether it was selected or deselected. |
| displayGroupMapping | Record<string, string \| ReactNode> <br> For example: <pre>{<br> "A": "#ef857d",<br> "B": "#de5472",<br> "C": "#5a8ef7",<br> "D": "#9b98e5"<br>}</pre> | A mapping object that translates between a display group and a color or icon. If a seat is given a display group value, this object is used to determine how that seat should be displayed |
| leftControls | ReactNode[] | An array of React components that will be rendered on the top left-hand side of the seatmap. This can be useful for setting up extra controls within the seatmap itself. |
| rightControls | ReactNode[] | An array of React components that will be rendered on the top right-hand side of the seatmap. This can be useful for setting up extra controls within the seatmap itself. |

## License

MIT Licence
