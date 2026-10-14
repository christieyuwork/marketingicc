export type FillLevel = "green" | "yellow" | "amber" | "red" | "disabled";

export type SectionCell = {
  id: string;
  label: string;
  level: FillLevel;
  filled: number;
  capacity: number;
  groups: string[];
};

export const SUITE_OWNERS = [
  { id: "gina", name: "Gina Qiao" },
  { id: "exec-2", name: "Executive #2" },
  { id: "exec-3", name: "Executive #3" },
  { id: "exec-4", name: "Executive #4" },
  { id: "exec-5", name: "Executive #5" },
  { id: "exec-6", name: "Executive #6" },
] as const;

export type SuiteOwnerId = (typeof SUITE_OWNERS)[number]["id"];

export const SUITE_FILTER_OPTIONS = [
  { label: "All suites", value: "all" },
  ...SUITE_OWNERS.map((owner) => ({ label: `${owner.name}'s suites`, value: owner.id })),
];

export type SuiteCell = {
  id: string;
  label: string;
  level: FillLevel;
  levelLabel: string;
  ownerId: SuiteOwnerId;
  suiteName: string;
  suiteLead: string;
  filled: number;
  capacity: number;
  attendees: string[];
  moreCount: number;
};

export type TicketSegment = {
  name: string;
  count: number;
  share: number;
  color: string;
  legend: boolean;
};

export type Gauge = { label: string; percent: number; color: string; caption?: string };

export type GapRow = { id: string; label: string; percent: number };

function fillPercent(filled: number, capacity: number) {
  return capacity > 0 ? Math.round((filled / capacity) * 100) : 0;
}

function byLowestFill<T extends { label: string; filled: number; capacity: number }>(rows: T[]) {
  return [...rows]
    .filter((row) => {
      const level = (row as { level?: FillLevel }).level;
      return level === "yellow" || level === "amber";
    })
    .sort(
      (a, b) =>
        fillPercent(a.filled, a.capacity) - fillPercent(b.filled, b.capacity) ||
        a.label.localeCompare(b.label, undefined, { numeric: true }),
    );
}

const FILL: Record<FillLevel, string> = {
  green: "#67bf49",
  yellow: "#dcc652",
  amber: "#fb911c",
  red: "#fb565c",
  disabled: "#393a3d",
};

export function fillColor(level: FillLevel) {
  return FILL[level];
}

function section(
  label: string,
  level: FillLevel,
  filled: number,
  capacity: number,
  groups: string[] = ["China Geo (Customers and Partners)", "MBG (including licensee)"],
): SectionCell {
  return {
    id: `section-${label}`,
    label,
    level,
    filled,
    capacity,
    groups: level === "disabled" ? [] : groups,
  };
}

const SUITE_LEADS = [
  "Aimee Foskie",
  "Jordan Hale",
  "Priya Shah",
  "Marcus Bell",
  "Elena Vos",
  "Naomi Park",
  "Luis Ortega",
  "Chris Dalton",
];

