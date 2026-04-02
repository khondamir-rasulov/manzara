import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="h-full">
      <body className="h-full antialiased">{children}</body>
    </html>
  );
}
