import { IconButton } from "@cake-admin/cakeand";
import { Copy, X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import type { GuestInfo } from "../../../server/seatingData";
import accountCircle from "../../assets/icons/custom/account_circle.svg";
import { GLOBAL_ACCOUNTS } from "../../../server/registrationData";
import { CompanyChip } from "../../components/CompanyChip";
import { LocationChip } from "../../components/LocationChip";
import { TagChip } from "../../components/TagChip";

const globalAccounts = new Set<string>(GLOBAL_ACCOUNTS);

type GuestInfoPopupProps = {
  guest: GuestInfo;
  onClose: () => void;
};

export function GuestInfoPopup({ guest, onClose }: GuestInfoPopupProps) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(guest.email);
    } catch {
      /* ignore */
    }
  }

  return createPortal(
    <Scrim onClick={onClose} role="presentation">
      <Dialog
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-info-title"
        onClick={(event) => event.stopPropagation()}
      >
        <DialogHeader>
          <TitlePill id="guest-info-title">Guest info</TitlePill>
          <CloseWrap>
            <IconButton label="Close" icon={<X size={24} />} size="md" intent="secondary" variant="tonal" onClick={onClose} />
          </CloseWrap>
        </DialogHeader>

        <Grid>
          <ProfileCard data-theme="light.a">
            <ProfileTop>
              <ProfileMain>
                <AccountIcon src={accountCircle} alt="" width={32} height={32} />
                <div>
                  <GuestName>{guest.name}</GuestName>
                  <GuestTitle>{guest.title}</GuestTitle>
                </div>
                <EmailRow>
                  <Email>{guest.email}</Email>
                  <CopyBtn type="button" aria-label="Copy email" onClick={copyEmail}>
                    <Copy size={14} />
                  </CopyBtn>
                </EmailRow>
              </ProfileMain>
              <LocationChip label={guest.country} iconSize={12} surface="light" />
            </ProfileTop>
          </ProfileCard>

          <NotesCard>
            <FieldLabel>Notes</FieldLabel>
            <NoteBlock>
              <NoteHeading>Diet</NoteHeading>
              <NoteMuted>{guest.diet}</NoteMuted>
            </NoteBlock>
            <NoteBlock>
              <NoteHeading>Special assistance</NoteHeading>
              <NoteValue $muted={guest.assistance === "Not specified"}>{guest.assistance}</NoteValue>
            </NoteBlock>
            <NoteBlock>
              <NoteHeading>Other</NoteHeading>
              <NoteMuted>{guest.otherNotes}</NoteMuted>
            </NoteBlock>
          </NotesCard>

          <InfoCard>
            <FieldLabel>Guest package</FieldLabel>
            <TagChip color={guest.packageColor === "jade" ? "jade" : "green"}>{guest.packageLabel}</TagChip>
          </InfoCard>

          <InfoCard>
            <FieldLabel>Receptions attending:</FieldLabel>
            {guest.receptions.map((item) => (
              <TagChip key={item} color="cyan">
                {item}
              </TagChip>
            ))}
          </InfoCard>

          <InfoCard $span2>
            <FieldLabel>Company</FieldLabel>
            <Inline>
              <CompanyChip name={guest.company} global={globalAccounts.has(guest.company)} />
              <TagChip color="blue">{guest.companyRegistered}</TagChip>
            </Inline>
          </InfoCard>

          <InfoCard $span2>
            <FieldLabel>Guest group</FieldLabel>
            <Inline>
              <TagChip color="purple">{guest.group}</TagChip>
              <TagChip color="green">{guest.groupProgress}</TagChip>
            </Inline>
          </InfoCard>

          <InfoCard $span2>
            <FieldLabel>Seating</FieldLabel>
            <Inline>
              <TagChip color="violet">{guest.seatingSection}</TagChip>
              <TagChip color="amber">{guest.seatingFill}</TagChip>
            </Inline>
            <AlongCard>
              <AlongLabel>Along with:</AlongLabel>
              <AlongPills>
                {guest.alongWith.map((group) => (
                  <TagChip key={group} color="purple">
                    {group}
                  </TagChip>
                ))}
              </AlongPills>
            </AlongCard>
          </InfoCard>
        </Grid>
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
  max-height: calc(100vh - 48px);
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-300);
  background: transparent;
