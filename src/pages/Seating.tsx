import { Card, Dropdown, Scrollbar } from "@cake-admin/cakeand";
import { memo, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import {
  fillColor,
  getGuestInfo,
  getSeating,
  getSuiteDetail,
  SUITE_FILTER_OPTIONS,
  type GuestInfo,
  type SectionCell,
  type SuiteCell,
  type SuiteDetail,
} from "../../server/seatingData";
import frontStageMic from "../assets/icons/front-stage-mic.svg";
import { EChart } from "../charts/EChart";
import { gaugeOption, ticketOption } from "../charts/options";
import { scrollGutter } from "../components/scrollGutter";
import { NeutralChip } from "../components/NeutralChip";
import { OverflowPersonChip, PersonChip } from "../components/PersonChip";
import { TagChip } from "../components/TagChip";
import { GuestInfoPopup } from "./seating/GuestInfoPopup";
import { SuiteInfoPopup } from "./seating/SuiteInfoPopup";

const data = getSeating();

type HoverState =
  | { kind: "section"; cell: SectionCell; rect: DOMRect }
  | { kind: "suite"; cell: SuiteCell; rect: DOMRect }
  | null;

function seatLabel(filled: number, capacity: number) {
  const pct = capacity > 0 ? Math.round((filled / capacity) * 100) : 0;
  return `${filled}/${capacity} (${pct}%) seats filled`;
}

function tooltipPosition(rect: DOMRect, width: number, height: number) {
  const gap = 12;
  const pad = 8;
  let left = rect.right + gap;
  let top = rect.top + rect.height / 2 - height / 2;

  if (left + width > window.innerWidth - pad) {
    left = rect.left - width - gap;
  }
  if (left < pad) left = pad;
  if (top < pad) top = pad;
  if (top + height > window.innerHeight - pad) {
    top = Math.max(pad, window.innerHeight - height - pad);
  }
  return { left, top };
}

export function Seating() {
  const [hover, setHover] = useState<HoverState>(null);
  const [suiteFilter, setSuiteFilter] = useState("all");
  const [guest, setGuest] = useState<GuestInfo | null>(null);
  const [suiteDetail, setSuiteDetail] = useState<SuiteDetail | null>(null);
  const leaveTimer = useRef<number | null>(null);

  function cancelLeave() {
    if (leaveTimer.current != null) {
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  }

  function scheduleLeave() {
    cancelLeave();
    leaveTimer.current = window.setTimeout(() => setHover(null), 160);
  }

  function openGuest(name: string) {
    cancelLeave();
    setHover(null);
    setGuest(getGuestInfo(name));
  }

  function openSuite(cell: SuiteCell) {
    if (cell.level === "disabled") return;
    cancelLeave();
    setHover(null);
    setSuiteDetail(getSuiteDetail(cell));
  }

  return (
    <Page>
      <HeaderRow>
        <TitleBar>
          <Title>Seating allocation</Title>
        </TitleBar>
        <Notice>{data.notice}</Notice>
      </HeaderRow>

      <Layout>
        <SeatingMetrics />
        <SuiteGapCard
          onHover={(cell, rect) => {
            cancelLeave();
            setHover((prev) => {
              if (prev?.kind === "suite" && prev.cell.id === cell.id) return prev;
              return { kind: "suite", cell, rect };
            });
          }}
          onLeave={scheduleLeave}
          onOpen={openSuite}
        />

        <SectionCard>
          <MapHeader>
            <MapTitle>Section fill status</MapTitle>
            <Updated>{data.updated}</Updated>
          </MapHeader>
          <SphereMap>
            <StageRail aria-hidden="true">
              <StageInner>
                <StageIcon src={frontStageMic} alt="" width={32} height={32} />
                <span>Front of stage</span>
              </StageInner>
            </StageRail>
            <SectionGrid>
              {data.sectionColumns.map((column, index) => (
                <SectionColumn key={index} $rows={column.length}>
                  {column.map((cell) => (
                    <FillCell
                      key={cell.id}
                      type="button"
                      $level={cell.level}
                      $color={fillColor(cell.level)}
                      disabled={cell.level === "disabled"}
                      aria-label={`Section ${cell.label}`}
                      onMouseEnter={(event) => {
                        if (cell.level === "disabled") return;
                        const rect = event.currentTarget.getBoundingClientRect();
                        setHover((prev) => {
                          if (prev?.kind === "section" && prev.cell.id === cell.id) return prev;
                          return { kind: "section", cell, rect };
                        });
                      }}
                      onMouseLeave={() => setHover(null)}
                      onFocus={(event) => {
                        if (cell.level === "disabled") return;
                        const rect = event.currentTarget.getBoundingClientRect();
                        setHover((prev) => {
                          if (prev?.kind === "section" && prev.cell.id === cell.id) return prev;
                          return { kind: "section", cell, rect };
                        });
                      }}
                      onBlur={() => setHover(null)}
                    >
                      {cell.label}
                    </FillCell>
                  ))}
                </SectionColumn>
              ))}
            </SectionGrid>
          </SphereMap>
        </SectionCard>

        <SuiteCard>
          <MapHeader>
            <MapTitle>Suite fill status</MapTitle>
            <Updated>{data.updated}</Updated>
            <FilterWrap>
              <Dropdown
                label="Filter suites by owner"
                options={SUITE_FILTER_OPTIONS}
                value={suiteFilter}
                onValueChange={setSuiteFilter}
              />
            </FilterWrap>
          </MapHeader>
          <SphereMap>
            <StageRail aria-hidden="true">
              <StageInner>
                <StageIcon src={frontStageMic} alt="" width={32} height={32} />
                <span>Front of stage</span>
              </StageInner>
            </StageRail>
            <SuiteGrid>
              <SuiteColumn $rows={data.suiteLeft.length}>
                {data.suiteLeft.map((cell) => (
                  <SuiteFillButton
                    key={cell.id}
                    cell={cell}
                    onHover={(next) => {
                      cancelLeave();
                      setHover((prev) => {
                        if (prev?.kind === "suite" && prev.cell.id === next?.cell.id) return prev;
                        return next;
                      });
                    }}
                    onLeave={scheduleLeave}
                    muted={suiteFilter !== "all" && cell.ownerId !== suiteFilter}
                    onOpen={() => openSuite(cell)}
                  />
                ))}
              </SuiteColumn>
              <SuiteColumn $rows={data.suiteRight.length}>
                {data.suiteRight.map((cell) => (
                  <SuiteFillButton
                    key={cell.id}
                    cell={cell}
                    muted={suiteFilter !== "all" && cell.ownerId !== suiteFilter}
                    onHover={(next) => {
                      cancelLeave();
                      setHover((prev) => {
                        if (prev?.kind === "suite" && prev.cell.id === next?.cell.id) return prev;
                        return next;
                      });
                    }}
                    onLeave={scheduleLeave}
                    onOpen={() => openSuite(cell)}
                  />
                ))}
              </SuiteColumn>
            </SuiteGrid>
          </SphereMap>
        </SuiteCard>
      </Layout>

      {hover ? (
        <HoverPortal
          hover={hover}
          onTooltipEnter={cancelLeave}
          onTooltipLeave={scheduleLeave}
          onGuestClick={openGuest}
        />
      ) : null}

      {guest ? <GuestInfoPopup guest={guest} onClose={() => setGuest(null)} /> : null}

      {suiteDetail ? (
        <SuiteInfoPopup
          detail={suiteDetail}
          onClose={() => setSuiteDetail(null)}
          onGuestClick={(name) => {
            setSuiteDetail(null);
            openGuest(name);
          }}
        />
      ) : null}
    </Page>
  );
}

/** Isolated so hover tooltip state does not re-render ticket/gauge charts. */
const SeatingMetrics = memo(function SeatingMetrics() {
  return (
    <>
      <GaugeCard $column="1" gauge={data.summary.sectionsFilled} />
      <GapListCard $column="2" title="Sections not filled" rows={data.sectionsNotFilled} />
      <GaugeCard $column="3" gauge={data.summary.suitesFilled} />
      <TicketCard>
        <CardTitle>Ticket allocation</CardTitle>
        <TicketRow>
          <TicketMeta>
            <strong>{data.ticket.totalLabel}</strong>
            <span>{data.ticket.percentLabel}</span>
          </TicketMeta>
          <TicketChart>
            <EChart option={ticketOption(data.ticket)} label="Ticket allocation" />
          </TicketChart>
        </TicketRow>
        <Legend>
          {data.ticket.segments
            .filter((segment) => segment.legend)
            .map((segment) => (
              <LegendItem key={segment.name}>
                <Swatch $color={segment.color} />
                {segment.name}: {segment.count}
              </LegendItem>
            ))}
          <LegendItem>
            <Swatch $color="#ffffff" />
            Target: {data.ticket.target}
          </LegendItem>
        </Legend>
      </TicketCard>
      <GaugeCard $column="8" gauge={data.summary.totalRegistration} />
    </>
  );
});

function GaugeCard({
  gauge,
  $column,
}: {
  gauge: (typeof data.summary)[keyof typeof data.summary];
  $column: string;
}) {
  return (
    <MetricCard $column={$column}>
      <CardTitle>{gauge.label}</CardTitle>
      <ChartFill>
        <EChart option={gaugeOption(gauge)} label={`${gauge.label}, ${gauge.percent} percent`} />
      </ChartFill>
    </MetricCard>
  );
}

function GapListCard({
  title,
  rows,
  $column,
}: {
  title: string;
  rows: { id: string; label: string; percent: number }[];
  $column: string;
}) {
  return (
    <MetricCard $column={$column}>
      <CardTitle>{title}</CardTitle>
      <ListFill>
        <Scrollbar maxHeight="100%">
          <GapStack>
            {rows.map((row) => (
              <GapLine key={row.id}>
                <IdChip>{row.label}</IdChip>
                <PercentChip color="red">{`${row.percent}%`}</PercentChip>
              </GapLine>
            ))}
          </GapStack>
        </Scrollbar>
      </ListFill>
    </MetricCard>
  );
}

function SuiteGapCard({
  onHover,
  onLeave,
  onOpen,
}: {
  onHover: (cell: SuiteCell, rect: DOMRect) => void;
  onLeave: () => void;
  onOpen: (cell: SuiteCell) => void;
}) {
  return (
    <MetricCard $column="4">
      <CardTitle>Suites not filled</CardTitle>
      <ListFill>
        <Scrollbar maxHeight="100%">
          <GapStack>
            {data.suitesNotFilled.map((cell) => {
              const percent = cell.capacity > 0 ? Math.round((cell.filled / cell.capacity) * 100) : 0;
              return (
                <GapLine key={cell.id}>
                  <IdChip
                    aria-label={`${cell.label}, ${percent} percent filled. Show suite details.`}
                    onMouseEnter={(event) => onHover(cell, event.currentTarget.getBoundingClientRect())}
                    onMouseLeave={onLeave}
                    onFocus={(event) => onHover(cell, event.currentTarget.getBoundingClientRect())}
                    onBlur={onLeave}
                    onClick={() => onOpen(cell)}
                  >
                    {cell.label}
                  </IdChip>
                  <PercentChip color="red">{`${percent}%`}</PercentChip>
                </GapLine>
              );
            })}
          </GapStack>
        </Scrollbar>
      </ListFill>
    </MetricCard>
  );
}

function SuiteFillButton({
  cell,
  muted = false,
  onHover,
  onLeave,
  onOpen,
}: {
  cell: SuiteCell;
  muted?: boolean;
  onHover: (state: HoverState) => void;
  onLeave: () => void;
  onOpen: () => void;
}) {
  const inactive = cell.level === "disabled" || muted;
  return (
    <FillCell
      type="button"
      $level={inactive ? "disabled" : cell.level}
      $color={inactive ? (cell.level === "disabled" ? fillColor("disabled") : "var(--color-disabled-disabled)") : fillColor(cell.level)}
      disabled={inactive}
      aria-label={muted ? `${cell.label}, not assigned to the selected executive` : cell.label}
      onMouseEnter={(event) => {
        if (inactive) return;
        onHover({ kind: "suite", cell, rect: event.currentTarget.getBoundingClientRect() });
      }}
      onMouseLeave={onLeave}
      onFocus={(event) => {
        if (inactive) return;
        onHover({ kind: "suite", cell, rect: event.currentTarget.getBoundingClientRect() });
      }}
      onBlur={onLeave}
      onClick={onOpen}
    >
      {cell.label}
    </FillCell>
  );
}

function HoverPortal({
  hover,
  onTooltipEnter,
  onTooltipLeave,
  onGuestClick,
}: {
  hover: NonNullable<HoverState>;
  onTooltipEnter: () => void;
  onTooltipLeave: () => void;
  onGuestClick: (name: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({
    width: hover.kind === "suite" ? 305 : 216,
    height: hover.kind === "suite" ? 279 : 244,
  });

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const { width, height } = node.getBoundingClientRect();
    setBox({ width, height });
  }, [hover]);

  const pos = tooltipPosition(hover.rect, box.width, box.height);

  return createPortal(
    <HoverCard
      ref={ref}
      $wide={hover.kind === "suite"}
      $interactive={hover.kind === "suite"}
      style={{ left: pos.left, top: pos.top }}
      role="tooltip"
      onMouseEnter={onTooltipEnter}
      onMouseLeave={onTooltipLeave}
    >
      {hover.kind === "section" ? (
        <SectionTooltip cell={hover.cell} />
      ) : (
        <SuiteTooltip cell={hover.cell} onGuestClick={onGuestClick} />
      )}
    </HoverCard>,
    document.body,
  );
}

function SectionTooltip({ cell }: { cell: SectionCell }) {
  return (
    <>
      <HoverHead>
        <HoverTitle>Section {cell.label}</HoverTitle>
        <TagChip color="green">{seatLabel(cell.filled, cell.capacity)}</TagChip>
      </HoverHead>
      <HoverBody>
        {cell.groups.map((group) => (
          <TagChip key={group} color="purple">
            {group}
          </TagChip>
        ))}
      </HoverBody>
    </>
  );
}

function SuiteTooltip({
  cell,
  onGuestClick,
}: {
  cell: SuiteCell;
  onGuestClick: (name: string) => void;
}) {
  return (
    <>
      <HoverHead>
        <SuiteHeadRow>
          <SuiteMeta>
            {cell.label} ({cell.levelLabel})
          </SuiteMeta>
          <ClickHint>(Click for details)</ClickHint>
        </SuiteHeadRow>
        <SuiteNameBlock>
          <SuiteName>{cell.suiteName}</SuiteName>
          <SuiteLead>Suite Lead: {cell.suiteLead}</SuiteLead>
        </SuiteNameBlock>
        <TagChip color="green">{seatLabel(cell.filled, cell.capacity)}</TagChip>
      </HoverHead>
      <HoverBody>
        <NameWrap>
          {cell.attendees.map((name, index) => (
            <PersonChip
              key={`${name}-${index}`}
              name={name}
              iconSize={12}
              onClick={() => onGuestClick(name)}
            />
          ))}
          {cell.moreCount > 0 ? <OverflowPersonChip count={cell.moreCount} /> : null}
        </NameWrap>
      </HoverBody>
    </>
  );
}

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-300);
  min-width: 0;
  min-height: 0;
  flex: 1;
  height: 100%;
  overflow: visible;
`;

const HeaderRow = styled.div`
  flex: none;
  display: flex;
  align-items: center;
  gap: var(--space-300);
  width: 100%;
`;

const TitleBar = styled.div`
  flex: none;
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 var(--space-200);
  border-radius: var(--radius-150);
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(90px);
  box-shadow: 0 8px 36px rgba(0, 0, 0, 0.15);
  width: fit-content;
`;

const Title = styled.h1`
  margin: 0;
  font-size: var(--type-size-title);
  font-weight: var(--font-weight-bold);
  line-height: 1.35;
  color: var(--color-text-icon-primary);
`;

const Notice = styled.p`
  margin: 0;
  font-size: var(--type-size-caption);
  font-weight: var(--font-weight-regular);
  letter-spacing: 0.2px;
  line-height: 1.35;
  color: var(--color-text-icon-secondary);
  white-space: nowrap;
`;

const Layout = styled.div`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  grid-template-rows: repeat(8, minmax(0, 1fr));
  gap: var(--space-300);
  overflow: visible;
`;

const Surface = styled(Card)`
  && {
    background: rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(90px);
    border: var(--stroke-100) solid #000000;
    box-shadow: 0 8px 36px rgba(0, 0, 0, 0.15);
    border-radius: var(--radius-400);
    padding: var(--space-500);
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: visible;
  }
`;

const MetricCard = styled(Surface)<{ $column: string }>`
  && {
    grid-column: ${(props) => props.$column};
    grid-row: 1 / 3;
    overflow: hidden;
  }
`;

const TicketCard = styled(Surface)`
  && {
    grid-column: 5 / 8;
    grid-row: 1 / 3;
    overflow: hidden;
  }
`;

const SectionCard = styled(Surface)`
  && {
    grid-column: 1 / 5;
    grid-row: 3 / 9;
    overflow: visible;
  }
`;

const SuiteCard = styled(Surface)`
  && {
    grid-column: 5 / 9;
    grid-row: 3 / 9;
    overflow: visible;
  }
`;

const CardTitle = styled.h2`
  margin: 0 0 var(--space-100);
  font-size: var(--type-size-helper);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.1px;
  line-height: 1.35;
  color: var(--color-text-icon-primary);
  flex: none;
`;

const TicketRow = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-200);
  align-items: center;
  min-height: 0;
  flex: 1;
`;

const TicketMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  font-size: var(--type-size-caption);
  line-height: 1.35;
  color: var(--color-text-icon-secondary);

  strong {
    color: var(--color-text-icon-primary);
    font-weight: var(--font-weight-bold);
  }
`;

const TicketChart = styled.div`
  min-width: 0;
  height: 48px;
`;

const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-300);
  align-items: center;
  justify-content: center;
  margin-top: var(--space-100);
  flex: none;
`;

const LegendItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: var(--type-size-caption);
  line-height: 1.35;
  color: var(--color-text-icon-secondary);
`;

const Swatch = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: var(--radius-50);
  background: ${(props) => props.$color};
  flex: none;
`;

const ChartFill = styled.div`
  flex: 1;
  min-height: 0;
  width: 100%;
`;

const ListFill = styled.div`
  flex: 1;
  min-height: 0;
  overflow: visible;
  ${scrollGutter}

  > * {
    height: 100%;
  }
`;

const GapStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-050);
  width: 100%;
  min-width: 0;
