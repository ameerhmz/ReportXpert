import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ReportXpert — Sovereign University Administration & Accreditation AI",
  description: "Secure, air-gapped university administrative AI assistant for NAAC, UGC, NIRF, WASC dossiers, data analysis, and institutional reporting.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full w-full antialiased`}
    >
      <body className="h-full w-full overflow-hidden bg-[#1f1e1d] text-[#ece8e1] m-0 p-0 font-sans">
        {children}
      </body>
    </html>
  );
}
