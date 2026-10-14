export type TextRun = { text: string; strong?: boolean };

export type AllocationRow = {
  group: string;
  owner: string;
  value: number;
  maximum: number;
  target: number;
  color: string;
};

export type CompanyBar = { name: string; value: number; color: string; global?: boolean };

export type Gauge = { label: string; percent: number; color: string };

export type TicketSegment = {
  name: string;
  count: number;
  share: number;
  color: string;
  legend: boolean;
};

export type GuestType = "General Attendee" | "Enhanced Guest" | "Suite Guest" | "VVIP";

export type RegistrationBadge = { label: GuestType; tone: "general" | "enhanced" | "suite" | "vvip" };

export type Registration = {
  name: string;
  badges: RegistrationBadge[];
  company: string;
  group: string;
  speaker?: boolean;
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

function guest(type: GuestType): RegistrationBadge[] {
  const tone =
    type === "General Attendee"
      ? "general"
      : type === "Enhanced Guest"
        ? "enhanced"
        : type === "Suite Guest"
          ? "suite"
          : "vvip";
  return [{ label: type, tone }];
}

function row(
  name: string,
  type: GuestType,
  company: string,
  group: string,
  speaker = false,
): Registration {
  return { name, badges: guest(type), company, group, speaker };
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
        { text: " of its targeted registration goal. With one month remaining, Tech World registration is at a " },
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
      ],
    },
    allocation: [
      { group: "ROW Invited Media & Analysts", owner: "Nora Ellison", value: 120, maximum: 129, target: 114, color: "#3ecf6e" },
      { group: "Europe + META (Retailers)", owner: "Priya Chandrasekar", value: 68, maximum: 90, target: 89, color: "#e6c547" },
      { group: "MBG (including Licensee)", owner: "Jonah Weiss", value: 20, maximum: 66, target: 65, color: "#f0434b" },
      { group: "Europe + META (Retailers)", owner: "Camille Ortega", value: 96, maximum: 96, target: 69, color: "#3ecf6e" },
      { group: "China Geo (Customers and Partners)", owner: "Hana Okada & Wei Shen", value: 70, maximum: 88, target: 87, color: "#e6c547" },
      { group: "MBG (including Licensee)", owner: "Marcus Belmont", value: 72, maximum: 76, target: 75, color: "#3ecf6e" },
      { group: "ROW Invited Media & Analysts", owner: "Imani Brooks", value: 70, maximum: 88, target: 87, color: "#e6c547" },
      { group: "Europe + META (Hosted)", owner: "Theo Marchetti", value: 68, maximum: 90, target: 89, color: "#e6c547" },
      { group: "China Geo (Customers and Partners)", owner: "Sofia Alvarez", value: 68, maximum: 90, target: 89, color: "#e6c547" },
      { group: "MBG (including Licensee)", owner: "Daniel Cho", value: 20, maximum: 66, target: 65, color: "#f0434b" },
      { group: "NA (General)", owner: "Elena Voss", value: 120, maximum: 144, target: 95, color: "#e6c547" },
      { group: "CTO", owner: "Global desk", value: 20, maximum: 66, target: 65, color: "#f0434b" },
      { group: "NA (Hosted)", owner: "Riley Quinn", value: 84, maximum: 110, target: 100, color: "#e6c547" },
      { group: "AP (General)", owner: "Mei Tanaka", value: 55, maximum: 80, target: 72, color: "#e6c547" },
      { group: "LATAM (Hosted)", owner: "Diego Vargas", value: 41, maximum: 60, target: 50, color: "#3ecf6e" },
      { group: "ISG", owner: "Aisha Rahman", value: 33, maximum: 70, target: 60, color: "#f0434b" },
      { group: "SSG", owner: "Owen Hartley", value: 58, maximum: 75, target: 70, color: "#e6c547" },
      { group: "China Investors", owner: "Lina Park", value: 9, maximum: 64, target: 64, color: "#f0434b" },
      { group: "TW Sponsors", owner: "Grace Holloway", value: 47, maximum: 52, target: 48, color: "#3ecf6e" },
      { group: "Digital Commerce Organization", owner: "Noah Feldman", value: 29, maximum: 55, target: 50, color: "#f0434b" },
      { group: "CFO - Investors and Financial Community", owner: "Amelia Cross", value: 22, maximum: 40, target: 35, color: "#e6c547" },
      { group: "Global Operations - Global Alliance", owner: "Victor Lang", value: 61, maximum: 78, target: 70, color: "#3ecf6e" },
    ],
    companies: [
      { name: "Motorola", value: 16, color: "#bcc3ff", global: false },
      { name: "Oppo", value: 26, color: "#a8b2ff", global: false },
      { name: "Huawei", value: 39, color: "#94a1ff", global: false },
      { name: "Samsung", value: 112, color: "#8090ff", global: true },
      { name: "OpenAI", value: 133, color: "#6c7fff", global: true },
      { name: "Apple", value: 165, color: "#586eff", global: true },
      { name: "Dell", value: 371, color: "#3b51df", global: true },
      { name: "NVIDIA", value: 435, color: "#2e43cb", global: true },
      { name: "Microsoft", value: 587, color: "#2034b7", global: true },
    ],
    gauges: [
      { label: "Total registration", percent: 89, color: "#3ecf6e" },
      { label: "Speaker registration", percent: 24, color: "#f0434b" },
      { label: "VVIP registration", percent: 89, color: "#3ecf6e" },
      { label: "Standard registration", percent: 89, color: "#3ecf6e" },
      { label: "Enhanced registration", percent: 56, color: "#f5a524" },
      { label: "Suite registration", percent: 64, color: "#e6c547" },
    ],
    // ~70% General Attendee, ~20% Enhanced, ~8% Suite, ~2% VVIP — scrambled, speaker near top
    registrations: [
      row("Jonah Pierce", "Suite Guest", "Microsoft", "", true),
      row("Kenji Nakamura", "General Attendee", "Apple", "China Geo (Customers and Partners)"),
      row("Amara Okonkwo", "Enhanced Guest", "Dell", "ROW Invited Media & Analysts"),
      row("Luca Bianchi", "VVIP", "Hewlett Packard Industries", "China Geo (Customers and Partners)"),
      row("Sienna Pratt", "General Attendee", "NVIDIA", "Europe + META (Retailers)"),
      row("Aaliyah Grant", "Suite Guest", "NVIDIA", "MBG (including Licensee)"),
      row("Caleb Nguyen", "General Attendee", "Apple", "China Geo (Customers and Partners)"),
      row("Freya Lindstrom", "Enhanced Guest", "Dell", "ROW Invited Media & Analysts"),
      row("Mateo Ruiz", "General Attendee", "Samsung", "NA (General)"),
      row("Mira Solano", "Enhanced Guest", "Oppo", "Digital Commerce Organization"),
      row("Zoe Cartwright", "General Attendee", "Apple", "Europe + META (Hosted)"),
      row("Sebastian Cole", "Enhanced Guest", "Samsung", "SSG"),
      row("Felix Ortega", "General Attendee", "Huawei", "GA"),
      row("Omar Haddad", "Enhanced Guest", "Apple", "China Geo (Customers and Partners)"),
      row("Hugo Berg", "General Attendee", "Dell", "IDG"),
      row("Anika Desai", "Enhanced Guest", "Microsoft", "AP (General)"),
      row("Nathan Kim", "General Attendee", "Motorola", "CMO - Marketing & Comms General"),
      row("Tessa Marlowe", "General Attendee", "Microsoft", "Europe + META (Retailers)"),
      row("Isla Moreau", "General Attendee", "Dell", "ROW Invited Media & Analysts"),
      row("Ravi Patel", "General Attendee", "NVIDIA", "LATAM (General)"),
      row("Chloe Winters", "General Attendee", "Microsoft", "Legal Org"),
      row("Marcus Hale", "General Attendee", "Dell", "China Investors"),
      row("Priya Nair", "General Attendee", "Apple", "ISG"),
      row("Ethan Blake", "General Attendee", "OpenAI", "GTP"),
      row("Sofia Reyes", "General Attendee", "Microsoft", "CEO Office Guests"),
      row("Ibrahim Yusuf", "General Attendee", "Samsung", "BOD & Guests"),
      row("Elena Petrova", "General Attendee", "Apple", "CFO - Investors and Financial Community"),
      row("Harper Quinn", "General Attendee", "OpenAI", "NA (Hosted)"),
      row("Leo Hartmann", "General Attendee", "Dell", "Europe + META (General)"),
      row("Yara Mensah", "General Attendee", "Microsoft", "ROW Invited Media & Analysts"),
      row("Nora Svensson", "General Attendee", "Samsung", "LATAM (Hosted)"),
    ],
  };
}