`;

const GapLine = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-width: 0;
`;

/* Gap-list layout: id stretches across the row, percent is a fixed column. */
const IdChip = styled(NeutralChip)`
  && {
    flex: 1;
    width: auto;
    min-width: 0;
    justify-content: center;
  }
`;

const PercentChip = styled(TagChip)`
  && {
    flex: none;
    width: 42px;
    justify-content: center;
  }
`;

const FilterWrap = styled.div`
  position: relative;
  width: 196px;
  flex: none;

  label {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  button {
    width: 100%;
    height: 24px;
    min-height: 24px;
    padding-block: 0;
    border-radius: var(--radius-1000);
    overflow: hidden;
  }

  button,
  button * {
    white-space: nowrap !important;
  }
`;

const MapHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-200);
  width: 100%;
  flex: none;
  margin-bottom: var(--space-300);
`;

const MapTitle = styled.h2`
  margin: 0;
  flex: 1;
  min-width: 0;
  font-size: var(--type-size-subject);
  font-weight: var(--font-weight-bold);
  line-height: 1.35;
  color: var(--color-text-icon-primary);
`;

const Updated = styled.span`
  font-size: 10px;
  font-weight: var(--font-weight-regular);
  letter-spacing: 0.2px;
  line-height: 1.35;
  color: var(--color-text-icon-secondary);
  white-space: nowrap;
