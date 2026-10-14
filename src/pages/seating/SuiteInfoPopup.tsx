import { Badge, IconButton, Scrollbar } from "@cake-admin/cakeand";
import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import type { SuiteDetail } from "../../../server/seatingData";
import chairIcon from "../../assets/icons/seating/chair.svg";
import chairCounterIcon from "../../assets/icons/seating/chair_counter.svg";
import displayGroupIcon from "../../assets/icons/seating/display_group.svg";
import { CompanyChip } from "../../components/CompanyChip";
import { PersonChip } from "../../components/PersonChip";
import { SpeakerChip } from "../../components/SpeakerChip";

type SuiteInfoPopupProps = {
  detail: SuiteDetail;
  onClose: () => void;
  onGuestClick: (name: string) => void;
};

function seatLabel(filled: number, capacity: number) {
  const pct = capacity > 0 ? Math.round((filled / capacity) * 100) : 0;
  return `${filled}/${capacity} (${pct}%) seats filled`;
}

export function SuiteInfoPopup({ detail, onClose, onGuestClick }: SuiteInfoPopupProps) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const layoutIcons = [
    ...Array.from({ length: detail.hapticSeats }, () => "haptic" as const),
    ...Array.from({ length: detail.barstoolSeats }, () => "barstool" as const),
  ];

  return createPortal(
    <Scrim onClick={onClose} role="presentation">
      <Dialog
        role="dialog"
        aria-modal="true"
        aria-labelledby="suite-info-title"
        onClick={(event) => event.stopPropagation()}
      >
        <DialogHeader>
          <TitlePill id="suite-info-title">
            <strong>Suite {detail.suiteNumber} </strong>
            <span>({detail.levelLabel})</span>
          </TitlePill>
          <IconButton label="Close" icon={<X size={24} />} size="md" intent="secondary" variant="tonal" onClick={onClose} />
        </DialogHeader>

        <TopRow>
          {/* Light surface: scope light.a so text + green badge tokens match Figma */}
          <SummaryCard data-theme="light.a">
            <SummaryInner>
              <DisplayIcon src={displayGroupIcon} alt="" width={32} height={32} />
              <SummaryCopy>
                <TextBlock>
                  <SuiteName>{detail.suiteName}</SuiteName>
                  <SuiteLead>Suite Lead: {detail.suiteLead}</SuiteLead>
                </TextBlock>
                <FillBadge color="green" tone="subtle" dot={false}>
                  {seatLabel(detail.filled, detail.capacity)}
                </FillBadge>
              </SummaryCopy>
            </SummaryInner>
          </SummaryCard>

          <ConfigCard>
            <FieldLabel>Room configuration</FieldLabel>
            <ConfigBody>
              <ConfigStats>
                <StatPrimary>Total seats: {detail.totalSeats}</StatPrimary>
                <StatSecondary>Haptic seats: {detail.hapticSeats}</StatSecondary>
                <StatSecondary>Barstool seats: {detail.barstoolSeats}</StatSecondary>
              </ConfigStats>
              <SeatGrid aria-hidden="true">
                {layoutIcons.map((type, index) => (
                  <SeatGlyph
                    key={`${type}-${index}`}
                    src={type === "haptic" ? chairIcon : chairCounterIcon}
                    alt=""
                    width={18}
                    height={18}
                  />
                ))}
              </SeatGrid>
            </ConfigBody>
          </ConfigCard>
        </TopRow>

        <SeatingCard>
          <FieldLabel>Seating</FieldLabel>
          <ListShell>
            <Scrollbar maxHeight="100%">
              <SeatList>
                {detail.seats.map((row, index) => (
                  <SeatRow key={`${row.seat}-${row.name}-${index}`} $alt={index % 2 === 1}>
                    <SeatNum>
                      <span>{row.seat}</span>
                      <SeatTypeIcon
                        src={row.seatType === "haptic" ? chairIcon : chairCounterIcon}
                        alt=""
                        width={18}
                        height={18}
                      />
                    </SeatNum>
                    <PersonChip name={row.name} iconSize={12} onClick={() => onGuestClick(row.name)} />
                    <Role>{row.role}</Role>
                    <CompanyChip name={row.company} global={row.companyTone === "lime"} />
                    <TagCell>
                      {row.speaker ? (
                        <SpeakerChip iconSize={12} />
                      ) : row.group ? (
                        <GroupBadge color="purple" tone="subtle" dot={false} title={row.group}>
                          <GroupLabel>{row.group}</GroupLabel>
                        </GroupBadge>
                      ) : null}
                    </TagCell>
                  </SeatRow>
                ))}
              </SeatList>
            </Scrollbar>
          </ListShell>
        </SeatingCard>
      </Dialog>
    </Scrim>,
    document.body,
  );
}

const Scrim = styled.div`
  position: fixed;
  inset: 0;
  z-index: 11000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-500);
  background: var(--color-overlay-scrim);
  backdrop-filter: blur(12px);
`;

