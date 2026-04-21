import type { Metadata } from "next";
import { Cormorant_Garamond } from "next/font/google";
import ClickHearts from "@/components/ClickHearts";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "cyrillic"],
  weight: ["300", "400", "500", "600", "700"],
});

const siteTitle = "Мария и Калоян | Сватбена покана";
const siteDescription =
  "С радост Ви каним да отпразнуваме любовта си заедно на 26.06.2026.";

export const metadata: Metadata = {
  title: siteTitle,
  description: siteDescription,
  icons: {
    icon: [{ url: "/icons/hearts.svg", type: "image/svg+xml" }],
    shortcut: "/icons/hearts.svg",
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
    locale: "bg_BG",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg" className={`${cormorant.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ClickHearts />
        {children}
      </body>
    </html>
  );
}