`;

const SphereMap = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: var(--space-600);
  border-radius: var(--radius-400);
  background: var(--color-stroke-border-container-os);
  overflow: visible;
  position: relative;
`;

const StageRail = styled.div`
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 153px;
`;

const StageInner = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 10px;
  width: 153px;
  height: 70px;
  transform: rotate(-90deg);
  color: var(--color-text-icon-secondary);
  font-size: var(--type-size-subject);
  font-weight: var(--font-weight-bold);
  line-height: 1.35;
  white-space: nowrap;
`;

const StageIcon = styled.img`
  display: block;
  flex: none;
`;

const SectionGrid = styled.div`
  flex: 1;
  min-width: 0;
  min-height: 0;
  height: 100%;
  display: flex;
  gap: 10px;
  align-items: stretch;
  overflow: visible;
`;

const SectionColumn = styled.div<{ $rows: number }>`
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-rows: repeat(${(props) => props.$rows}, minmax(0, 1fr));
  gap: var(--space-100);
  height: 100%;
  overflow: visible;
`;

const SuiteGrid = styled.div`
  flex: 1;
  min-width: 0;
  min-height: 0;
  height: 100%;
  display: flex;
  gap: 10px;
  align-items: stretch;
  overflow: visible;
`;

const SuiteColumn = styled.div<{ $rows: number }>`
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-rows: repeat(${(props) => props.$rows}, minmax(0, 1fr));
  gap: var(--space-100);
  height: 100%;
  overflow: visible;
