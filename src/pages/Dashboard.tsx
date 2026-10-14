import { Card, Dropdown, IconButton, Modal, Scrollbar, SimpleTooltip, TextInput } from "@cake-admin/cakeand";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import styled from "styled-components";
import { getDashboard } from "../../server/dashboardData";
import fullscreenIcon from "../assets/icons/fullscreen.svg";
import insightsIcon from "../assets/icons/insights.svg";
import nextStepsIcon from "../assets/icons/next-steps.svg";
import techworldLockup from "../assets/icons/techworld-lockup.svg";
import { EChart } from "../charts/EChart";
import { GlobeChart } from "../charts/GlobeChart";
import { allocationOption, companyOption, gaugeOption, ticketOption } from "../charts/options";
import { GLOBAL_ACCOUNTS } from "../../server/registrationData";
import { getGuestInfo, type GuestInfo } from "../../server/seatingData";
import { CompanyChip } from "../components/CompanyChip";
import { PersonChip } from "../components/PersonChip";
import { SpeakerChip } from "../components/SpeakerChip";
import { scrollGutter } from "../components/scrollGutter";
import { GuestTypeChip, TagChip } from "../components/TagChip";
import { GuestInfoPopup } from "./seating/GuestInfoPopup";

const dashboard = getDashboard();
const globalAccounts = new Set<string>(GLOBAL_ACCOUNTS);

const groupSortOptions = [
  { label: "By name", value: "name" },
  { label: "By target amount", value: "target" },
  { label: "By percentage complete (asc)", value: "pctAsc" },
  { label: "By percentage complete (desc)", value: "pctDesc" },
];

const companySortOptions = [
  { label: "By attendee number", value: "attendees" },
  { label: "Global accounts only", value: "global" },
];

function pctComplete(value: number, target: number) {
  if (target <= 0) return 0;
  return value / target;
}

