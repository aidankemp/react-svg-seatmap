import { RawSeatmap } from "./RawSeatmap";

import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Base/RawSeatmap",
  component: RawSeatmap,
  tags: ["autodocs"],
  parameters: {
    docs: {
      subtitle: "Translates raw seatmap data into a visual representation",
      description: {
        component:
          "This component is the starting place for all seatmaps in this codebase. It has aims to paint seat objects onto an SVG, with as little extra logic as possible. You can specify how each seat should be rendered.",
      },
    },
  },
  render: (args) => {
    return (
      <div style={{ width: "90vw", height: "90vh" }}>
        <RawSeatmap {...args} />
      </div>
    );
  },
} satisfies Meta<typeof RawSeatmap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AmazingVenueRaw: Story = {
  args: {
    availableSeats: [
      {
        id: 1,
        cssSelector: "#ellipse-100",
        color: "#f8d376",
        tooltipContent: "This is a tooltip",
      },
      {
        id: 2,
        cssSelector: "#ellipse-101",
        color: "#e89171",
      },
      {
        id: 3,
        cssSelector: "#ellipse-102",
        color: "#72a588",
      },
    ],
    selectedSeatIds: [1, 2],
    svg: "amazing-venue.svg",
  },
};
