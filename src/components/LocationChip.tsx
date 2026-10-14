import styled from "styled-components";
import locationIcon from "../assets/icons/custom/location_on.svg";

type LocationChipProps = {
  label: string;
  /** Location glyph size in px — registration uses 18, denser lists use 12. */
  iconSize?: number;
  /** `light` for white cards (black/10a); default is for dark surfaces (white/12a). */
  surface?: "dark" | "light";
  className?: string;
};

/** Neutral location pill with pin icon — shared across Registration and guest surfaces. */
export function LocationChip({
  label,
  iconSize = 18,
  surface = "dark",
  className,
}: LocationChipProps) {
  return (
    <Root
      className={className}
      title={label}
      $surface={surface}
      {...(surface === "light" ? { "data-theme": "light.a" as const } : {})}
    >
      <Icon src={locationIcon} alt="" width={iconSize} height={iconSize} />
      <Label>{label}</Label>
    </Root>
  );
}

const Root = styled.span<{ $surface: "dark" | "light" }>`
  display: inline-flex;
  align-items: center;
  gap: var(--space-050);
  justify-self: start;
  width: fit-content;
  max-width: 100%;
  min-width: 0;
  min-height: 16px;
  padding: 0 var(--space-050);
  border-radius: var(--radius-1000);
  background: ${(props) =>
    props.$surface === "light" ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.12)"};
  color: var(--color-text-icon-primary);
  font-size: var(--type-size-caption);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.2px;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

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
