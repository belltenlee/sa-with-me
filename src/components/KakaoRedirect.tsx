"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function KakaoRedirect() {
    const [isKakao, setIsKakao] = useState(false);

    useEffect(() => {
        const userAgent = navigator.userAgent.toLowerCase();

        if (userAgent.includes("kakaotalk")) {
            setIsKakao(true);
            const currentUrl = window.location.href;

            // 외부 브라우저로 강제 이동 시도
            window.location.href = `kakaotalk://web/openExternalApp?url=${encodeURIComponent(currentUrl)}`;

            // 만약 자동으로 안 넘어갈 경우를 대비해 1.5초 뒤에 한 번 더 시도하거나 안내 유지
            const timer = setTimeout(() => {
                window.location.href = `kakaotalk://web/openExternalApp?url=${encodeURIComponent(currentUrl)}`;
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, []);

    if (!isKakao) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-[9999] bg-white/90 backdrop-blur-xl flex flex-col items-center justify-center px-8 text-center"
            >
                <div className="space-y-8 max-w-xs">
                    {/* Premium Icon/Animation Placeholder */}
                    <div className="relative w-24 h-24 mx-auto">
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="w-full h-full bg-[#EBC7C7]/20 rounded-full flex items-center justify-center"
                        >
                            <svg className="w-12 h-12 text-[#D99A9A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                        </motion.div>
                        <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 bg-[#EBC7C7] rounded-full -z-10"
                        />
                    </div>

                    <div className="space-y-4">
                        <h2 className="font-playfair text-2xl text-charcoal font-bold tracking-tight">
                            브라우저 이동 중
                        </h2>
                        <p className="font-pretendard text-gray-500 text-sm leading-relaxed break-keep">
                            더욱 쾌적한 관람을 위해<br />
                            <span className="text-[#D99A9A] font-semibold">외부 브라우저(Safari, Chrome 등)</span>로<br />
                            자동 연결하고 있습니다.
                        </p>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={() => {
                                window.location.href = `kakaotalk://web/openExternalApp?url=${encodeURIComponent(window.location.href)}`;
                            }}
                            className="w-full py-4 bg-[#D99A9A] text-white rounded-2xl font-pretendard text-sm font-bold shadow-lg shadow-[#D99A9A]/20 active:scale-95 transition-transform"
                        >
                            자동으로 연결되지 않나요?
                        </button>
                        <p className="mt-4 text-[11px] text-gray-400 font-pretendard">
                            잠시만 기다려 주시면 곧 이동합니다.
                        </p>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
