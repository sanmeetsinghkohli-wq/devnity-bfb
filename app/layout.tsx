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
  description: "Voice-first AI assistant for Indian government schemes & services",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏛️</text></svg>",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dm.variable} ${tiro.variable}`}>
      <body className="bg-background text-foreground antialiased">
        {children}
        <AccessibilityFab />
      </body>
    </html>
  );
}