`;

const DialogHeader = styled.div`
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
`;

const CloseWrap = styled.div`
  flex: none;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: auto auto auto auto auto;
  gap: var(--space-300);
  background: transparent;
  isolation: isolate;
`;

const Glass = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-100);
  padding: var(--space-300);
  border-radius: var(--radius-400);
  min-width: 0;
  isolation: isolate;
`;

/** White profile — Figma container-blur-high + light elevation. */
const ProfileCard = styled(Glass)`
  grid-column: 1 / 3;
  grid-row: 1;
  background: var(--color-surfaces-container-blur-high);
  backdrop-filter: blur(45px);
  box-shadow: var(--elevation-5);
`;

/**
 * Dark panels as separate cards (Figma black/50a).
 * Avoid stacking a light frosted wash that reads as one body wrapper.
 */
const DarkCard = styled(Glass)`
  background: rgba(0, 0, 0, 0.5);
  /* Figma dark-card elevation */
  box-shadow:
    0 8px 24px 0 var(--color-elevation-drop-shadow-light),
    0 4px 48px 0 var(--color-elevation-drop-shadow-heavy);
`;

const NotesCard = styled(DarkCard)`
  grid-column: 3;
  grid-row: 1 / 6;
`;

const InfoCard = styled(DarkCard)<{ $span2?: boolean }>`
  grid-column: ${(props) => (props.$span2 ? "1 / 3" : "auto")};
  align-items: flex-start;
`;

const ProfileTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-300);
  width: 100%;
`;

const ProfileMain = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-300);
  min-width: 0;
`;

const AccountIcon = styled.img`
  display: block;
`;

const GuestName = styled.p`
  margin: 0;
  font-size: var(--type-size-subject);
  font-weight: var(--font-weight-bold);
  line-height: 1.35;
  color: #252629;
`;

const GuestTitle = styled.p`
  margin: var(--space-050) 0 0;
  font-size: var(--type-size-caption);
  letter-spacing: 0.2px;
  line-height: 1.35;
  color: #454649;
`;

const EmailRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-050);
`;

const Email = styled.span`
  font-size: var(--type-size-caption);
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.2px;
  line-height: 1.35;
  color: #7a126b;
`;

const CopyBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: #7a126b;
  cursor: pointer;
`;

const FieldLabel = styled.p`
  margin: 0;
  font-size: var(--type-size-caption);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.2px;
  line-height: 1.35;
  color: var(--color-text-icon-primary);
`;

const Inline = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-100);
  width: 100%;
  min-width: 0;
`;

const AlongCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-100);
  margin-top: var(--space-100);
  padding: var(--space-300);
  border-radius: var(--radius-200);
  width: 100%;
  min-width: 0;
  background: var(--color-tonal-tonal-secondary-overlay);
  border: var(--stroke-100) solid var(--color-stroke-border-pop);
`;

const AlongLabel = styled.span`
  font-size: var(--type-size-caption);
  letter-spacing: 0.2px;
  line-height: 1.35;
  color: var(--color-text-icon-secondary);
`;

const AlongPills = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-100);
  width: 100%;
  min-width: 0;

  > * {
    max-width: 100%;
  }
`;

const NoteBlock = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-100);
  padding: var(--space-300);
  border-radius: var(--radius-200);
  background: var(--color-tonal-tonal-secondary-overlay);
  border: var(--stroke-100) solid var(--color-stroke-border-pop);
  min-height: 0;
`;

const NoteHeading = styled.p`
  margin: 0;
  font-size: var(--type-size-caption);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.2px;
  line-height: 1.35;
  color: var(--color-text-icon-primary);
`;

const NoteMuted = styled.p`
  margin: 0;
  flex: 1;
  font-size: var(--type-size-caption);
  letter-spacing: 0.2px;
  line-height: 1.35;
  color: var(--color-text-icon-placeholder);
`;

const NoteValue = styled.p<{ $muted?: boolean }>`
  margin: 0;
  flex: 1;
  font-size: var(--type-size-caption);
  letter-spacing: 0.2px;
  line-height: 1.35;
  color: ${(props) =>
    props.$muted ? "var(--color-text-icon-placeholder)" : "var(--color-text-icon-primary)"};
`;
