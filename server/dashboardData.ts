export type TextRun = { text: string; strong?: boolean };

export type AllocationRow = {
  group: string;
  owner: string;
  value: number;
  maximum: number;
  target: number;
  color: string;
};

export type CompanyBar = { name: string; value: number; color: string };

export type Gauge = { label: string; percent: number; color: string };

export type TicketSegment = {
  name: string;
  count: number;
  share: number;
  color: string;
  legend: boolean;
};

export type RegistrationBadge = { label: string; tone: string };

export type Registration = {
  name: string;
  badges: RegistrationBadge[];
  company: string;
  group: string;
};

export type DashboardData = {
  countdown: { days: string; hours: string; minutes: string; seconds: string; date: string };
  insights: { title: string; body: TextRun[]; nextTitle: string; next: TextRun[] };
  ticket: { totalLabel: string; percentLabel: string; target: number; track: string; segments: TicketSegment[] };
  allocation: AllocationRow[];
  companies: CompanyBar[];
  gauges: Gauge[];
  registrations: Registration[];
};

const badge = {
  suite: "#ffb599",
  general: "#d4e3ff",
  enhanced: "#bcedcb",
  vvip: "#f8d8ff",
  speaker: "#bcedcb",
  waiting: "#ffb779",
  accepted: "#b9d237",
  muted: "#c6c6cf",
};

function row(
  name: string,
  badges: RegistrationBadge[],
  company: string,
  group: string,
): Registration {
  return { name, badges, company, group };
}

