## Components structure

The components in this repository have a hierarchy between them. Specifically: \
`RawSeatmap` &rarr; `GroupedSeatmap` &rarr; `SeatmapAccordion` & `SeatmapInput`

The intention behind this was to abstract layers of functionality into separate, individually testable components.

Each component was designed to inject a specific set of functionality into the seatmap:

- `RawSeatmap`: The base component that renders the SVG and provides the basic functionality of panning and zooming.
- `GroupedSeatmap`: Adds the ability to group seats together and select them as a single unit.
- `SeatmapInput`: Aims to act as a form input, using the controlled component pattern to allow the parent component to manage the state of the selected seats.
- `SeatmapAccordion`: Adds the ability to react to seat selection and pass the selected seats to a parent component, without automatically updating the state of the selected seats. This allows for more flexibility in how the seatmap is used and how the selected seats are managed.
