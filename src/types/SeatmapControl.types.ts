import { ReactNode } from "react";

export type SeatmapControl =
  | ReactNode
  | { control: ReactNode; style: "default" | "none" };
