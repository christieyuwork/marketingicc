import { Badge } from "@cake-admin/cakeand";
import styled from "styled-components";
import micIcon from "../assets/icons/custom/mic.svg";

type SpeakerChipProps = {
  /** Mic glyph size in px — registration uses 18, denser lists use 12. */
  iconSize?: number;
};

/** Jade solid Speaker chip — shared across Dashboard, Registration, and Seating. */
export function SpeakerChip({ iconSize = 18 }: SpeakerChipProps) {
  return (
    <Root color="jade" tone="solid" dot={false}>
      <MicGlyph src={micIcon} alt="" width={iconSize} height={iconSize} />
      Speaker
    </Root>
  );
}

const Root = styled(Badge)`
  && {
    display: inline-flex;
    justify-self: start;
    width: fit-content;
    max-width: 100%;
    min-width: 0;
    height: auto;
    min-height: 16px;
    padding: 0 var(--space-050);
    gap: var(--space-050);
    font-size: var(--type-size-caption);
    font-weight: var(--font-weight-bold);
    letter-spacing: 0.2px;
    line-height: 1.35;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const MicGlyph = styled.img`
  display: block;
  object-fit: contain;
  flex: none;
`;
