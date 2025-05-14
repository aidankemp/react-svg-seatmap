export interface Seat {
  id: number;
  cssSelector?: string;
  displayGroup?: string;
  selectionGroups?: Record<string, string | { value: string; parent: string }>;
}
