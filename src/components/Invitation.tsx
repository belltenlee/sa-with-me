"use client";

import { motion } from "framer-motion";

export default function Invitation() {
    return (
        <section className="pt-20 pb-10 px-6 text-center bg-white">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                <h2 className="font-playfair text-gold text-3xl tracking-[0.1em] uppercase mb-12">
                    초대합니다
                </h2>

                <div className="font-serif text-charcoal leading-loose text-base sm:text-lg space-y-6 mb-16 max-w-md mx-auto">
                    <p>
                        따스한 햇살 아래 만난 두 사람이<br />
                        작은 나무를 심으려 합니다.
                    </p>
                    <p>
                        사랑과 믿음으로 시작하는<br />
                        저희의 앞날을 지켜봐 주시길 바랍니다.
                    </p>
                    <p>
                        귀한 걸음 하시어 축복해 주시면<br />
                        더없는 기쁨이 되겠습니다.
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
                    {/* Simplified for demo, can be dynamic */}

                    <div className="mt-8 pt-4 border-b border-gray-100 w-2/3 mx-auto">
                        {/* <p className="text-lg sm:text-xl font-bold font-playfair mb-2 whitespace-nowrap">SA & JY</p> */}
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
