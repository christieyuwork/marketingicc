import type { ButtonHTMLAttributes, ReactNode } from "react";
import styled, { css } from "styled-components";
import { ChipLabel, chipFrame } from "./chipStyles";

type NeutralChipProps = {
  children: ReactNode;
  title?: string;
  className?: string;
  /** Renders a button when set; otherwise a static span. */
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "onClick" | "title" | "className">;

/** Neutral white/12a pill — companies without a global account, section and suite ids. */
export function NeutralChip({ children, title, className, onClick, ...buttonProps }: NeutralChipProps) {
  const label = title ?? (typeof children === "string" ? children : undefined);

  if (onClick) {
    return (
      <Interactive type="button" className={className} title={label} onClick={onClick} {...buttonProps}>
        <ChipLabel>{children}</ChipLabel>
      </Interactive>
    );
  }

  return (
    <Static className={className} title={label}>
      <ChipLabel>{children}</ChipLabel>
    </Static>
  );
}

const neutral = css`
  ${chipFrame}
  /* Figma white/12a */
  background: rgba(255, 255, 255, 0.12);
  color: var(--color-text-icon-primary);
`;

const Static = styled.span`
  ${neutral}
`;

const Interactive = styled.button`
  ${neutral}
  cursor: pointer;

  &:hover,
  &:focus-visible {
    outline: var(--stroke-100) solid var(--color-text-icon-primary);
    outline-offset: 1px;
  }
`;
