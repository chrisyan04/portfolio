import type { Metadata } from "next";
import "./globals.css";
import { PortfolioProvider } from "@/components/PortfolioProvider";
import SiteChrome from "@/components/SiteChrome";
import { readPublishedPortfolio } from "@/lib/portfolio-store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Chris Yan | Dev",
  description: "Learn some more about me! I promise I'm not boring!",
  icons: { icon: "/favicon.ico" },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let initial;
  try { initial = await readPublishedPortfolio(); }
  catch (error) { console.error("Could not load portfolio content", error); }
  return (
    <html lang="en">
      <body><PortfolioProvider initialContent={initial}><SiteChrome>{children}</SiteChrome></PortfolioProvider></body>
    </html>
  );
}
