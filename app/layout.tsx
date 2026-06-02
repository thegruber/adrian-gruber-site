import type { Metadata } from "next";
import { DM_Mono, Geist } from "next/font/google";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { MotionProvider } from "@/components/motion-provider";
import "./globals.css";

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const departureMono = localFont({
  src: "../fonts/departure-mono/DepartureMono-Regular.woff2",
  variable: "--font-departure-mono",
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://adriangruber.com"),
  title: "Adrian Gruber",
  description: "Adrian Gruber designs and builds small, useful digital products, including Pinio.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Adrian Gruber",
    description: "Product design, frontend, and useful digital products.",
    url: "https://adriangruber.com/",
    siteName: "Adrian Gruber",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Adrian Gruber",
    description: "Product design, frontend, and useful digital products.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${dmMono.variable} ${departureMono.variable}`}>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
