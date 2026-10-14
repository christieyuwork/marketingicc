import { Badge, Card, Dropdown, Scrollbar, SimpleTooltip, TextInput } from "@cake-admin/cakeand";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import type { DashboardData } from "../../server/dashboardData";
import insightsIcon from "../assets/icons/insights.svg";
import nextStepsIcon from "../assets/icons/next-steps.svg";
import techworldLockup from "../assets/icons/techworld-lockup.svg";
import { EChart } from "../charts/EChart";
import { allocationOption, companyOption, gaugeOption, ticketOption } from "../charts/options";
import { getGuestInfo, type GuestInfo } from "../../server/seatingData";
import { PersonChip } from "../components/PersonChip";
import { SpeakerChip } from "../components/SpeakerChip";
import { GuestInfoPopup } from "./seating/GuestInfoPopup";

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
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [groupSort, setGroupSort] = useState("name");
  const [companySort, setCompanySort] = useState("attendees");
  const [guest, setGuest] = useState<GuestInfo | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/dashboard", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Dashboard data did not load");
        return response.json() as Promise<DashboardData>;
      })
      .then(setData)
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError(reason instanceof Error ? reason.message : "Dashboard data did not load");
      });
    return () => controller.abort();
  }, []);

  const allocation = useMemo(() => {
    if (!data) return [];
    const rows = [...data.allocation];
    rows.sort((a, b) => {
      if (groupSort === "target") return b.target - a.target;
      if (groupSort === "pctAsc") return pctComplete(a.value, a.target) - pctComplete(b.value, b.target);
      if (groupSort === "pctDesc") return pctComplete(b.value, b.target) - pctComplete(a.value, a.target);
      return a.group.localeCompare(b.group);
    });
    return rows;
  }, [data, groupSort]);

  const companies = useMemo(() => {
    if (!data) return [];
    if (companySort === "global") {
      return data.companies.filter((company) => company.global).sort((a, b) => b.value - a.value);
    }
    return [...data.companies].sort((a, b) => b.value - a.value);
  }, [data, companySort]);

  const registrations = useMemo(() => {
    if (!data) return [];
    const needle = query.trim().toLowerCase();
    if (!needle) return data.registrations;
    return data.registrations.filter((item) =>
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
  }, [data, query]);

  if (error) return <Status role="alert">{error}</Status>;
  if (!data) return <Status>Loading command center…</Status>;

  const chartHeight = Math.max(allocation.length * 44, 200);

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
              <DateYear>{data.countdown.date.match(/\d{4}$/)?.[0] ?? "2027"}</DateYear>
            </DateText>
            <Block src="/brand/techworld-block.png" alt="" />
          </DateBlock>
        </Hero>

        <Gauges>
          {data.gauges.map((gauge) => (
            <GaugeSurface key={gauge.label}>
              <CardTitle>{gauge.label}</CardTitle>
              <ChartFill>
                <EChart option={gaugeOption(gauge)} label={`${gauge.label}, ${gauge.percent} percent registered`} />
              </ChartFill>
            </GaugeSurface>
          ))}
        </Gauges>

        <InsightSurface>
          <InsightTitle>
            <img src={insightsIcon} alt="" width={18} height={18} />
            {data.insights.title}
          </InsightTitle>
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
                        <Pill key={entry.label} $tone={entry.tone}>
                          {entry.label}
                        </Pill>
                      ))}
                    </Pills>
                    <TooltipCell>
                      <SimpleTooltip trigger={<Company>{item.company}</Company>} side="top" maxWidth={280}>
                        {item.company}
                      </SimpleTooltip>
                    </TooltipCell>
                    {item.speaker ? (
                      <SpeakerChip iconSize={12} />
                    ) : item.group ? (
                      <TooltipCell>
                        <SimpleTooltip
                          trigger={
                            <GroupChip>
                              <Badge color="violet" tone="subtle" dot={false}>
                                {item.group}
                              </Badge>
                            </GroupChip>
                          }
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
    grid-template-columns: 1fr 1fr 1fr;
    align-items: stretch;
    gap: 24px;
    min-height: 0;
  }
`;

const HeroLockup = styled.div`
  display: flex;
  align-items: center;
  align-self: center;
  justify-self: start;

  > img {
    display: block;
    height: 48px;
    width: auto;
  }
`;

const Countdown = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 16px;
  align-self: center;
  justify-self: center;
`;

const CountBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 80px;
`;

const CountValue = styled.span`
  font-family: "Moto Sans", sans-serif;
  font-size: 48px;
  font-weight: 400;
  font-synthesis: none;
  line-height: 1;
  color: #f1e1ed;
  text-transform: uppercase;
`;

const CountUnit = styled.span`
  color: #d9c1d8;
  font-size: 14px;
  line-height: 1;
  text-align: center;
`;

const Colon = styled.span`
  font-family: "Moto Sans", sans-serif;
  font-size: 64px;
  font-weight: 400;
  font-synthesis: none;
  line-height: 1;
  color: #f1e1ed;
  width: 36px;
  text-align: center;
`;

const DateBlock = styled.div`
  display: flex;
  align-items: stretch;
  justify-content: flex-end;
  gap: 16px;
  min-height: 0;
  height: 100%;
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
`;

const DateDay = styled.span`
  font-size: 24px;
  line-height: 1;
  color: #f1e1ed;
`;

const DateYear = styled.span`
  font-size: 36px;
  line-height: 0.95;
  margin-top: -2px;
  color: #d9c1d8;
  text-transform: lowercase;
`;

const Block = styled.img`
  height: 100%;
  width: auto;
  max-width: 72px;
  object-fit: contain;
  object-position: right center;
`;

const Gauges = styled.div`
  grid-column: 6 / 9;
  grid-row: 1 / 4;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: var(--space-300);
  min-height: 0;

  > * {
    min-height: 0;
    height: 100%;
  }
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
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.1px;
`;

const CardHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  flex: none;
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
  overflow: hidden;

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
  width: 168px;
  max-width: 168px;
  flex: none;

  label {
    display: none;
  }

  button {
    width: 100%;
    max-width: 100%;
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
  width: 220px;
`;

const Table = styled.div`
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: minmax(90px, 1.1fr) minmax(110px, 1.2fr) minmax(70px, 0.8fr) minmax(80px, 1.4fr);
  gap: 8px;
  align-items: center;
  min-height: 32px;
  padding: 4px 8px;

  &:nth-child(even) {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Pills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const guestTone = {
  general: { color: "#c5d4ff", background: "#1e2a4a" },
  enhanced: { color: "#b8ecd0", background: "#143528" },
  suite: { color: "#ffb599", background: "#3a1f18" },
  vvip: { color: "#f0e6a8", background: "#3a3420" },
} as const;

const Pill = styled.span<{ $tone: keyof typeof guestTone }>`
  display: inline-flex;
  align-items: center;
  padding: 0 8px;
  border-radius: 64px;
  background: ${(props) => guestTone[props.$tone].background};
  color: ${(props) => guestTone[props.$tone].color};
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.2px;
  line-height: 18px;
  white-space: nowrap;
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

const Company = styled.span`
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 6px;
  border-radius: 64px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 12px;
  font-weight: 700;
`;

const GroupChip = styled.div`
  width: fit-content;
  max-width: min(200px, 100%);
  min-width: 0;

  > * {
    display: block;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    background: color-mix(in srgb, var(--color-badge-violet) 32%, transparent) !important;
    color: var(--color-badge-violet) !important;
  }
`;

const Status = styled.p`
  margin: 24px 0;
`;

const Empty = styled.p`
  margin: 12px 8px;
  color: #aaaab4;
  font-size: 12px;
`;
