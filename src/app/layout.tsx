import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import { MotionProvider } from "@/components/providers/MotionProvider";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Manzara — Project Pipeline Tracker",
  description: "Unified project management for approval-heavy organizations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`h-full ${dmSans.variable} ${dmMono.variable}`}
      suppressHydrationWarning
    >
      <body className="h-full antialiased">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