const Dialog = styled.div`
  width: min(800px, 100%);
  height: min(720px, calc(100vh - 48px));
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto minmax(0, 1fr);
  gap: var(--space-300);
`;

const DialogHeader = styled.div`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-300);
`;

const TitlePill = styled.h2`
  margin: 0;
  padding: var(--space-300);
  border-radius: var(--radius-200);
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(90px);
  box-shadow: 0 8px 36px rgba(0, 0, 0, 0.15);
  font-size: var(--type-size-title);
  font-weight: var(--font-weight-bold);
  line-height: 1.35;
  color: #f1e1ed;

  span {
    font-weight: var(--font-weight-regular);
    letter-spacing: 0.4px;
  }

  strong {
    font-weight: var(--font-weight-bold);
  }
`;

const TopRow = styled.div`
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-300);
  min-height: 148px;
`;

const Glass = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-100);
  padding: var(--space-300);
  border-radius: var(--radius-400);
  backdrop-filter: blur(45px);
  box-shadow: var(--elevation-5);
  min-width: 0;
  min-height: 0;
`;

const SummaryCard = styled(Glass)`
  background: var(--color-surfaces-container-blur-high);
`;

const SummaryInner = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-300);
  width: 100%;
`;

const SummaryCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-200);
  width: 100%;
`;

const TextBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-050);
  width: 100%;
  min-width: 0;
`;

const ConfigCard = styled(Glass)`
  background: rgba(0, 0, 0, 0.5);
`;

const SeatingCard = styled(Glass)`
  grid-column: 1 / -1;
  background: rgba(0, 0, 0, 0.5);
  overflow: hidden;
  min-height: 0;
`;

const DisplayIcon = styled.img`
  display: block;
`;

const SuiteName = styled.p`
  margin: 0;
  font-size: var(--type-size-subject);
  font-weight: var(--font-weight-bold);
  line-height: 1.35;
  color: var(--color-text-icon-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SuiteLead = styled.p`
  margin: 0;
  font-size: var(--type-size-caption);
  letter-spacing: 0.2px;
  line-height: 1.35;
  color: var(--color-text-icon-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FillBadge = styled(Badge)`
  && {
    align-self: flex-start;
  }
`;

const FieldLabel = styled.p`
  margin: 0;
  font-size: var(--type-size-caption);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.2px;
  line-height: 1.35;
  color: var(--color-text-icon-primary);
`;

const ConfigBody = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-300);
  width: 100%;
`;

const ConfigStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-050);
  min-width: 120px;
`;

const StatPrimary = styled.span`
  font-size: var(--type-size-caption);
  letter-spacing: 0.2px;
  line-height: 1.35;
  color: var(--color-text-icon-primary);
`;

const StatSecondary = styled.span`
  font-size: var(--type-size-caption);
  letter-spacing: 0.2px;
  line-height: 1.35;
  color: var(--color-text-icon-secondary);
`;

const SeatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 18px);
  gap: var(--space-050);
`;

const SeatGlyph = styled.img`
  display: block;
`;

const ListShell = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;

  > * {
    height: 100%;
  }
`;

const SeatList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const SEAT_NUM_W = 48;

const SeatRow = styled.div<{ $alt?: boolean }>`
  display: grid;
  grid-template-columns: ${SEAT_NUM_W}px minmax(0, 1.1fr) minmax(0, 1fr) minmax(0, 0.9fr) minmax(0, 1.4fr);
  gap: var(--space-100);
  align-items: center;
  min-height: 32px;
  padding: var(--space-100) 2px var(--space-100) var(--space-100);
  background: ${(props) => (props.$alt ? "rgba(255, 255, 255, 0.1)" : "transparent")};
`;

const SeatNum = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  width: ${SEAT_NUM_W}px;
  gap: 2px;
  padding: 0 var(--space-050);
  border-radius: var(--radius-1000);
  background: rgba(255, 255, 255, 0.12);
  font-size: var(--type-size-caption);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.2px;
  line-height: 1.35;
  color: var(--color-text-icon-primary);
`;

const SeatTypeIcon = styled.img`
  display: block;
  flex: none;
  width: 18px;
  height: 18px;
`;

const Role = styled.span`
  font-size: var(--type-size-caption);
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.2px;
  line-height: 1.35;
  color: var(--color-text-icon-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
`;

/** Stretch to column width so chip max-width:100% can truncate (not overflow/clip). */
const TagCell = styled.div`
  display: flex;
  align-items: center;
  justify-self: stretch;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;

  > * {
    max-width: 100%;
  }
`;

const GroupBadge = styled(Badge)`
  && {
    display: inline-flex;
    align-items: center;
    width: max-content;
    max-width: 100%;
    min-width: 0;
    height: 16px;
    min-height: 16px;
    padding: 0 var(--space-050);
    overflow: hidden;
  }
`;

const GroupLabel = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--type-size-caption);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.2px;
  line-height: 1.35;
`;
