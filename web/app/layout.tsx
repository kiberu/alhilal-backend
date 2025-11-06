import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Al-Hilal | Ramadhan Umrah - Spiritual Journey to Makkah",
  description: "Join fellow believers for a spiritually fulfilling Umrah in the last 15 nights of Ramadhan. Grand Ramadhan Umrah packages at special rates.",
  keywords: ["Umrah", "Ramadhan", "Makkah", "Hajj", "Islamic Travel", "Al-Hilal"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
