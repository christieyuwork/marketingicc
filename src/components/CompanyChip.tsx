import { Badge } from "@cake-admin/cakeand";
import styled from "styled-components";

type CompanyChipProps = {
  name: string;
  /** Global accounts use the lime subtle badge. */
  global?: boolean;
  className?: string;
};

/** Company label — lime when global, otherwise neutral white/12a pill. */
export function CompanyChip({ name, global = false, className }: CompanyChipProps) {
  if (global) {
    return (
      <GlobalBadge className={className} color="lime" tone="subtle" dot={false} title={name}>
        {name}
      </GlobalBadge>
    );
  }

  return (
    <Neutral className={className} title={name}>
      {name}
    </Neutral>
  );
}

const hug = `
  && {
    display: inline-flex;
    justify-self: start;
    width: fit-content;
    max-width: 100%;
    min-width: 0;
    height: 16px;
    min-height: 16px;
    padding: 0 var(--space-050);
    font-size: var(--type-size-caption);
    font-weight: var(--font-weight-bold);
    letter-spacing: 0.2px;
    line-height: 1.35;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const GlobalBadge = styled(Badge)`
  ${hug}
`;

const Neutral = styled.span`
  display: inline-flex;
  align-items: center;
  justify-self: start;
  width: fit-content;
  max-width: 100%;
  min-height: 16px;
  padding: 0 var(--space-050);
  border-radius: var(--radius-1000);
  /* Figma white/12a */
  background: rgba(255, 255, 255, 0.12);
  color: var(--color-text-icon-primary);
  font-size: var(--type-size-caption);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.2px;
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