const SUITE_GUEST_POOL: Array<Omit<SuiteSeatRow, "seat" | "seatType">> = [
  { name: "Maya Whitford", role: "Head of Marketing", company: "Microsoft", companyTone: "lime", group: "Europe + META (Retailers)" },
  { name: "Wei Lin", role: "Software Lead", company: "Microsoft", companyTone: "lime", group: "China Geo (Customers and Partners)" },
  { name: "Clara Beaumont", role: "Head of Marketing", company: "Dell", companyTone: "neutral", group: "ROW Invited Media & Analysts" },
  { name: "Sophie Langley", role: "Keynote Speaker", company: "Microsoft", companyTone: "lime", speaker: true },
  { name: "Julian Mercer", role: "Director of Sales", company: "Apple", companyTone: "neutral", group: "NA (General)" },
  { name: "Lena Ashford", role: "Partner Manager", company: "Dell", companyTone: "neutral", group: "Europe + META (Retailers)" },
  { name: "Nora Ellison", role: "Executive Director", company: "NVIDIA", companyTone: "lime", group: "ROW Invited Media & Analysts" },
  { name: "Kenji Nakamura", role: "Product Strategist", company: "Samsung", companyTone: "lime", group: "China Geo (Customers and Partners)" },
  { name: "Amara Okonkwo", role: "VP Partnerships", company: "OpenAI", companyTone: "lime", group: "NA (Hosted)" },
  { name: "Sienna Pratt", role: "Design Lead", company: "Apple", companyTone: "neutral", group: "Europe + META (Hosted)" },
  { name: "Caleb Nguyen", role: "Solutions Architect", company: "Dell", companyTone: "neutral", group: "AP (General)" },
  { name: "Freya Lindstrom", role: "Research Analyst", company: "Microsoft", companyTone: "lime", group: "ROW Invited Media & Analysts" },
  { name: "Mateo Ruiz", role: "Regional Manager", company: "Samsung", companyTone: "lime", group: "LATAM (Hosted)" },
  { name: "Mira Solano", role: "Growth Lead", company: "Oppo", companyTone: "neutral", group: "Digital Commerce Organization" },
  { name: "Zoe Cartwright", role: "Brand Director", company: "Huawei", companyTone: "neutral", group: "Europe + META (Retailers)" },
  { name: "Sebastian Cole", role: "Engineering Manager", company: "Microsoft", companyTone: "lime", group: "SSG" },
  { name: "Felix Ortega", role: "Account Executive", company: "Dell", companyTone: "neutral", group: "NA (General)" },
  { name: "Omar Haddad", role: "Cloud Architect", company: "NVIDIA", companyTone: "lime", group: "China Geo (Customers and Partners)" },
  { name: "Hugo Berg", role: "Media Relations", company: "Apple", companyTone: "neutral", group: "ROW Invited Media & Analysts" },
  { name: "Anika Desai", role: "Program Manager", company: "Microsoft", companyTone: "lime", group: "AP (General)" },
  { name: "Priya Nair", role: "Operations Lead", company: "Samsung", companyTone: "lime", group: "ISG" },
  { name: "Ethan Blake", role: "AI Researcher", company: "OpenAI", companyTone: "lime", group: "GTP" },
  { name: "Sofia Reyes", role: "Chief of Staff", company: "Dell", companyTone: "neutral", group: "CEO Office Guests" },
  { name: "Elena Petrova", role: "Investor Relations", company: "Apple", companyTone: "neutral", group: "CFO - Investors and Financial Community" },
  { name: "Jonah Pierce", role: "Keynote Speaker", company: "NVIDIA", companyTone: "lime", speaker: true },
  { name: "Harper Quinn", role: "Events Producer", company: "Samsung", companyTone: "lime", group: "NA (Hosted)" },
  { name: "Ibrahim Yusuf", role: "Alliance Manager", company: "Microsoft", companyTone: "lime", group: "Global Operations - Global Alliance" },
  { name: "Chloe Winters", role: "Counsel", company: "Dell", companyTone: "neutral", group: "Legal Org" },
];

function guestAt(suiteNumber: number, index: number) {
  return SUITE_GUEST_POOL[(suiteNumber * 7 + index) % SUITE_GUEST_POOL.length]!;
}

function suite(
  n: number,
  level: FillLevel,
  opts: Partial<Omit<SuiteCell, "id" | "label" | "level">> = {},
): SuiteCell {
  const filled = opts.filled ?? (level === "red" ? 108 : level === "amber" ? 48 : level === "yellow" ? 62 : 78);
  const capacity = opts.capacity ?? 112;
  const owner = SUITE_OWNERS[(n * 5 + 1) % SUITE_OWNERS.length]!;
  const attendees = Array.from({ length: 8 }, (_, index) => guestAt(n, index).name);
  return {
    id: `suite-${n}`,
    label: `Suite ${n}`,
    level,
    levelLabel: opts.levelLabel ?? "Level 3",
    ownerId: opts.ownerId ?? owner.id,
    suiteName: opts.suiteName ?? `${owner.name}'s suite`,
    suiteLead: opts.suiteLead ?? SUITE_LEADS[n % SUITE_LEADS.length]!,
    filled,
    capacity,
    attendees: opts.attendees ?? attendees,
    moreCount: opts.moreCount ?? 4 + (n % 7),
  };
}

