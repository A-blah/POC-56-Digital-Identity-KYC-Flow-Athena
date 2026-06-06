import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Real Rails · Digital Identity & KYC Flow | POC 56",
  description:
    "Production-grade KYC intelligence dashboard — Governance & Trust Rail. Real-time OFAC sanctions screening, OpenBanking UK integration, and immutable audit trails.",
  keywords: ["KYC", "AML", "OFAC", "OpenBanking", "Real Rails", "Compliance", "Identity Verification"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body style={{ background: '#030712', color: '#F1F5F9', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
