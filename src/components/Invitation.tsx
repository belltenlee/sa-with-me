"use client";

import { motion } from "framer-motion";
import DDayCounter from "./DDayCounter";
import Calendar from "./Calendar";

export default function Invitation() {

    return (
        <section className="text-center bg-white">
            <div className="bg-paper-texture pt-20 pb-16 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="font-playfair text-gold text-3xl tracking-[0.1em] uppercase mb-12">
                        초대합니다
                    </h2>

                    <div className="font-serif text-charcoal leading-loose text-base sm:text-lg space-y-6 mb-16 max-w-md mx-auto break-keep">
                        <p>
                            서로의 비슷함에 설레어 시작된 인연으로<br />
                            서로의 다름까지 품으며<br />
                            함께 새로운 그림을 그려보려 합니다.
                        </p>
                        <p>
                            결혼이라는 하얀 캔버스 위에<br />
                            사랑과 배려로 행복을 그려나가겠습니다.
                        </p>
                        <p>
                            소중한 약속의 자리를 함께 축복해 주시면<br />
                            마음 깊이 간직하며 예쁘게 살겠습니다.
                        </p>
                    </div>

                    <div className="space-y-4 font-serif">
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-base sm:text-lg">
                            <span className="font-bold whitespace-nowrap">이상규</span>
                            <span className="text-gray-400 text-sm">·</span>
                            <span className="font-bold whitespace-nowrap">남순자</span>
                            <span className="text-gray-500 text-xs sm:text-sm whitespace-nowrap">의 차남</span>
                            <span className="font-bold whitespace-nowrap">이종열</span>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-base sm:text-lg">
                            <span className="font-bold whitespace-nowrap">박명하</span>
                            <span className="text-gray-400 text-sm">·</span>
                            <span className="font-bold whitespace-nowrap">장숙희</span>
                            <span className="text-gray-500 text-xs sm:text-sm whitespace-nowrap">의 장녀</span>
                            <span className="font-bold whitespace-nowrap">박성애</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="mt-16 px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.6 }}
                    className="inline-block px-9 py-6 border border-[#EBC7C7] rounded-[50%] mb-12 bg-[#FFF5F5] shadow-[0_4px_15px_rgba(235,199,199,0.3)] relative group"
                >
                    <div className="absolute inset-0 rounded-[50%] border border-[#F4E2E2] scale-[1.1] pointer-events-none group-hover:scale-[1.15] transition-transform duration-500" />
                    <h2 className="font-paperlogy font-semibold text-2xl text-[#D99A9A] tracking-widest relative z-10">Wedding day</h2>
                </motion.div>
                <Calendar />
                <DDayCounter />
            </div>
        </section>
    );
}
