/** Public branding only. Never add credentials here. Null fields await owner input. */
const platformName = "SMS Platform";
export const brand = {
  name: platformName,
  wordmark: platformName,
  tagline: "Good conversations start here.",
  logo: null as string | null,
  favicon: "/icon.svg",
  domain: null as string | null,
  company: { legalName: null as string | null, address: null as string | null },
  supportEmail: null as string | null,
  socialLinks: [] as { label: string; url: string }[],
  email: { senderName: platformName, footer: "Business messaging, thoughtfully managed." },
  seo: {
    title: `${platformName} — Business messaging`,
    description: "Prepare campaigns, organize contacts and keep conversations moving. Development preview.",
  },
  darkColors: {
    paper: "#121a19", white: "#1b2724", ink: "#eef3ef", muted: "#b1c0b9",
    line: "#45574f", mist: "#2b3b34", "blue-light": "#21385d",
    cobalt: "#82aaff", "cobalt-dark": "#a3c1ff", green: "#9adbb3", "green-bg": "#183a2a",
    amber: "#f4d08b", "amber-bg": "#3b2e16", red: "#ffb4a9", "red-bg": "#442625", overlay: "#000000a6",
  },
  colors: {
    paper: "#f7f6f2", white: "#ffffff", ink: "#182321",
    cobalt: "#2454e6", "cobalt-dark": "#143dc2", mist: "#e9ece5",
    muted: "#52605a", line: "#dfe3dc", "blue-light": "#eaf0ff",
    green: "#226647", "green-bg": "#edf6ed",
    amber: "#845614", "amber-bg": "#fff2d9",
    red: "#a33432", "red-bg": "#fff0ed", overlay: "#18232170",
  },
} as const;
export const brandVariables = Object.fromEntries(
  Object.entries(brand.colors).map(([name, value]) => [`--color-${name}`, value]),
);

export const darkBrandVariables = Object.fromEntries(Object.entries(brand.darkColors).map(([name, value]) => [`--color-${name}`, value]));
