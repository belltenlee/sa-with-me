import type { Metadata } from "next";
import { Noto_Serif_KR, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BottomNav from "@/components/BottomNav";
import KakaoRedirect from "@/components/KakaoRedirect";

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
  title: "이종열 ❤️ 박성애 결혼합니다",
  description: "2026년 2월 21일 토요일 오후 5시 라시따시어터",
  openGraph: {
    title: "이종열 ❤️ 박성애 결혼합니다",
    description: "2026년 2월 21일 토요일 오후 5시 라시따시어터",
    url: "https://sa-with-me.vercel.app", // Assuming Vercel deployment or similar
    siteName: "이종열 & 박성애 모바일 청첩장",
    images: [
      {
        url: "/images/gallery/G01.jpg", // Next.js will resolve this relative to metadataBase
        width: 800,
        height: 600,
        alt: "Wedding Couple",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "이종열 ❤️ 박성애 결혼합니다",
    description: "2026년 2월 21일 토요일 오후 5시 라시따시어터",
    images: ["/images/gallery/G01.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={`${notoSerifKr.variable} ${playfair.variable} snap-y snap-proximity scroll-smooth`}>
      <body className="font-serif bg-cream text-charcoal antialiased">
        <main className="min-h-screen w-full max-w-md mx-auto bg-white shadow-2xl relative">
          <KakaoRedirect />
          {children}
        </main>
        <ToastContainer
          position="bottom-center"
          autoClose={2000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover={false}
          theme="light"
          toastClassName="font-pretendard text-sm rounded-full shadow-lg m-4"
        />
        <BottomNav />
      </body>
    </html>
  );
}
