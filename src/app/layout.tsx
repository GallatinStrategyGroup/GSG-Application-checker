import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Editorial serif for headlines — the main "premium" signal.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gsg-application-checker.vercel.app"),
  title: {
    default: "GSG — College application review by real counselors",
    template: "%s · Gallatin Strategy Group",
  },
  description:
    "Upload your application, choose a counselor, and get specific, school-by-school feedback from real people — built to be simple for students and families.",
  openGraph: {
    title: "Gallatin Strategy Group",
    description:
      "College application review and counseling from real people — clear, school-specific feedback.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white font-sans text-zinc-900">
        {children}
      </body>
    </html>
  );
}