export function Dashboard() {
  const [query, setQuery] = useState("");
  const [groupSort, setGroupSort] = useState("name");
  const [companySort, setCompanySort] = useState("attendees");
  const [guest, setGuest] = useState<GuestInfo | null>(null);
  const [globeOpen, setGlobeOpen] = useState(false);

  const allocation = useMemo(() => {
    const rows = [...dashboard.allocation];
    rows.sort((a, b) => {
      if (groupSort === "target") return b.target - a.target;
      if (groupSort === "pctAsc") return pctComplete(a.value, a.target) - pctComplete(b.value, b.target);
      if (groupSort === "pctDesc") return pctComplete(b.value, b.target) - pctComplete(a.value, a.target);
      return a.group.localeCompare(b.group);
    });
    return rows;
  }, [groupSort]);

  const companies = useMemo(() => {
    if (companySort === "global") {
      return dashboard.companies.filter((company) => company.global).sort((a, b) => b.value - a.value);
    }
    return [...dashboard.companies].sort((a, b) => b.value - a.value);
  }, [companySort]);

  const registrations = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return dashboard.registrations;
    return dashboard.registrations.filter((item) =>
      [
        item.name,
        item.company,
        item.group,
        item.speaker ? "Speaker" : "",
        ...item.badges.map((entry) => entry.label),
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [query]);

  const chartHeight = Math.max(allocation.length * 44, 200);
  const data = dashboard;

  return (
    <Page>
      <Title>Get ready for Tech World 2027</Title>
      <Layout>
        <Hero>
          <HeroLockup aria-hidden="true">
            <img src={techworldLockup} alt="" />
          </HeroLockup>
          <Countdown>
            <Count value={data.countdown.days} unit="days" />
            <Colon>:</Colon>
            <Count value={data.countdown.hours} unit="hours" />
            <Colon>:</Colon>
            <Count value={data.countdown.minutes} unit="minutes" />
            <Colon>:</Colon>
            <Count value={data.countdown.seconds} unit="seconds" />
          </Countdown>
          <DateBlock>
            <DateText>
              <DateDay>{data.countdown.date.replace(/\s+\d{4}$/, "")}</DateDay>
              <DateYearRow>
                <TimeZone>pst</TimeZone>
                <DateYear>{data.countdown.date.match(/\d{4}$/)?.[0] ?? "2027"}</DateYear>
              </DateYearRow>
            </DateText>
            <Block src="/brand/techworld-block.png" alt="" />
          </DateBlock>
        </Hero>

        <TopMetrics>
          <MapSurface>
            <MapHead>
              <CardTitle>Registration by country</CardTitle>
              <IconButton
                label="Expand registration map"
                icon={<img src={fullscreenIcon} alt="" width={16} height={16} />}
                size="xs"
                intent="secondary"
                variant="ghost"
                onClick={() => setGlobeOpen(true)}
              />
            </MapHead>
            <ChartFill>
              <GlobeChart countries={data.countries} label="Registration by country interactive globe" />
            </ChartFill>
          </MapSurface>
          <GaugeStack>
            {data.gauges.map((gauge) => (
              <GaugeSurface key={gauge.label}>
                <CardTitle>{gauge.label}</CardTitle>
                <ChartFill>
                  <EChart option={gaugeOption(gauge)} label={`${gauge.label}, ${gauge.percent} percent registered`} />
                </ChartFill>
              </GaugeSurface>
            ))}
          </GaugeStack>
        </TopMetrics>

        <InsightSurface>
          <InsightTitle>
            <img src={insightsIcon} alt="" width={18} height={18} />
            {data.insights.title}
          </InsightTitle>
          <ScrollFill>
            <Scrollbar maxHeight="100%">
              <Copy>
                {data.insights.body.map((run, index) =>
                  run.strong ? <strong key={index}>{run.text}</strong> : <span key={index}>{run.text}</span>,
                )}
              </Copy>
              <Next>
                <NextTitle>
                  <NextIcon src={nextStepsIcon} alt="" width={18} height={18} />
                  {data.insights.nextTitle}
                </NextTitle>
                <Copy>
                  {data.insights.next.map((run, index) =>
                    run.strong ? <strong key={index}>{run.text}</strong> : <span key={index}>{run.text}</span>,
                  )}
                </Copy>
              </Next>
            </Scrollbar>
          </ScrollFill>
        </InsightSurface>

        <TicketCard>
          <CardTitle>Ticket registration</CardTitle>
          <TicketRow>
            <TicketMeta>
              <strong>{data.ticket.totalLabel}</strong>
              <span>{data.ticket.percentLabel}</span>
            </TicketMeta>
            <TicketChart>
              <EChart option={ticketOption(data.ticket)} label="Ticket registration" />
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

        <ProgressCard>
          <CardHead>
            <CardTitle>Registration progress by group</CardTitle>
            <DropdownWrap>
              <Dropdown
                aria-label="Sort registration progress"
                options={groupSortOptions}
                value={groupSort}
                onValueChange={setGroupSort}
              />
            </DropdownWrap>
          </CardHead>
          <ScrollFill>
            <Scrollbar maxHeight="100%">
              <ChartScroll $height={chartHeight}>
                <EChart option={allocationOption(allocation)} label="Registration progress by group" />
              </ChartScroll>
            </Scrollbar>
          </ScrollFill>
        </ProgressCard>

        <CompanyCard>
          <CardHead>
            <CardTitle>Company representation</CardTitle>
            <DropdownWrap>
              <Dropdown
                aria-label="Sort companies"
                options={companySortOptions}
                value={companySort}
                onValueChange={setCompanySort}
              />
            </DropdownWrap>
          </CardHead>
          <ChartFill>
            <EChart option={companyOption(companies)} label="Company representation" />
          </ChartFill>
        </CompanyCard>

        <RegistrationsCard>
          <CardHead>
            <CardTitle>All registrations</CardTitle>
            <SearchWrap>
              <TextInput
                aria-label="Search registrations"
                placeholder="Search"
                size="sm"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                startIcon={<Search size={16} />}
              />
            </SearchWrap>
          </CardHead>
          <ScrollFill>
            <Scrollbar maxHeight="100%">
              <Table>
                {registrations.map((item, index) => (
                  <Row key={`${item.name}-${item.company}-${index}`}>
                    <PersonChip
                      name={item.name}
                      iconSize={12}
                      onClick={() => setGuest(getGuestInfo(item.name))}
                    />
                    <Pills>
                      {item.badges.map((entry) => (
                        <GuestTypeChip key={entry.label} type={entry.label} />
                      ))}
                    </Pills>
                    <TooltipCell>
                      <SimpleTooltip
                        trigger={<CompanyChip name={item.company} global={globalAccounts.has(item.company)} />}
                        side="top"
                        maxWidth={280}
                      >
                        {item.company}
                      </SimpleTooltip>
                    </TooltipCell>
                    {item.speaker ? (
                      <SpeakerChip iconSize={12} />
                    ) : item.group ? (
                      <TooltipCell>
                        <SimpleTooltip
                          trigger={<TagChip color="violet">{item.group}</TagChip>}
                          side="top"
                          maxWidth={320}
                        >
                          {item.group}
                        </SimpleTooltip>
                      </TooltipCell>
                    ) : (
                      <span />
                    )}
                  </Row>
                ))}
                {registrations.length === 0 ? <Empty>No registrations match that search.</Empty> : null}
              </Table>
            </Scrollbar>
          </ScrollFill>
        </RegistrationsCard>
      </Layout>

      {guest ? <GuestInfoPopup guest={guest} onClose={() => setGuest(null)} /> : null}
      <Modal
        open={globeOpen}
        onOpenChange={setGlobeOpen}
        title="Registration by country"
        closeLabel="Close registration map"
      >
        <ModalGlobe data-globe-modal>
          <GlobeChart
            countries={data.countries}
            label="Expanded registration by country interactive globe"
            expanded
          />
        </ModalGlobe>
      </Modal>
    </Page>
  );
}

function Count({ value, unit }: { value: string; unit: string }) {
  return (
    <CountBlock>
      <CountValue>{value}</CountValue>
      <CountUnit>{unit}</CountUnit>
    </CountBlock>
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
`;

const Title = styled.h1`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.35;
  flex: none;
`;

const Layout = styled.div`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  grid-template-rows: repeat(8, minmax(0, 1fr));
  gap: var(--space-300);
`;

const Surface = styled(Card)`
  && {
    background: rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(90px);
    border: 1px solid #000000;
    box-shadow: 0 8px 36px rgba(0, 0, 0, 0.15);
    border-radius: 24px;
    padding: 24px;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
`;

const Hero = styled(Surface)`
  && {
    grid-column: 1 / 6;
    grid-row: 1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr) minmax(0, 1fr);
    align-items: center;
    gap: clamp(8px, 2cqi, 24px);
    min-height: 0;
    overflow: hidden;
    container-type: inline-size;
  }
`;

const HeroLockup = styled.div`
  display: flex;
  align-items: center;
  align-self: center;
  justify-self: start;
  min-width: 0;
  max-width: 100%;

  > img {
    display: block;
    height: auto;
    width: auto;
    max-width: 100%;
    max-height: clamp(28px, 7cqi, 48px);
  }
`;

const Countdown = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: clamp(2px, 4cqi, 16px);
  align-self: center;
  justify-self: stretch;
  width: 100%;
  min-width: 0;
  container-type: inline-size;
`;

const CountBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(4px, 3cqi, 12px);
  flex: 1 1 0;
  min-width: 0;
`;

const CountValue = styled.span`
  font-family: "Moto Sans", sans-serif;
  font-size: clamp(16px, 12cqi, 48px);
  white-space: nowrap;
  font-weight: 400;
  font-synthesis: none;
  line-height: 1;
  color: #f1e1ed;
  text-transform: uppercase;
`;

const CountUnit = styled.span`
  color: #d9c1d8;
  font-size: clamp(9px, 4.5cqi, 14px);
  line-height: 1;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Colon = styled.span`
  font-family: "Moto Sans", sans-serif;
  font-size: clamp(20px, 15cqi, 64px);
  font-weight: 400;
  font-synthesis: none;
  line-height: 0.8;
  color: #f1e1ed;
  flex: none;
  text-align: center;
`;

const DateBlock = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: clamp(6px, 8cqi, 16px);
  min-width: 0;
  min-height: 0;
  height: 100%;
  container-type: inline-size;
`;

const DateText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 0;
  font-family: "Moto Sans", sans-serif;
  font-weight: 400;
  font-synthesis: none;
  align-self: center;
  flex: none;
`;

const DateDay = styled.span`
  font-size: clamp(12px, 8cqi, 24px);
  line-height: 1;
  color: #f1e1ed;
  white-space: nowrap;
`;

const DateYearRow = styled.span`
  display: inline-flex;
  align-items: flex-end;
  gap: var(--space-050);
  margin-top: -2px;
`;

const TimeZone = styled.span`
  font-size: clamp(8px, 3.6cqi, 12px);
  line-height: 1;
  color: #f1e1ed;
  text-transform: lowercase;
  padding-bottom: 0.15em;
  white-space: nowrap;
`;

const DateYear = styled.span`
  font-size: clamp(16px, 11cqi, 36px);
  line-height: 0.95;
  color: #d9c1d8;
  text-transform: lowercase;
  white-space: nowrap;
`;

const Block = styled.img`
  flex: 0 1 72px;
  min-width: 0;
  width: auto;
  height: auto;
  max-height: 70%;
  max-width: 72px;
  object-fit: contain;
  object-position: right center;
`;

const TopMetrics = styled.div`
  grid-column: 6 / 9;
  grid-row: 1 / 4;
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: var(--space-300);
  min-height: 0;
`;

const MapSurface = styled(Surface)`
  && {
    gap: var(--space-300);
  }
`;

const MapHead = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-050);
  flex: none;
  min-width: 0;

  h2 {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const GaugeStack = styled.div`
  display: grid;
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: var(--space-300);
  min-height: 0;
`;

const ModalGlobe = styled.div`
  width: 100%;
  height: calc(100vh - var(--space-800) * 3);
  min-height: 0;
`;

const GaugeSurface = styled(Surface)`
  && {
    padding: 12px 14px 8px;
  }
`;

const InsightSurface = styled(Surface)`
  && {
    grid-column: 1 / 3;
    grid-row: 2 / 4;
    overflow: hidden;
    background: linear-gradient(
      21.57deg,
      rgba(238, 103, 43, 0.15) 0%,
      rgba(231, 88, 204, 0.15) 100%
    );
    backdrop-filter: blur(90px);
    border: 1px solid var(--color-badge-orange);
    box-shadow: 0 8px 36px rgba(0, 0, 0, 0.15);
  }
`;

const TicketCard = styled(Surface)`
  && {
    grid-column: 3 / 6;
    grid-row: 2 / 4;
  }
`;

const ProgressCard = styled(Surface)`
  && {
    grid-column: 1 / 4;
    grid-row: 4 / 9;
  }
`;

const CompanyCard = styled(Surface)`
  && {
    grid-column: 4 / 6;
    grid-row: 4 / 9;
  }
`;

const RegistrationsCard = styled(Surface)`
  && {
    grid-column: 6 / 9;
    grid-row: 4 / 9;
  }
`;

const InsightTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px;
  flex: none;
  min-width: 0;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.1px;
  background: linear-gradient(90deg, #ffdbce, #fdd8ef);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;

  img {
    flex: none;
  }
`;

const Next = styled.div`
  margin-top: 12px;
  padding: 8px 0;
  border-radius: 12px;
`;

const NextTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 0 4px;
  font-size: 12px;
  font-weight: 700;
  background: linear-gradient(90deg, #ffdbce, #fdd8ef);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`;

const NextIcon = styled.img`
  flex: none;
  width: 18px;
  height: 18px;
  object-fit: contain;
`;

const Copy = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.35;
  letter-spacing: 0.2px;

  strong {
    font-weight: 700;
  }
`;

const CardTitle = styled.h2`
  margin: 0;
  min-width: 0;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CardHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  flex: none;
  min-width: 0;

  > h2 {
    flex: 1 1 auto;
  }
`;

const TicketRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
  min-width: 0;
`;

const TicketMeta = styled.p`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  margin: 0;
  font-size: 12px;
  flex: 0 0 auto;
  min-width: 88px;

  span {
    color: #aaaab4;
    font-weight: 400;
  }
`;

const TicketChart = styled.div`
  height: 56px;
  flex: 1 1 auto;
  min-width: 0;
`;

const ChartFill = styled.div`
  flex: 1;
  min-height: 0;
  width: 100%;
`;

const ChartScroll = styled.div<{ $height: number }>`
  height: ${(props) => props.$height}px;
  width: 100%;
`;

const ScrollFill = styled.div`
  flex: 1;
  min-height: 0;
  overflow: visible;
  ${scrollGutter}

  > * {
    height: 100%;
  }
`;

const Legend = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 12px 16px;
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
  color: #c6c6cf;
  font-size: 12px;
  flex: none;
`;

const LegendItem = styled.li`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Swatch = styled.span<{ $color: string }>`
  width: 12px;
  height: 8px;
  border-radius: 4px;
  background: ${(props) => props.$color};
`;

const DropdownWrap = styled.div`
  width: auto;
  max-width: 168px;
  min-width: 0;
  flex: 0 1 168px;

  label {
    display: none;
  }

  button {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    height: 32px;
    min-height: 32px;
    padding-block: 0;
    overflow: hidden;
  }

  /* Truncate trigger label; menu options keep full text */
  button,
  button * {
    white-space: nowrap !important;
  }

  button span,
  button > span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
`;

const SearchWrap = styled.div`
  width: auto;
  max-width: 220px;
  min-width: 0;
  flex: 1 1 140px;

  input {
    min-width: 0;
  }
`;

const Table = styled.div`
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.2fr) minmax(0, 0.8fr) minmax(0, 1.4fr);
  gap: 8px;
  align-items: center;
  min-height: 32px;
  padding: 4px 8px;

  > * {
    min-width: 0;
    overflow: hidden;
  }

  &:nth-child(even) {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Pills = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 4px;
  min-width: 0;
  overflow: hidden;
`;

const TooltipCell = styled.div`
  justify-self: start;
  min-width: 0;
  max-width: 100%;

  > * {
    max-width: 100%;
  }

  button {
    display: block;
    max-width: 100%;
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: default;
  }
`;

const Empty = styled.p`
  margin: 12px 8px;
  color: #aaaab4;
  font-size: 12px;
`;
