"use client";

import { motion } from "framer-motion";
import { getAssetPath } from "@/utils/basePath";

export default function WeddingInfo() {
    return (
        <section className="py-12 px-6 bg-white text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                <h2 className="font-playfair text-3xl text-gold mb-12">예식 안내</h2>

                <div className="space-y-12 max-w-md mx-auto">
                    {/* Photo Booth */}
                    <div className="space-y-4">
                        <h3 className="font-serif text-gold text-xl">포토 부스</h3>
                        <div className="rounded-lg overflow-hidden shadow-md mb-4">
                            <img
                                src={getAssetPath("/images/info/photobooth001.png")}
                                alt="포토 부스"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                        <p className="font-serif text-charcoal leading-relaxed">
                            예식 전 준비된 포토 부스에서<br />
                            인생네컷 사진을 촬영하시고,<br />
                            소중한 축하 메시지를 남겨주세요
                            <span className="text-gold">❤️</span>
                        </p>
                        <div className="bg-gray-50 py-6 px-12 rounded-lg space-y-3 text-sm font-serif">
                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                <span className="font-bold text-gray-600">운영 시간</span>
                                <span className="text-charcoal">오후 4시 ~ 5시 30분</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-bold text-gray-600">장소</span>
                                <span className="text-charcoal">1층 로비 방향 입구</span>
                            </div>
                        </div>
                    </div>

                    {/* Premium Buffet */}
                    <div className="space-y-4">
                        <h3 className="font-serif text-gold text-xl">프리미엄 뷔페</h3>
                        <div className="rounded-lg overflow-hidden shadow-md mb-4">
                            <img
                                src={getAssetPath("/images/info/banquet001.png")}
                                alt="프리미엄 뷔페"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                        <p className="font-serif text-charcoal leading-relaxed ">
                            제철 식재료로 정성껏 준비한<br />
                            120여 가지 메뉴의 프리미엄 뷔페가<br />
                            다양한 주류와 함께 준비되어 있습니다.
                        </p>

                        <div className="bg-gray-50 py-6 px-12 rounded-lg space-y-3 text-sm font-serif">
                            <div className="flex justify-between border-b border-gray-200 pb-2">
                                <span className="font-bold text-gray-600">운영 시간</span>
                                <span className="text-charcoal">오후 4시 30분 ~ 7시 30분</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-bold text-gray-600">장소</span>
                                <span className="text-charcoal">1층 연회장</span>
                            </div>
                        </div>

                        <p className="text-xs text-gray-400 mt-4">
                            * 식권은 축의대에서 수령해 주시기 바랍니다.
                        </p>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
