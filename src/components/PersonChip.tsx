import styled, { css } from "styled-components";
import accountCircleIcon from "../assets/icons/custom/account_circle.svg";

type PersonChipProps = {
  name: string;
  /** Account glyph size in px — registration uses 18, denser lists use 12. */
  iconSize?: number;
  onClick?: () => void;
  className?: string;
};

const chipStyles = css`
  display: inline-flex;
  align-items: center;
  gap: var(--space-050);
  justify-self: start;
  width: fit-content;
  max-width: 100%;
  min-width: 0;
  min-height: 16px;
  margin: 0;
  padding: 0 var(--space-050);
  border: 0;
  border-radius: var(--radius-1000);
  /* Figma white/80a — container-blur-high is black under dark.a */
  background: rgba(255, 255, 255, 0.8);
  color: var(--color-text-icon-inverse);
  font-size: var(--type-size-caption);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.2px;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &:hover,
  &:focus-visible {
    outline: var(--stroke-100) solid var(--color-text-icon-primary);
    outline-offset: 1px;
  }
`;

/** Light person pill with account icon — shared across Registration, Dashboard, Seating. */
export function PersonChip({ name, iconSize = 18, onClick, className }: PersonChipProps) {
  const icon = <Icon src={accountCircleIcon} alt="" width={iconSize} height={iconSize} />;

  if (onClick) {
    return (
      <Interactive type="button" onClick={onClick} className={className} title={name}>
        {icon}
        <Label>{name}</Label>
      </Interactive>
    );
  }

  return (
    <Static className={className} title={name}>
      {icon}
      <Label>{name}</Label>
    </Static>
  );
}

const Icon = styled.img`
  display: block;
  flex: none;
  object-fit: contain;
`;

const Label = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Static = styled.span`
  ${chipStyles}
`;

const Interactive = styled.button`
  ${chipStyles}
  cursor: pointer;
  pointer-events: auto;
`;
