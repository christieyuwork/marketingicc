import styled, { css } from "styled-components";

/** 16px caption pill that hugs its content and never grows past its cell. */
export const chipFrame = css`
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: var(--space-050);
  justify-self: start;
  width: fit-content;
  max-width: 100%;
  min-width: 0;
  height: auto;
  min-height: 16px;
  margin: 0;
  padding: 0 var(--space-050);
  border: 0;
  border-radius: var(--radius-1000);
  font-size: var(--type-size-caption);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.2px;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
`;

/** Text slot inside a chip; flex items only ellipsize when the text sits in its own box. */
export const ChipLabel = styled.span`
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ChipIcon = styled.img`
  display: block;
  flex: none;
  object-fit: contain;
`;
