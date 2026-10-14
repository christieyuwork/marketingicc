import { Badge } from "@cake-admin/cakeand";
import type { ComponentProps, ReactNode } from "react";
import styled from "styled-components";
import type { GuestType } from "../../server/registrationData";
import { ChipLabel, chipFrame } from "./chipStyles";

export type TagColor = NonNullable<ComponentProps<typeof Badge>["color"]>;

type TagChipProps = {
  color: TagColor;
  children: ReactNode;
  /** Full text for the native tooltip; defaults to string children. */
  title?: string;
  className?: string;
};

/** Subtle cake& badge used for every colored category chip (groups, receptions, fill, etc.). */
export function TagChip({ color, children, title, className }: TagChipProps) {
  return (
    <Root
      className={className}
      color={color}
      tone="subtle"
      dot={false}
      title={title ?? (typeof children === "string" ? children : undefined)}
    >
      <ChipLabel>{children}</ChipLabel>
    </Root>
  );
}

export function guestTypeColor(type: GuestType): TagColor {
  if (type === "General Attendee") return "blue";
  if (type === "Enhanced Guest") return "jade";
  if (type === "Suite Guest") return "orange";
  return "yellow";
}

export function GuestTypeChip({ type, className }: { type: GuestType; className?: string }) {
  return (
    <TagChip color={guestTypeColor(type)} className={className}>
      {type}
    </TagChip>
  );
}

const Root = styled(Badge)`
  && {
    ${chipFrame}
  }
`;
