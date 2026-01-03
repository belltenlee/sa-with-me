"use client";

import { motion } from "framer-motion";
import { getAssetPath } from "@/utils/basePath";

export default function WeddingInfo() {
    return (
        <section className="py-20 px-6 bg-[#F8F6F2] text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.6 }}
                    className="inline-block px-12 py-4 border border-[#EBC7C7] rounded-[50%] mb-12 bg-[#FFF5F5] shadow-[0_4px_15px_rgba(235,199,199,0.3)] relative group"
                >
                    <div className="absolute inset-0 rounded-[50%] border border-[#F4E2E2] scale-[1.1] pointer-events-none group-hover:scale-[1.15] transition-transform duration-500" />
                    <h2 className="font-paperlogy font-semibold text-2xl text-[#D99A9A] tracking-widest relative z-10">예식 안내</h2>
                </motion.div>

                <div className="space-y-12 max-w-md mx-auto">
                    {/* Photo Booth */}
                    <div className="space-y-4">
                        <div className="flex flex-col items-center mb-6">
                            <span className="font-playfair text-[10px] text-[#D99A9A]/60 tracking-[0.4em] uppercase mb-1">Memory Point</span>
                            <h3 className="font-paperlogy text-[#D99A9A] text-xl tracking-widest font-bold mb-2">포토부스</h3>
                            <div className="w-8 h-[1px] bg-[#EBC7C7]/50" />
                        </div>
                        <div className="rounded-lg overflow-hidden shadow-md mb-4">
                            <img
                                src={getAssetPath("/images/info/photobooth001.png")}
                                alt="포토부스"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                        <p className="font-pretendard text-charcoal leading-[1.8] tracking-tight break-keep">
                            예식 전 준비된 포토부스에서<br />
                            인생네컷 사진을 촬영하시고,<br />
                            소중한 축하 메시지를 남겨주세요
                            <span className="text-gold">❤️</span>
                        </p>
                        <div className="bg-gray-50 py-6 px-6 sm:px-12 rounded-lg space-y-3 text-sm font-pretendard">
                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                <span className="font-bold text-gray-600">운영 시간</span>
                                <span className="text-charcoal whitespace-nowrap">오후 4시 ~ 5시 30분</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-bold text-gray-600">장소</span>
                                <span className="text-charcoal whitespace-nowrap">1층 로비 방향 입구</span>
                            </div>
                        </div>
                    </div>

                    {/* Premium Buffet */}
                    <div className="space-y-4">
                        <div className="flex flex-col items-center mb-6">
                            <span className="font-playfair text-[10px] text-[#D99A9A]/60 tracking-[0.4em] uppercase mb-1">Dining Experience</span>
                            <h3 className="font-paperlogy text-[#D99A9A] text-xl tracking-widest font-bold mb-2">프리미엄 뷔페</h3>
                            <div className="w-8 h-[1px] bg-[#EBC7C7]/50" />
                        </div>
                        <div className="rounded-lg overflow-hidden shadow-md mb-4">
                            <img
                                src={getAssetPath("/images/info/banquet001.png")}
                                alt="프리미엄 뷔페"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                        {/* <p className="font-pretendard text-charcoal leading-[1.8] tracking-tight break-keep">
                            제철 식재료로 정성껏 준비한<br />
                            120여 가지 메뉴의 프리미엄 뷔페가<br />
                            다양한 주류와 함께 준비되어 있습니다.
                        </p> */}

                        <div className="bg-gray-50 py-6 px-6 sm:px-12 rounded-lg space-y-3 text-sm font-pretendard">
                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                <span className="font-bold text-gray-600">운영 시간</span>
                                <span className="text-charcoal whitespace-nowrap">오후 4시 30분 ~ 7시 30분</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-bold text-gray-600">장소</span>
                                <span className="text-charcoal whitespace-nowrap">1층 연회장</span>
                            </div>
                        </div>

                        <p className="font-pretendard text-xs text-gray-500 mt-4">
                            * 식권은 축의대에서 수령해 주시기 바랍니다.
                        </p>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
