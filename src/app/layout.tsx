import type { Metadata, Viewport } from "next";
import { Creepster, Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const creepster = Creepster({
  variable: "--font-creepster",
  subsets: ["latin"],
  weight: "400",
});

const siteUrl = "https://candymap.vercel.app";
const shareTitle = "CandyMap 🎃 | Discover the Best Halloween Candy";
const shareDescription =
  "Explore Halloween houses, rate candy, and discover the best trick-or-treat spots in your neighborhood.";
const shareImage = {
  url: `${siteUrl}/og-image.png`,
  width: 1200,
  height: 630,
  alt: "CandyMap, a Halloween map for discovering the best candy in your neighborhood",
  type: "image/png",
} as const;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CandyMap",
    template: "%s · CandyMap",
  },
  description: shareDescription,
  applicationName: "CandyMap",
  openGraph: {
    type: "website",
    url: `${siteUrl}/`,
    siteName: "CandyMap",
    title: shareTitle,
    description: shareDescription,
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title: shareTitle,
    description: shareDescription,
    images: [shareImage],
  },
  appleWebApp: {
    capable: true,
    title: "CandyMap",
    statusBarStyle: "black-translucent",
  },
  // iPhone Safari still looks for this name when adding a site to the Home Screen.
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // Keep forms above the iPhone keyboard instead of hiding them behind it.
  interactiveWidget: "resizes-content",
  themeColor: "#ff7a18",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${creepster.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
