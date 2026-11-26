import type { Metadata } from "next";
import "@fontsource/bricolage-grotesque/500.css";
import "@fontsource/bricolage-grotesque/600.css";
import "@fontsource/geist/400.css";
import "@fontsource/geist/500.css";
import "@fontsource/geist/600.css";
import "./globals.css";
import { brand, brandVariables } from "@/config/brand";

export const metadata: Metadata = {
  title: { default: brand.seo.title, template: "%s · " + brand.name },
  description: brand.seo.description,
  icons: { icon: brand.favicon },
  robots: { index: false, follow: false },
  ...(brand.domain ? { metadataBase: new URL(brand.domain) } : {})
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" style={brandVariables("light")}><body>{children}</body></html>;
}
