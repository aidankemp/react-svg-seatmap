/* eslint-disable react-hooks/rules-of-hooks */
import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";
import { SeatmapInput } from "./SeatmapInput";
import { amazingVenueSeats } from "../../fixtures/amazingVenueSeats";

const meta = {
  title: "SeatmapInput",
  component: SeatmapInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      subtitle: "A seatmap that can be used as a form input",
      description: {
        component:
          "The `SeatmapInput` component is a form input that allows users to select seats from a seat map. It is designed to be used in forms where the user needs to select a group of seats, and nothing else. This is a **controlled component**, so you are expected to manage the state for this component when using it.",
      },
    },
  },
} satisfies Meta<typeof SeatmapInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Form: Story = {
  args: {
    svg: "amazing-venue.svg",
    seats: amazingVenueSeats,
  },
  render: (args) => {
    const [value, setValue] = useState<number[]>([]);

    const displayGroupMapping = {
      stalls: "#ef857d",
      standingRoom: "#f8d376",
      premiumA: "#61d4a4",
      premiumB: "#5a8ef7",
    };

    const buttonStyle = {
      backgroundColor: "#4F46E5",
      color: "#ffffff",
      padding: "12px 24px",
      fontSize: "16px",
      fontWeight: "600",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)",
      transition: "all 0.2s ease-in-out",
      marginTop: "1rem",
      marginBottom: "1rem",
    };

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          alert("You have selected the following seats: " + value.join(", "));
        }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <SeatmapInput
          {...args}
          value={value}
          onChange={setValue}
          displayGroupMapping={displayGroupMapping}
          withDragSelection={true}
          withGroupSelection={false}
        />
        <button type="submit" style={buttonStyle}>
          Submit
        </button>
      </form>
    );
  },
};
