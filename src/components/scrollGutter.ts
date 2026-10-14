import { css } from "styled-components";

/**
 * The cake scrollbar is absolutely positioned over the viewport. Pull the
 * scroll surface into the card padding and inset the content by the same
 * amount, so the thumb sits in the margin instead of on the content.
 * 16px matches the thumb's hovered width (8px + space-050 padding each side).
 */
export const scrollGutter = css`
  > * {
    margin-right: calc(-1 * var(--space-300));
  }

  [data-radix-scroll-area-viewport] {
    box-sizing: border-box;
    padding-right: var(--space-300);
  }

  /* Radix sizes this wrapper as a table so it can measure overflow. A table
     will not shrink below its content, so a long chip row slides under the
     thumb. Block layout keeps the row inside the padded viewport; height
     still follows the children, which is what the thumb length uses. */
  [data-radix-scroll-area-viewport] > div {
    display: block !important;
    width: 100%;
    min-width: 0 !important;
  }
`;
