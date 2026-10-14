export type GuestType = "General Attendee" | "Enhanced Guest" | "Suite Guest" | "VVIP";

export type Reception = "EU + META" | "CMO" | "LSAC" | "NA";

export type RegistrationRow = {
  id: string;
  name: string;
  company: string;
  globalAccount: boolean;
  jobTitle: string;
  region: string;
  guestGroup: string;
  guestType: GuestType;
  receptions: Reception[];
  speaker: boolean;
};

export const GUEST_TYPES: GuestType[] = [
  "General Attendee",
  "Enhanced Guest",
  "Suite Guest",
  "VVIP",
];

export const RECEPTIONS: Reception[] = ["EU + META", "CMO", "LSAC", "NA"];

/** Guest groups used on the dashboard registration table (plus Speakers for filter). */
export const GUEST_GROUPS = [
  "Speakers",
  "ROW Invited Media & Analysts",
  "Europe + META (Retailers)",
  "Europe + META (Hosted)",
  "Europe + META (General)",
  "China Geo (Customers and Partners)",
  "NA (General)",
  "NA (Hosted)",
  "AP (General)",
  "LATAM (General)",
  "LATAM (Hosted)",
  "GA",
  "Digital Commerce Organization",
  "GTP",
  "ISG",
  "IDG",
  "MBG (including Licensee)",
  "SSG",
  "Legal Org",
  "BOD & Guests",
  "CFO - Investors and Financial Community",
  "China Investors",
  "CEO Office Guests",
  "CMO - Marketing & Comms General",
  "TW Sponsors",
  "Social Media",
  "Global Operations - Global Alliance",
  "CTO",
] as const;

export const GLOBAL_ACCOUNTS = [
  "Microsoft",
  "NVIDIA",
  "Dell",
  "Apple",
  "Samsung",
  "OpenAI",
] as const;

const REGIONS = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Albania",
  "Brazil",
  "Mexico",
  "Japan",
  "China",
  "Singapore",
  "India",
  "Australia",
  "UAE",
  "South Africa",
];

const JOBS = [
  "VP Marketing",
  "Director of Partnerships",
  "Product Manager",
  "CTO",
  "Head of Communications",
  "Analyst",
  "Journalist",
  "Account Executive",
  "Solutions Architect",
  "CMO",
  "Investor Relations Lead",
  "Event Manager",
  "Marketing Manager",
  "General Manager",
  "Community Manager",
  "Keynote Speaker",
];

const COMPANIES = [
  ...GLOBAL_ACCOUNTS,
  "Motorola",
  "Oppo",
  "Huawei",
  "Intel",
  "AMD",
  "Accenture",
  "Deloitte",
  "Bloomberg",
  "Reuters",
  "Lenovo",
  "Hewlett Packard Industries",
];

const FIRST = [
  "Tessa",
  "Kenji",
  "Amara",
  "Luca",
  "Sienna",
  "Omar",
  "Freya",
  "Jonah",
  "Yara",
  "Caleb",
  "Isla",
  "Mateo",
  "Harper",
  "Anika",
  "Leo",
  "Zoe",
  "Ravi",
  "Nora",
  "Felix",
  "Mira",
  "Ethan",
  "Priya",
  "Hugo",
  "Aaliyah",
  "Sebastian",
  "Chloe",
  "Ibrahim",
  "Elena",
  "Marcus",
  "Sofia",
  "Maya",
  "Evan",
  "Nina",
  "Diego",
  "Aria",
  "Theo",
  "Lina",
  "Noah",
  "Grace",
  "Victor",
];

const LAST = [
  "Marlowe",
  "Nakamura",
  "Okonkwo",
  "Bianchi",
  "Pratt",
  "Haddad",
  "Lindstrom",
  "Pierce",
  "Mensah",
  "Nguyen",
  "Moreau",
  "Ruiz",
  "Quinn",
  "Desai",
  "Hartmann",
  "Cartwright",
  "Patel",
  "Svensson",
  "Ortega",
  "Solano",
  "Blake",
  "Nair",
  "Berg",
  "Grant",
  "Cole",
  "Winters",
  "Yusuf",
  "Petrova",
  "Hale",
  "Reyes",
  "Whitford",
  "Calder",
  "Voss",
  "Tanaka",
  "Vargas",
  "Rahman",
  "Park",
  "Feldman",
  "Holloway",
  "Lang",
];

const NON_SPEAKER_GROUPS = GUEST_GROUPS.filter((group) => group !== "Speakers");

function pick<T>(list: readonly T[], index: number): T {
  return list[index % list.length]!;
}

/** ~70% GA / 20% Enhanced / 8% Suite / 2% VVIP, then scramble so types are mixed. */
function guestTypePool(count: number): GuestType[] {
  const types: GuestType[] = [];
  for (let i = 0; i < count; i += 1) {
    const roll = i % 50;
    if (roll < 35) types.push("General Attendee");
    else if (roll < 45) types.push("Enhanced Guest");
    else if (roll < 49) types.push("Suite Guest");
    else types.push("VVIP");
  }
  // deterministic shuffle
  for (let i = types.length - 1; i > 0; i -= 1) {
    const j = (i * 17 + 3) % (i + 1);
    const tmp = types[i]!;
    types[i] = types[j]!;
    types[j] = tmp;
  }
  return types;
}

function receptionsFor(index: number): Reception[] {
  if (index % 6 === 0) return ["EU + META", "CMO"];
  if (index % 5 === 0) return ["LSAC", "NA"];
  if (index % 4 === 0) return ["CMO"];
  if (index % 3 === 0) return ["EU + META"];
  if (index % 2 === 0) return ["NA"];
  return ["LSAC"];
}

export function getRegistrations(): RegistrationRow[] {
  const total = 54;
  const speakerCount = 3;
  const types = guestTypePool(total - speakerCount);
  const rows: RegistrationRow[] = [];

  for (let i = 0; i < total; i += 1) {
    const speaker = i < speakerCount;
    const company = speaker ? pick(GLOBAL_ACCOUNTS, i) : pick(COMPANIES, i + 3);
    const globalAccount = (GLOBAL_ACCOUNTS as readonly string[]).includes(company);
    rows.push({
      id: `reg-${i + 1}`,
      name: speaker && i === 0 ? "Jonah Pierce" : `${pick(FIRST, i + 5)} ${pick(LAST, i * 3 + 1)}`,
      company,
      globalAccount,
      jobTitle: speaker ? "Keynote Speaker" : pick(JOBS, i * 2),
      region: pick(REGIONS, i + 2),
      guestGroup: speaker ? "Speakers" : pick(NON_SPEAKER_GROUPS, i + 4),
      guestType: speaker ? "Suite Guest" : types[i - speakerCount]!,
      receptions: receptionsFor(i),
      speaker,
    });
  }

  return rows;
}
