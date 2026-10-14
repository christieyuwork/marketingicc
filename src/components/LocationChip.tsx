import styled from "styled-components";
import locationIcon from "../assets/icons/custom/location_on.svg";
import { ChipIcon, ChipLabel, chipFrame } from "./chipStyles";

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
      <ChipIcon src={locationIcon} alt="" width={iconSize} height={iconSize} />
      <ChipLabel>{label}</ChipLabel>
    </Root>
  );
}

const Root = styled.span<{ $surface: "dark" | "light" }>`
  ${chipFrame}
  background: ${(props) =>
    props.$surface === "light" ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.12)"};
  color: var(--color-text-icon-primary);
`;
