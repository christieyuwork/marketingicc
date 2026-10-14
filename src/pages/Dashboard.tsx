import { Card, TextInput } from "@cake-admin/cakeand";
import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import type { DashboardData } from "../../server/dashboardData";
import insightsIcon from "../assets/icons/insights.svg";
import searchIcon from "../assets/icons/search.svg";
import cesMark from "../assets/icons/ces-mark.svg";
import lenovoMark from "../assets/icons/lenovo-mark.svg";
import techworldWord from "../assets/icons/techworld-wordmark.svg";
import { EChart } from "../charts/EChart";
import { allocationOption, companyOption, gaugeOption, ticketOption } from "../charts/options";

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [groupSort, setGroupSort] = useState("frame");
  const [companySort, setCompanySort] = useState("amount");

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
    if (groupSort === "amount") rows.sort((a, b) => b.value - a.value);
    return rows;
  }, [data, groupSort]);

  const companies = useMemo(() => {
    if (!data) return [];
    const rows = [...data.companies];
    if (companySort === "name") rows.sort((a, b) => a.name.localeCompare(b.name));
    else rows.sort((a, b) => a.value - b.value);
    return rows;
  }, [data, companySort]);

  const registrations = useMemo(() => {
    if (!data) return [];
    const needle = query.trim().toLowerCase();
    if (!needle) return data.registrations;
    return data.registrations.filter((item) =>
      [item.name, item.company, item.group, ...item.badges.map((badge) => badge.label)]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [data, query]);

  if (error) return <Status role="alert">{error}</Status>;
  if (!data) return <Status>Loading command center…</Status>;

  return (
    <Page>
      <Title>Get ready for Tech World 2027</Title>
      <Layout>
        <Stack>
          <Hero>
            <HeroLockup aria-hidden="true">
              <img src={lenovoMark} alt="" />
              <img src={techworldWord} alt="" />
              <img src={cesMark} alt="" />
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
                {data.countdown.date.replace(" 2027", "\n2027")}
              </DateText>
              <Block src="/brand/techworld-block.png" alt="" />
            </DateBlock>
          </Hero>
          <Split>
            <Surface>
              <InsightTitle>
                <img src={insightsIcon} alt="" width={16} height={16} />
                {data.insights.title}
              </InsightTitle>
              <Copy>
                {data.insights.body.map((run, index) =>
                  run.strong ? <strong key={index}>{run.text}</strong> : <span key={index}>{run.text}</span>,
                )}
              </Copy>
              <Next>
                <NextTitle>
                  <img src={insightsIcon} alt="" width={16} height={16} />
                  {data.insights.nextTitle}
                </NextTitle>
                <Copy>
                  {data.insights.next.map((run, index) =>
                    run.strong ? <strong key={index}>{run.text}</strong> : <span key={index}>{run.text}</span>,
                  )}
                </Copy>
              </Next>
            </Surface>
            <Surface>
              <CardTitle>Ticket allocation</CardTitle>
              <TicketMeta>
                <strong>{data.ticket.totalLabel}</strong>
                <span>{data.ticket.percentLabel}</span>
              </TicketMeta>
              <ChartBox $height={72}>
                <EChart option={ticketOption(data.ticket)} label="Ticket allocation" />
              </ChartBox>
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
            </Surface>
          </Split>
          <Split $bottom>
            <Surface>
              <CardHead>
                <CardTitle>Allocation progress by group</CardTitle>
                <Sort
                  aria-label="Sort allocation"
                  value={groupSort}
                  onChange={(event) => setGroupSort(event.target.value)}
                >
                  <option value="frame">By name</option>
                  <option value="amount">By amount</option>
                </Sort>
              </CardHead>
              <ChartBox $height={500}>
                <EChart option={allocationOption(allocation)} label="Allocation progress by group" />
              </ChartBox>
            </Surface>
            <Surface>
              <CardHead>
                <CardTitle>Company representation at Tech World</CardTitle>
                <Sort
                  aria-label="Sort companies"
                  value={companySort}
                  onChange={(event) => setCompanySort(event.target.value)}
                >
                  <option value="amount">By amount</option>
                  <option value="name">By name</option>
                </Sort>
              </CardHead>
              <ChartBox $height={500}>
                <EChart option={companyOption(companies)} label="Company representation" />
              </ChartBox>
            </Surface>
          </Split>
        </Stack>
        <Side>
          <Gauges>
            {data.gauges.map((gauge) => (
              <Surface key={gauge.label}>
                <CardTitle>{gauge.label}</CardTitle>
                <ChartBox $height={150}>
                  <EChart option={gaugeOption(gauge)} label={`${gauge.label}, ${gauge.percent} percent registered`} />
                </ChartBox>
              </Surface>
            ))}
          </Gauges>
          <Surface>
            <CardHead>
              <CardTitle>All registrations</CardTitle>
              <SearchWrap>
                <TextInput
                  aria-label="Search registrations"
                  placeholder="Search"
                  size="sm"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  endIcon={<img src={searchIcon} alt="" width={16} height={16} />}
                />
              </SearchWrap>
            </CardHead>
            <Table>
              {registrations.map((item, index) => (
                <Row key={`${item.name}-${item.company}-${index}`}>
                  <Name>{item.name}</Name>
                  <Pills>
                    {item.badges.map((badge) => (
                      <Pill key={badge.label} $color={badge.tone}>
                        {badge.label}
                      </Pill>
                    ))}
                  </Pills>
                  <Company>{item.company}</Company>
                  {item.group ? <Group>{item.group}</Group> : <span />}
                </Row>
              ))}
              {registrations.length === 0 ? <Empty>No registrations match that search.</Empty> : null}
            </Table>
          </Surface>
        </Side>
      </Layout>
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
  gap: 16px;
  min-width: 0;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.35;
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1130fr) minmax(280px, 672fr);
  gap: 16px;
  align-items: start;
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
`;

const Side = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
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
  }
`;

const Hero = styled(Surface)`
  && {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    min-height: 100px;
  }
`;

const HeroLockup = styled.div`
  position: relative;
  width: 220px;
  height: 48px;
  flex: none;

  img:nth-child(1) {
    position: absolute;
    left: 0;
    top: 0;
    width: 62px;
    height: 21px;
  }

  img:nth-child(2) {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 150px;
    height: 16px;
  }

  img:nth-child(3) {
    position: absolute;
    right: 0;
    bottom: 1px;
    width: 56px;
    height: 14px;
  }
`;

const Countdown = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const CountBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 64px;
`;

const CountValue = styled.span`
  font-size: 40px;
  font-weight: 700;
  line-height: 1;
`;

const CountUnit = styled.span`
  margin-top: 4px;
  color: #aaaab4;
  font-size: 12px;
`;

const Colon = styled.span`
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
`;

const DateBlock = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DateText = styled.p`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.1;
  text-align: right;
  white-space: pre-line;
`;

const Block = styled.img`
  width: 38px;
  height: 50px;
  object-fit: contain;
`;

const Split = styled.div<{ $bottom?: boolean }>`
  display: grid;
  grid-template-columns: ${(props) => (props.$bottom ? "672fr 442fr" : "442fr 672fr")};
  gap: 16px;
  min-width: 0;
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
`;

const Next = styled.div`
  margin-top: 12px;
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
`;

const TicketMeta = styled.p`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin: 0;
  font-size: 12px;

  span {
    color: #aaaab4;
    font-weight: 400;
  }
`;

const ChartBox = styled.div<{ $height: number }>`
  height: ${(props) => props.$height}px;
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

const Sort = styled.select`
  height: 24px;
  border-radius: 100px;
  border: 1px solid #5e5e5e;
  background: rgba(0, 0, 0, 0.25);
  color: #aaaaaf;
  font-size: 14px;
  padding: 0 8px;
`;

const Gauges = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
`;

const SearchWrap = styled.div`
  width: 220px;

  input {
    background: rgba(0, 0, 0, 0.25);
    color: #ffffff;
  }
`;

const Table = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 360px;
  overflow: auto;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: minmax(90px, 1.1fr) minmax(110px, 1.2fr) minmax(70px, 0.8fr) minmax(120px, 1.4fr);
  gap: 8px;
  align-items: center;
  min-height: 32px;
  padding: 4px 8px;

  &:nth-child(even) {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Name = styled.span`
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.2px;
`;

const Pills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const Pill = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  padding: 0 6px;
  border-radius: 64px;
  background: color-mix(in srgb, ${(props) => props.$color} 22%, #1a1024);
  color: ${(props) => props.$color};
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.2px;
  line-height: 16px;
`;

const Company = styled.span`
  justify-self: start;
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

const Group = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 6px;
  border-radius: 16px;
  background: #fbecfb;
  color: #7a126b;
  font-size: 12px;
  font-weight: 700;
`;

const Status = styled.p`
  margin: 24px 0;
`;

const Empty = styled.p`
  margin: 12px 8px;
  color: #aaaab4;
  font-size: 12px;
`;