`;

const FillCell = styled.button<{ $level: string; $color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 0;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: var(--radius-200);
  background: ${(props) => props.$color};
  color: ${(props) =>
    props.$level === "disabled"
      ? "var(--color-text-icon-placeholder)"
      : "var(--color-text-icon-inverse)"};
  font-size: var(--type-size-helper);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.1px;
  line-height: 1.35;
  text-align: center;
  cursor: ${(props) => (props.$level === "disabled" ? "default" : "pointer")};
  position: relative;
  z-index: 1;

  &:hover:not(:disabled),
  &:focus-visible:not(:disabled) {
    z-index: 5;
    outline: var(--stroke-100) solid var(--color-text-icon-primary);
    outline-offset: 1px;
  }

  &:disabled {
    cursor: default;
  }
`;

const HoverCard = styled.div<{ $wide?: boolean; $interactive?: boolean }>`
  position: fixed;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  width: ${(props) => (props.$wide ? "305px" : "216px")};
  max-width: calc(100vw - 16px);
  border-radius: var(--radius-300);
  background: var(--color-surfaces-container);
  border: var(--stroke-100) solid var(--color-stroke-border-pop);
  box-shadow: var(--elevation-0);
  overflow: visible;
  pointer-events: ${(props) => (props.$interactive ? "auto" : "none")};
`;