/** Columns top→bottom as in Figma (higher section numbers at the top / stage-adjacent). */
export const SECTION_COLUMNS: SectionCell[][] = [
  [
    section("110", "green", 74, 112),
    section("109", "green", 80, 112),
    section("108", "green", 72, 112),
    section("107", "yellow", 58, 112),
    section("106", "green", 76, 112),
    section("105", "green", 81, 112),
    section("104", "green", 69, 112),
    section("103", "yellow", 61, 112),
    section("102", "green", 77, 112),
    section("101", "green", 70, 112),
  ],
  [
    section("210", "green", 75, 112),
    section("209", "green", 79, 112),
    section("208", "green", 73, 112),
    section("207", "yellow", 57, 112),
    section("206", "green", 78, 112),
    section("205", "amber", 44, 112),
    section("204", "amber", 41, 112),
    section("203", "yellow", 60, 112),
    section("202", "green", 82, 112),
  ],
  [
    section("310", "green", 71, 112),
    section("309", "green", 76, 112),
    section("308", "green", 80, 112),
    section("307", "green", 78, 112),
    section("306", "yellow", 59, 112),
    section("305", "yellow", 55, 112),
    section("304", "red", 106, 112),
    section("303", "green", 74, 112),
    section("302", "yellow", 63, 112),
  ],
  [
    section("409", "red", 110, 112),
    section("408", "green", 77, 112),
    section("407", "yellow", 56, 112),
    section("406", "amber", 46, 112),
    section("405", "green", 79, 112),
    section("404", "yellow", 58, 112),
    section("403", "yellow", 54, 112),
  ],
];

/** Left column: Suite 13 → 1 (top to bottom). Right: Suite 23 → 14. */
export const SUITE_LEFT: SuiteCell[] = [
  suite(13, "green"),
  suite(12, "green"),
  suite(11, "green"),
  suite(10, "red", { filled: 110 }),
  suite(9, "green"),
  suite(8, "green"),
  suite(7, "disabled", { filled: 0, capacity: 112, attendees: [], moreCount: 0 }),
  suite(6, "yellow", { filled: 62 }),
  suite(5, "green"),
  suite(4, "amber", { filled: 48 }),
  suite(3, "amber", { filled: 45 }),
  suite(2, "yellow", { filled: 60 }),
  suite(1, "green"),
];

export const SUITE_RIGHT: SuiteCell[] = [
  suite(23, "green"),
  suite(22, "yellow", { filled: 64 }),
  suite(21, "yellow", { filled: 58 }),
  suite(20, "green"),
  suite(19, "green"),
  suite(18, "red", { filled: 109 }),
  suite(17, "green"),
  suite(16, "green"),
  suite(15, "green"),
  suite(14, "green"),
];

export type GuestInfo = {
  name: string;
  title: string;
  email: string;
  country: string;
  packageLabel: string;
  packageColor: "jade" | "green" | "purple" | "amber";
  receptions: string[];
  company: string;
  companyRegistered: string;
  group: string;
  groupProgress: string;
  seatingSection: string;
  seatingFill: string;
  alongWith: string[];
  diet: string;
  assistance: string;
  otherNotes: string;
};

export type SuiteSeatRow = {
  seat: number;
  seatType: "haptic" | "barstool";
  name: string;
  role: string;
  company: string;
  companyTone: "lime" | "neutral";
  group?: string;
  speaker?: boolean;
};

export type SuiteDetail = {
  suiteNumber: number;
  levelLabel: string;
  suiteName: string;
  suiteLead: string;
  filled: number;
  capacity: number;
  totalSeats: number;
  hapticSeats: number;
  barstoolSeats: number;
  seats: SuiteSeatRow[];
};

