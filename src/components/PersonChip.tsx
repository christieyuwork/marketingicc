import styled, { css } from "styled-components";
import accountCircleIcon from "../assets/icons/custom/account_circle.svg";
import { ChipIcon, ChipLabel, chipFrame } from "./chipStyles";

type PersonChipProps = {
  name: string;
  /** Account glyph size in px — registration uses 18, denser lists use 12. */
  iconSize?: number;
  onClick?: () => void;
  className?: string;
};

/** Light person pill with account icon — shared across Registration, Dashboard, Seating. */
export function PersonChip({ name, iconSize = 18, onClick, className }: PersonChipProps) {
  const icon = <ChipIcon src={accountCircleIcon} alt="" width={iconSize} height={iconSize} />;

  if (onClick) {
    return (
      <Interactive type="button" onClick={onClick} className={className} title={name}>
        {icon}
        <ChipLabel>{name}</ChipLabel>
      </Interactive>
    );
  }

  return (
    <Static className={className} title={name}>
      {icon}
      <ChipLabel>{name}</ChipLabel>
    </Static>
  );
}

/** "+N more people" pill that sits after a run of person chips. */
export function OverflowPersonChip({ count }: { count: number }) {
  return (
    <Static>
      <ChipLabel>+{count}</ChipLabel>
    </Static>
  );
}

/* Figma white/80a — container-blur-high is black under dark.a */
const personSurface = css`
  ${chipFrame}
  background: rgba(255, 255, 255, 0.8);
  color: var(--color-text-icon-inverse);
`;

const Static = styled.span`
  ${personSurface}
`;

const Interactive = styled.button`
  ${personSurface}
  cursor: pointer;
  pointer-events: auto;

  &:hover,
  &:focus-visible {
    outline: var(--stroke-100) solid var(--color-text-icon-primary);
    outline-offset: 1px;
  }
`;