const HoverHead = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-050);
  padding: var(--space-300);
  background: var(--color-surfaces-canvas);
  border-radius: var(--radius-300) var(--radius-300) 0 0;
`;

const HoverTitle = styled.p`
  margin: 0;
  font-size: var(--type-size-subject);
  font-weight: var(--font-weight-bold);
  line-height: 1.35;
  color: var(--color-text-icon-primary);
`;

const HoverBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-200);
  padding: var(--space-300);
`;

const SuiteHeadRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-100);
  width: 100%;
`;

const SuiteMeta = styled.span`
  flex: 1;
  min-width: 0;
  font-size: var(--type-size-caption);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.2px;
  line-height: 1.35;
  color: var(--color-text-icon-secondary);
`;

const ClickHint = styled.span`
  font-size: 10px;
  font-weight: var(--font-weight-regular);
  letter-spacing: 0.2px;
  line-height: 1.35;
  color: var(--color-text-icon-secondary);
  white-space: nowrap;
`;

const SuiteNameBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-050);
  width: 100%;
  margin: var(--space-100) 0 0;
`;

const SuiteName = styled.p`
  margin: 0;
  font-size: var(--type-size-subject);
  font-weight: var(--font-weight-bold);
  line-height: 1.35;
  color: var(--color-text-icon-primary);
`;

const SuiteLead = styled.p`
  margin: 0;
  font-size: var(--type-size-caption);
  font-weight: var(--font-weight-regular);
  letter-spacing: 0.2px;
  line-height: 1.35;
  color: var(--color-text-icon-secondary);
`;

const NameWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-100);
  align-items: center;
  width: 100%;
`;

