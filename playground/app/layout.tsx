import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "browser-haptic · Playground",
  description: "Try haptic feedback in the browser. Lightweight API for Vibration API and iOS Safari.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
