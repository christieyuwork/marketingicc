import { NeutralChip } from "./NeutralChip";
import { TagChip } from "./TagChip";

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
      <TagChip color="lime" className={className}>
        {name}
      </TagChip>
    );
  }

  return <NeutralChip className={className}>{name}</NeutralChip>;
}
