"use client";

import { motion } from "framer-motion";

export default function Calendar() {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    // 2026년 2월 1일은 일요일
    const dates = [
        1, 2, 3, 4, 5, 6, 7,
        8, 9, 10, 11, 12, 13, 14,
        15, 16, 17, 18, 19, 20, 21,
        22, 23, 24, 25, 26, 27, 28
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-[280px] mx-auto mb-10 p-6 bg-white border border-gray-100 rounded-lg shadow-sm"
        >
            <div className="text-center mb-6">
                <h3 className="font-playfair text-xl font-bold text-charcoal tracking-widest">
                    2026. 02.
                </h3>
            </div>

            <div className="grid grid-cols-7 gap-y-4 text-center text-sm font-pretendard">
                {/* 요일 헤더 */}
                {days.map((day, i) => (
                    <div key={day} className={`text-xs ${i === 0 ? 'text-red-400' : 'text-gray-400'}`}>
                        {day}
                    </div>
                ))}

                {/* 날짜 */}
                {dates.map((date) => (
                    <div
                        key={date}
                        className={`relative flex items-center justify-center z-10
                            ${date === 21 ? 'text-white' : ''}
                            ${(date - 1) % 7 === 0 ? 'text-red-400' : 'text-charcoal'}
                        `}
                    >
                        {date === 21 && (
                            <>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    transition={{
                                        delay: 0.5,
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 20
                                    }}
                                    viewport={{ once: true }}
                                    className="absolute bg-gold w-8 h-8 rounded-full -z-10 shadow-sm"
                                />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, rotate: -5 }}
                                    whileInView={{ opacity: 1, y: 0, rotate: 5 }}
                                    transition={{ delay: 1, duration: 0.5 }}
                                    viewport={{ once: true }}
                                    className="absolute bottom-full mb-2 right-[-4px] whitespace-nowrap z-20 pointer-events-none"
                                >
                                    <div className="bg-white border-2 border-gold/40 px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                                        <span className="text-[10px] sm:text-xs font-bold text-gold" style={{ fontFamily: 'cursive' }}>
                                            오후 5시
                                        </span>
                                        <motion.span
                                            animate={{ scale: [1, 1.3, 1] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                            className="text-[10px] text-pink-400"
                                        >
                                            ♥
                                        </motion.span>
                                    </div>
                                    <div className="absolute -bottom-1 right-3 w-2 h-2 bg-white border-r-2 border-b-2 border-gold/40 rotate-45 -z-10" />
                                </motion.div>
                            </>
                        )}
                        <span className="relative z-10 font-medium">{date}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
