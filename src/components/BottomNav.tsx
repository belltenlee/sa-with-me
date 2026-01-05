'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function BottomNav() {
    const [isVisible, setIsVisible] = useState(false);
    const [activeSection, setActiveSection] = useState<string | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            // Show nav after Hero section images (approx 3.1 * viewport height)
            const threshold = window.innerHeight * 3.6;
            if (window.scrollY > threshold) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }

            // Track active section
            const mapSection = document.getElementById('map-section');
            const rsvpSection = document.getElementById('rsvp-section');

            let currentActive: string | null = null;

            const sections = [
                { id: 'rsvp', element: rsvpSection },
                { id: 'map', element: mapSection }
            ];

            for (const section of sections) {
                if (section.element) {
                    const rect = section.element.getBoundingClientRect();
                    // If the section occupies the middle part of the screen
                    if (rect.top < window.innerHeight * 0.6 && rect.bottom > window.innerHeight * 0.4) {
                        currentActive = section.id;
                        break;
                    }
                }
            }
            setActiveSection(currentActive);
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check initial scroll position
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Simple share handler (using native share or copy url)
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: '이종열 ❤️ 박성애 결혼합니다',
                    text: '2026년 2월 21일 토요일 오후 5시 라시따시어터',
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Share canceled');
            }
        } else {
            // Fallback: Copy to clipboard
            try {
                await navigator.clipboard.writeText(window.location.href);
                toast.success('주소가 복사되었습니다 ✨');
            } catch (err) {
                console.error('Failed to copy');
                toast.error('주소 복사에 실패했습니다.');
            }
        }
    };

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: isVisible ? 0 : 100, opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
        >
            <div className="bg-white/80 backdrop-blur-md border border-white/40 shadow-lg rounded-full px-6 py-3 flex items-center gap-6 pointer-events-auto">
                <button
                    onClick={scrollToTop}
                    className="flex flex-col items-center gap-1 text-gray-500 hover:text-gold transition-colors"
                >
                    {/* Top Icon */}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    <span className="text-[10px] font-pretendard">맨위로</span>
                </button>

                <div className="w-[1px] h-8 bg-gray-200" />

                <button
                    onClick={() => scrollToSection('map-section')}
                    className={`flex flex-col items-center gap-1 transition-colors ${activeSection === 'map' ? 'text-gold' : 'text-gray-500 hover:text-gold'}`}
                >
                    {/* Map Icon */}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-[10px] font-pretendard">오시는길</span>
                </button>

                <button
                    onClick={() => scrollToSection('rsvp-section')}
                    className={`flex flex-col items-center gap-1 transition-colors ${activeSection === 'rsvp' ? 'text-gold' : 'text-gray-500 hover:text-gold'}`}
                >
                    {/* Envelope Icon */}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[10px] font-pretendard">참석의사</span>
                </button>

                <div className="w-[1px] h-8 bg-gray-200" />

                <button
                    onClick={handleShare}
                    className="flex flex-col items-center gap-1 text-gray-500 hover:text-gold transition-colors"
                >
                    {/* Share Icon */}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span className="text-[10px] font-pretendard">공유하기</span>
                </button>
            </div>
        </motion.div>
    );
}
