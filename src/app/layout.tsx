import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Rom Com Sundays",
  description: "A curated collection of romantic comedies, rated and reviewed every Sunday.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Damion&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-inter bg-white text-text-primary`}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
