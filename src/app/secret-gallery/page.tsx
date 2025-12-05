"use client";

import SharedGallery from "@/components/SharedGallery";
import Link from "next/link";

export default function SecretGalleryPage() {
    return (
        <div className="flex flex-col min-h-screen bg-cream">
            <header className="p-4 bg-white/80 backdrop-blur-sm sticky top-0 z-20 border-b border-gray-100">
                <div className="max-w-md mx-auto flex items-center justify-between">
                    <Link href="/" className="text-charcoal hover:text-gold transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </Link>
                    <h1 className="font-playfair text-lg text-charcoal">Our Pre-wedding Moments</h1>
                    <div className="w-6" /> {/* Spacer for centering */}
                </div>
            </header>

            <main className="flex-1 max-w-md mx-auto w-full bg-white shadow-xl">
                <SharedGallery
                    collectionName="secret_gallery_photos"
                    title="청첩장 모임의 추억을 여기에 남겨주세요."
                />
            </main>
        </div>
    );
}
