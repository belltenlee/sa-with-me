import type { Metadata } from "next";
import { Noto_Serif_KR, Playfair_Display } from "next/font/google";
import "./globals.css";

const notoSerifKr = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "900"],
  variable: "--font-noto-serif",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Sungae & Joneyeol's Wedding",
  description: "We invite you to our wedding.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={`${notoSerifKr.variable} ${playfair.variable}`}>
      <body className="font-serif bg-cream text-charcoal antialiased">
        <main className="min-h-screen w-full max-w-md mx-auto bg-white shadow-2xl relative overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
