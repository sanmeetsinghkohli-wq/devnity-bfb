import type { Metadata } from "next";
import { DM_Sans, Tiro_Devanagari_Hindi } from "next/font/google";
import "./globals.css";
import AccessibilityFab from "@/components/AccessibilityFab";

const dm = DM_Sans({ subsets: ["latin"], variable: "--font-dm", display: "swap" });
const tiro = Tiro_Devanagari_Hindi({
  subsets: ["devanagari"],
  weight: "400",
  variable: "--font-tiro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SarkarSathi | सरकार साथी",
  description: "Official Voice AI assistant for Indian government schemes & services",
  manifest: "/manifest.json",
  themeColor: "#FF9933",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi" className={`${dm.variable} ${tiro.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="bg-background text-[#020617] antialiased">
        {children}
        <AccessibilityFab />
      </body>
    </html>
  );
}
