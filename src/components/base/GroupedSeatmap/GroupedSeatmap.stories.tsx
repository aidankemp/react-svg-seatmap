import { GroupedSeatmap } from "./GroupedSeatmap";

import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Base/GroupedSeatmap",
  component: GroupedSeatmap,
  tags: ["autodocs"],
  parameters: {
    docs: {
      subtitle: "Adds grouping functionality to the raw seatmap component",
      description: {
        component:
          "This component builds on top of the `RawSeatmap` component by adding the ability to group seats together. Seats can be grouped by both how they should be displayed, and how they should be selected. This is useful for maps that have different sections, or for maps that have different types of seats.",
      },
    },
  },
  render: (args) => {
    return (
      <div style={{ width: "90vw", height: "90vh" }}>
        <GroupedSeatmap {...args} />
      </div>
    );
  },
} satisfies Meta<typeof GroupedSeatmap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AmazingVenueGrouped: Story = {
  args: {
    availableSeats: [
      {
        id: 1,
        cssSelector: "#ellipse-1",
        displayGroup: "4",
        selectionGroups: {
          row: {
            value: "B",
            parent: "section",
          },
          section: "4",
        },
      },
      {
        id: 2,
        cssSelector: "#ellipse-2",
        displayGroup: "4",
        selectionGroups: {
          row: {
            value: "B",
            parent: "section",
          },
          section: "4",
        },
      },
      {
        id: 3,
        cssSelector: "#ellipse-3",
        displayGroup: "4",
        selectionGroups: {
          row: {
            value: "B",
            parent: "section",
          },
          section: "4",
        },
      },
      {
        id: 4,
        cssSelector: "#ellipse-4",
        displayGroup: "4",
        selectionGroups: {
          row: {
            value: "D",
            parent: "section",
          },
          section: "4",
        },
      },
      {
        id: 5,
        cssSelector: "#ellipse-5",
        displayGroup: "4",
        selectionGroups: {
          row: {
            value: "D",
            parent: "section",
          },
          section: "4",
        },
      },
      {
        id: 6,
        cssSelector: "#ellipse-6",
        displayGroup: "4",
        selectionGroups: {
          row: {
            value: "D",
            parent: "section",
          },
          section: "4",
        },
      },
      {
        id: 7,
        cssSelector: "#ellipse-7",
        displayGroup: "1",
        selectionGroups: {
          row: {
            value: "B",
            parent: "section",
          },
          section: "1",
        },
      },
      {
        id: 8,
        cssSelector: "#ellipse-8",
        displayGroup: "1",
        selectionGroups: {
          row: {
            value: "B",
            parent: "section",
          },
          section: "1",
        },
      },
      {
        id: 9,
        cssSelector: "#ellipse-9",
        displayGroup: "1",
        selectionGroups: {
          row: {
            value: "B",
            parent: "section",
          },
          section: "1",
        },
      },
    ],
    displayGroupMapping: {
      "1": "#ef857d",
      "2": "#de5472",
      "3": "#5a8ef7",
    },
    svg: "amazing-venue.svg",
  },
};
