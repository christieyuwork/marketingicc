import { Badge } from "@cake-admin/cakeand";
import styled from "styled-components";
import micIcon from "../assets/icons/custom/mic.svg";
import { ChipIcon, ChipLabel, chipFrame } from "./chipStyles";

type SpeakerChipProps = {
  /** Mic glyph size in px — registration uses 18, denser lists use 12. */
  iconSize?: number;
};

/** Jade solid Speaker chip — shared across Dashboard, Registration, and Seating. */
export function SpeakerChip({ iconSize = 18 }: SpeakerChipProps) {
  return (
    <Root color="jade" tone="solid" dot={false}>
      <ChipIcon src={micIcon} alt="" width={iconSize} height={iconSize} />
      <ChipLabel>Speaker</ChipLabel>
    </Root>
  );
}

const Root = styled(Badge)`
  && {
    ${chipFrame}
  }
`;
