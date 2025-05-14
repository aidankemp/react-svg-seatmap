/* eslint-disable react-hooks/rules-of-hooks */
import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";
import { SeatmapAccordion } from "./SeatmapAccordion";
import { amazingVenueSeats } from "../../fixtures/amazingVenueSeats";

const meta = {
  title: "SeatmapAccordion",
  component: SeatmapAccordion,
  tags: ["autodocs"],
  parameters: {
    docs: {
      subtitle:
        "A seatmap that can be used to hide and show content, like an accordion",
      description: {
        component:
          "The `SeatmapAccordion` component aims to replicate the functionality of an accordion, but with a seatmap. It allows you to show and hide content based on the selected seat. This is a **controlled component**, so you are expected to manage the state for this component when using it.",
      },
    },
  },
} satisfies Meta<typeof SeatmapAccordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Accordion: Story = {
  args: {
    svg: "amazing-venue.svg",
    seats: amazingVenueSeats,
  },
  render: (args) => {
    const [showAlert, setShowAlert] = useState(false);
    const [currentSeatId, setCurrentSeatId] = useState<number | null>(null);

    return (
      <>
        <SeatmapAccordion
          {...args}
          onClick={(seatId: number) => {
            setShowAlert(true);
            setCurrentSeatId(seatId);
          }}
        />
        {showAlert && (
          <p>
            Seat Information:{" "}
            {args.seats.find((s) => s.id === currentSeatId)?.cssSelector}
          </p>
        )}
      </>
    );
  },
};
