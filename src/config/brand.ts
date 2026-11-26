import type { CSSProperties } from "react";

const name = "SMS Platform";
export const brand = {
  name,
  wordmark: name,
  logo: null as string | null,
  favicon: "/icon.svg",
  domain: null as string | null,
  company: { legalName: null as string | null, address: null as string | null },
  supportEmail: null as string | null,
  socialLinks: [] as { label: string; href: string }[],
  email: { senderName: name, replyTo: null as string | null, footer: name },
  seo: {
    title: name,
    description: "A considered foundation for business messaging.",
  },
  colors: {
    light: {
      legacyMist: "#e9ece5",
      legacySuccessBg: "#edf6ed",
      legacyDangerBg: "#fff0ed",
      legacyAmber: "#845614",
      legacyAmberBg: "#fff2d9",
      legacyOverlay: "#18232170",
      paper: "#f5f4ef",
      surface: "#ffffff",
      ink: "#17251f",
      muted: "#52605a",
      line: "#cdd2cb",
      accent: "#2458d3",
      onAccent: "#ffffff",
      wash: "#e8eefc",
      success: "#166248",
      danger: "#a02b30",
    },
    dark: {
      legacyMist: "#2b3b34",
      legacySuccessBg: "#183a2a",
      legacyDangerBg: "#442625",
      legacyAmber: "#f4d08b",
      legacyAmberBg: "#3b2e16",
      legacyOverlay: "#000000a6",
      paper: "#111a17",
      surface: "#19241f",
      ink: "#eef3ee",
      muted: "#b3c0b7",
      line: "#43534a",
      accent: "#a2bcff",
      onAccent: "#10213d",
      wash: "#26354d",
      success: "#85dcb5",
      danger: "#ffaaa8",
    },
  },
} as const;

export function brandVariables(theme: "light" | "dark"): CSSProperties {
  return Object.fromEntries(
    Object.entries(brand.colors[theme]).map(([key, value]) => [
      "--" + key.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase()),
      value,
    ]),
  ) as CSSProperties;
}