const GUEST_OVERRIDES: Record<string, Partial<GuestInfo>> = {
  "Nora Ellison": {
    title: "Executive Director",
    email: "noraellison@guestia.com",
    country: "France",
    company: "Dell",
    group: "Europe + META (Retailers)",
    assistance: "Wheelchair assistance",
  },
  "Wei Lin": {
    title: "Software Lead",
    email: "weilin@guestia.com",
    country: "China",
    company: "Microsoft",
    group: "China Geo (Customers and Partners)",
    assistance: "Not specified",
  },
  "Clara Beaumont": {
    title: "Head of Marketing",
    email: "clarabeaumont@guestia.com",
    country: "United Kingdom",
    company: "Dell",
    group: "ROW Invited Media & Analysts",
    assistance: "Not specified",
  },
  "Lena Ashford": {
    title: "Partner Manager",
    email: "lenaashford@guestia.com",
    country: "Germany",
    company: "Apple",
    group: "Europe + META (Retailers)",
    assistance: "Not specified",
  },
  "Julian Mercer": {
    title: "Director of Sales",
    email: "julianmercer@guestia.com",
    country: "United States",
    company: "Microsoft",
    group: "NA (General)",
    assistance: "Not specified",
  },
  "Maya Whitford": {
    title: "Head of Marketing",
    email: "mayawhitford@guestia.com",
    country: "France",
    company: "Microsoft",
    group: "Europe + META (Retailers)",
    assistance: "Not specified",
  },
  "Sophie Langley": {
    title: "Software Lead",
    email: "sophielangley@guestia.com",
    country: "Australia",
    company: "Microsoft",
    group: "AP (General)",
    packageLabel: "Speaker",
    packageColor: "jade",
    assistance: "Not specified",
  },
};

export function getGuestInfo(name: string): GuestInfo {
  const override = GUEST_OVERRIDES[name] ?? {};
  const slug = name.toLowerCase().replace(/\s+/g, "");
  return {
    name,
    title: override.title ?? "Guest",
    email: override.email ?? `${slug}@guestia.com`,
    country: override.country ?? "France",
    packageLabel: override.packageLabel ?? "Enhanced Guest",
    packageColor: override.packageColor ?? "jade",
    receptions: override.receptions ?? ["EU + META"],
    company: override.company ?? "Dell",
    companyRegistered: override.companyRegistered ?? "78 registered",
    group: override.group ?? "Europe + META (Retailers)",
    groupProgress: override.groupProgress ?? "78/112 (71%) registered of group target",
    seatingSection: override.seatingSection ?? "Sec 207",
    seatingFill: override.seatingFill ?? "58/112 (51%) seats filled",
    alongWith: override.alongWith ?? ["Europe + META (Retailers)", "China Geo (Customers and Partners)"],
    diet: override.diet ?? "Not specified",
    assistance: override.assistance ?? "Not specified",
    otherNotes: override.otherNotes ?? "No notes yet",
  };
}

export function getSuiteDetail(cell: SuiteCell): SuiteDetail {
  const suiteNumber = Number(cell.label.replace(/\D/g, "")) || 12;
  const seats: SuiteSeatRow[] = Array.from({ length: 24 }, (_, index) => ({
    seat: index + 1,
    seatType: index < 18 ? "haptic" : "barstool",
    ...guestAt(suiteNumber, index),
  }));
  return {
    suiteNumber,
    levelLabel: cell.levelLabel,
    suiteName: cell.suiteName,
    suiteLead: cell.suiteLead,
    filled: cell.filled,
    capacity: cell.capacity,
    totalSeats: 24,
    hapticSeats: 18,
    barstoolSeats: 6,
    seats,
  };
}

export function getSeating() {
  return {
    notice: "Seating chart data will be available ~2 weeks prior to event.",
    updated: "Last updated: Oct 14, 2026, 5:00 PM",
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
      ] satisfies TicketSegment[],
    },
    summary: {
      sectionsFilled: {
        label: "Sections fully filled",
        percent: 89,
        color: "#3ecf6e",
        caption: "of sections",
      },
      suitesFilled: {
        label: "Suites fully filled",
        percent: 64,
        color: "#e6c547",
        caption: "of suites",
      },
      totalRegistration: {
        label: "Total registration",
        percent: 89,
        color: "#3ecf6e",
        caption: "Registered",
      },
    } satisfies Record<string, Gauge>,
    sectionsNotFilled: byLowestFill(SECTION_COLUMNS.flat()).map((cell) => ({
      id: cell.id,
      label: cell.label,
      percent: fillPercent(cell.filled, cell.capacity),
    })) satisfies GapRow[],
    suitesNotFilled: byLowestFill([...SUITE_LEFT, ...SUITE_RIGHT]),
    sectionColumns: SECTION_COLUMNS,
    suiteLeft: SUITE_LEFT,
    suiteRight: SUITE_RIGHT,
  };
}

export type SeatingData = ReturnType<typeof getSeating>;
