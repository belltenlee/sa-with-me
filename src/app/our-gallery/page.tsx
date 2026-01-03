"use client";

import SharedGallery from "@/components/SharedGallery";
import { useRouter } from "next/navigation";

export default function OurGalleryPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-cream">
            <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl flex flex-col">
                <header className="p-6 flex items-center justify-between bg-white sticky top-0 z-10 border-b border-gray-100">
                    <button onClick={() => router.back()} className="text-charcoal hover:text-gold transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>
                    <h1 className="font-playfair text-xl text-charcoal">Our Wedding Moments</h1>
                    <div className="w-6" /> {/* Spacer for centering */}
                </header>

                <main className="flex-1">
                    <SharedGallery />
                </main>

                <footer className="py-8 text-center text-gray-400 text-sm font-pretendard border-t border-gray-100">
                    <p>© 2026 성애 & 종열. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
}
