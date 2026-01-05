"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function KakaoRedirect() {
    const [isKakao, setIsKakao] = useState(false);

    useEffect(() => {
        const userAgent = navigator.userAgent.toLowerCase();
        const isKakaoTalk = userAgent.includes("kakaotalk");
        const isAndroid = /android/i.test(userAgent);

        if (isKakaoTalk) {
            setIsKakao(true);
            const currentUrl = window.location.href;

            // KakaoTalk outlink scheme - This typically opens the system's default browser
            const outlinkUrl = `kakaotalk://web/openExternalApp?url=${encodeURIComponent(currentUrl)}`;

            const triggerRedirect = () => {
                // Standard outlink scheme (most compatible for "default browser")
                window.location.href = outlinkUrl;

                // Method 2: Create a hidden link and click it (backup)
                const a = document.createElement('a');
                a.href = outlinkUrl;
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                setTimeout(() => document.body.removeChild(a), 100);
            };

            // First attempt after 600ms
            const timer1 = setTimeout(triggerRedirect, 600);
            // Second attempt after 2500ms
            const timer2 = setTimeout(triggerRedirect, 2500);

            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
            };
        }
    }, []);

    if (!isKakao) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-[9999] bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center px-8 text-center"
            >
                <div className="space-y-10 max-w-xs w-full">
                    {/* Premium Animation */}
                    <div className="relative w-28 h-28 mx-auto">
                        <motion.div
                            animate={{
                                scale: [1, 1.05, 1],
                                rotate: [0, 90, 180, 270, 360]
                            }}
                            transition={{
                                duration: 8,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="w-full h-full border-2 border-dashed border-[#EBC7C7] rounded-full"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <motion.div
                                animate={{
                                    y: [0, -8, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="text-[#D99A9A]"
                            >
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </motion.div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="font-paperlogy text-2xl text-charcoal font-bold tracking-tight">
                            브라우저 이동 중
                        </h2>
                        <p className="font-pretendard text-charcoal/60 text-[13px] leading-relaxed break-keep">
                            더욱 편리한 관람을 위해<br />
                            사용자님의 <span className="text-[#D99A9A] font-semibold">기본 브라우저</span>로<br />
                            자동 연결하고 있습니다.
                        </p>
                    </div>

                    <div className="pt-6 space-y-4">
                        <motion.button
                            initial={{ scale: 1 }}
                            animate={{
                                scale: [1, 1.02, 1],
                                boxShadow: ["0 10px 20px rgba(217, 154, 154, 0.1)", "0 15px 30px rgba(217, 154, 154, 0.3)", "0 10px 20px rgba(217, 154, 154, 0.1)"]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            onClick={() => {
                                window.location.href = `kakaotalk://web/openExternalApp?url=${encodeURIComponent(window.location.href)}`;
                            }}
                            className="w-full py-4 bg-[#D99A9A] text-white rounded-2xl font-pretendard text-sm font-bold flex items-center justify-center gap-2 group transition-all"
                        >
                            <span>직접 외부 브라우저 열기</span>
                            <svg className="w-4 h-4 transform group-active:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </motion.button>

                        <div className="flex flex-col gap-1.5">
                            <p className="text-[11px] text-gray-400 font-pretendard">
                                연결이 늦어지면 위 버튼을 눌러주세요.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
