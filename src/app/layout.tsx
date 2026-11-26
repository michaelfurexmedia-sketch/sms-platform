import type { Metadata } from "next";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/geist";
import "./globals.css";
import { brand, brandVariables } from "@/config/brand";
import "@/styles/foundation.css";
import type { CSSProperties } from "react";
export const metadata: Metadata = {
  title: brand.seo.title,
  description: brand.seo.description,
  icons: { icon: brand.favicon },
  robots: { index: false, follow: false },
  ...(brand.domain ? { metadataBase: new URL(brand.domain) } : {}),
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={brandVariables as CSSProperties}>
      <body>{children}</body>
    </html>
  );
}
