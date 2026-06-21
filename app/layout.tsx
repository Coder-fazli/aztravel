import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import { SITE_URL, SITE_INDEXABLE } from "@/lib/site";
import { getSettings } from "@/lib/actions/settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Poppins is the Figma design font — load it via next/font so the exact
// weights (Regular/Medium/Bold) are self-hosted and always applied.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Dynamic so the favicon can be changed from the admin (Home page settings).
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    metadataBase: new URL(SITE_URL),
    title: "AzTravel",
    description: "Discover Azerbaijan — destinations, seasons and travel guides.",
    // Work-in-progress: keep the whole site out of search results until ready.
    robots: SITE_INDEXABLE
      ? undefined
      : { index: false, follow: false, nocache: true },
    icons: settings?.favicon ? { icon: settings.favicon } : undefined,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