export function getDashboard(): DashboardData {
  return {
    countdown: {
      days: "119",
      hours: "09",
      minutes: "27",
      seconds: "57",
      date: "6 jan 2027",
    },
    insights: {
      title: "Intelligent Command Center insights",
      body: [
        { text: "The " },
        { text: "current greatest area of concern is China Investors", strong: true },
        { text: ", which is only at " },
        { text: "14%", strong: true },
        { text: " of its targeted allocation goal. With one month remaining, Tech World registration is at a " },
        { text: "healthy guest number of 4435", strong: true },
        { text: "." },
      ],
      nextTitle: "Next steps",
      next: [
        { text: "Event operators should confirm " },
        { text: "speaker attendance (69%)", strong: true },
        { text: " and double-check attendance commitments from " },
        { text: "Jake Smith (15%)", strong: true },
        { text: " and " },
        { text: "Lily Field (34%)", strong: true },
        { text: "." },
      ],
    },
    ticket: {
      totalLabel: "Total: 4158",
      percentLabel: "81% of target",
      target: 5000,
      track: "#595a62",
      segments: [
        { name: "Standard", count: 4187, share: 3031, color: "#3b92f9", legend: true },
        { name: "Enhanced", count: 827, share: 833, color: "#dd8aff", legend: true },
        { name: "Suite", count: 217, share: 219, color: "#ee672b", legend: true },
        { name: "VVIP", count: 23, share: 21, color: "#dcc652", legend: true },
        { name: "Remainder", count: 10, share: 10, color: "#53a338", legend: false },
      ],
    },
    allocation: [
      { group: "ROW Invited Media & Analysts", owner: "Audrey Marty", value: 120, maximum: 129, target: 114, color: "#3ecf6e" },
      { group: "Europe + META (Retailers)", owner: "Elizabeth Barfield, Jake Smith & Laura Lozada", value: 68, maximum: 90, target: 89, color: "#e6c547" },
      { group: "MBG (including licensee)", owner: "Cassie Mayberry", value: 20, maximum: 66, target: 65, color: "#f0434b" },
      { group: "Europe + META (Retailers)", owner: "Valerie del Campo", value: 96, maximum: 96, target: 69, color: "#3ecf6e" },
      { group: "China Geo (Customers and Partners)", owner: "Jane Wainwright & Luna Liu", value: 70, maximum: 88, target: 87, color: "#e6c547" },
      { group: "MBG (including licensee)", owner: "Taylor Wilson & Hollyn Phelps", value: 72, maximum: 76, target: 75, color: "#3ecf6e" },
      { group: "ROW Invited Media & Analysts", owner: "Audrey Marty", value: 70, maximum: 88, target: 87, color: "#e6c547" },
      { group: "Europe + META (Retailers)", owner: "Elizabeth Barfield, Jake Smith & Laura Lozada", value: 68, maximum: 90, target: 89, color: "#e6c547" },
      { group: "China Geo (Customers and Partners)", owner: "Valerie del Campo", value: 68, maximum: 90, target: 89, color: "#e6c547" },
      { group: "MBG (including licensee)", owner: "Valerie del Campo", value: 20, maximum: 66, target: 65, color: "#f0434b" },
      { group: "NA (General)", owner: "Audrey Marty", value: 120, maximum: 144, target: 95, color: "#e6c547" },
      { group: "CTOTW27", owner: "Global", value: 20, maximum: 66, target: 65, color: "#f0434b" },
    ],
    companies: [
      { name: "Motorola", value: 16, color: "#bcc3ff" },
      { name: "Oppo", value: 26, color: "#a8b2ff" },
      { name: "Huawei", value: 39, color: "#94a1ff" },
      { name: "Samsung", value: 112, color: "#8090ff" },
      { name: "OpenAI", value: 133, color: "#6c7fff" },
      { name: "Apple", value: 165, color: "#586eff" },
      { name: "Dell", value: 371, color: "#3b51df" },
      { name: "NVIDIA", value: 435, color: "#2e43cb" },
      { name: "Microsoft", value: 587, color: "#2034b7" },
    ],
    gauges: [
      { label: "Total registration", percent: 89, color: "#3ecf6e" },
      { label: "Speaker registration", percent: 24, color: "#f0434b" },
      { label: "VVIP registration", percent: 89, color: "#3ecf6e" },
      { label: "Standard registration", percent: 89, color: "#3ecf6e" },
      { label: "Enhanced registration", percent: 56, color: "#f5a524" },
      { label: "Suite registration", percent: 64, color: "#e6c547" },
    ],
    registrations: [
      row("Maya Whitford", [{ label: "Suite Guest", tone: badge.suite }], "Microsoft", "Europe + META (Retailers)"),
      row("Wei Lin", [{ label: "General Attendee", tone: badge.general }], "Apple", "China Geo (Customers and Partners)"),
      row("Clara Beaumont", [{ label: "Enhanced Guest", tone: badge.enhanced }], "Dell", "ROW Invited Media & Analysts"),
      row("Elira Dervishi", [{ label: "VVIP", tone: badge.vvip }], "Hewlitt Packard Industries", "China Geo (Customers and Partners)"),
      row("Maya Whitford", [{ label: "General Attendee", tone: badge.general }], "NVIDIA Industries", "Europe + META (Retailers)"),
      row("Arben Kola", [{ label: "Suite Guest", tone: badge.suite }], "Apple", "China Geo (Customers and Partners)"),
      row("Maya Whitford", [{ label: "Enhanced Guest", tone: badge.enhanced }], "Dell", "ROW Invited Media & Analysts"),
      row("Sophie Langley", [{ label: "Suite Guest", tone: badge.suite }, { label: "Speaker", tone: badge.speaker }], "Microsoft", ""),
      row("Maya Whitford", [{ label: "Enhanced Guest", tone: badge.enhanced }], "Microsoft", "ROW Invited Media & Analysts"),
      row("Miles Bennett", [{ label: "General Attendee", tone: badge.general }], "Apple", "China Geo (Customers and Partners)"),
      row("Grace Hollis", [{ label: "Enhanced Guest", tone: badge.enhanced }], "Dell", "ROW Invited Media & Analysts"),
      row("Maya Whitford", [{ label: "Enhanced Guest", tone: badge.enhanced }], "NVIDIA Industries", "Europe + META (Retailers)"),
      row("Evan Calder", [{ label: "Not yet invited", tone: badge.muted }], "CNTW27", "EMEA"),
      row("Maya Whitford", [{ label: "VIP", tone: badge.vvip }, { label: "Awaiting response", tone: badge.waiting }], "EEGTW27", "EMEA"),
      row("Evan Calder", [{ label: "Accepted", tone: badge.accepted }], "CNTW27", "EMEA"),
      row("Maya Whitford", [{ label: "VIP", tone: badge.vvip }, { label: "Awaiting response", tone: badge.waiting }], "Global Operations - Lenovo Supplier Conference (LSACTW27)", "EMEA"),
      row("Evan Calder", [{ label: "Accepted", tone: badge.accepted }], "ROW Hosted Media & Analysts (ROWTW27H)", "EMEA"),
    ],
  };
}
