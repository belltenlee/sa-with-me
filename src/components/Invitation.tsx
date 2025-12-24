"use client";

import { motion } from "framer-motion";
import DDayCounter from "./DDayCounter";
import { useState } from "react";
import InfoPopup from "./InfoPopup";

import { getAssetPath } from "@/utils/basePath";

export default function Invitation() {
    const [isBuffetPopupOpen, setIsBuffetPopupOpen] = useState(false);
    const [activeVideo, setActiveVideo] = useState<string | null>(null);

    const menuVideos = [
        { title: "한식", src: "/movies/banquet_001_korean.mp4" },
        { title: "양식", src: "/movies/banquet_002_western.mp4" },
        { title: "일식", src: "/movies/banquet_003_japanese.mp4" },
        { title: "중식", src: "/movies/banquet_004_chinese.mp4" },
        { title: "디저트", src: "/movies/banquet_005_desserts.mp4" },
    ];

    return (
        <section className="pt-20 px-6 text-center bg-white">
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
                        <span className="font-bold whitespace-nowrap">이종열</span>
                        <span className="text-gray-400 text-sm">·</span>
                        <span className="font-bold whitespace-nowrap">박성애</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-base sm:text-lg text-gray-500">
                        <span className="text-sm">이상규 · 남순자의 차남</span>
                        <span className="font-bold text-charcoal">종열</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-base sm:text-lg text-gray-500">
                        <span className="text-sm">박명하 · 장숙희의 장녀</span>
                        <span className="font-bold text-charcoal">성애</span>
                    </div>

                    <div className="mt-8 pt-4 border-b border-gray-100 w-2/3 mx-auto">
                        {/* <p className="text-lg sm:text-xl font-bold font-playfair mb-2 whitespace-nowrap">SA & JY</p> */}
                    </div>
                </div>
            </motion.div>

            <DDayCounter />

            <div className="pb-10">
                <button
                    onClick={() => setIsBuffetPopupOpen(true)}
                    className="text-gray-400 text-sm border-b border-gray-300 pb-0.5 hover:text-gold hover:border-gold transition-colors"
                >
                    식사 안내 보기
                </button>
            </div>

            <InfoPopup
                isOpen={isBuffetPopupOpen}
                onClose={() => {
                    setIsBuffetPopupOpen(false);
                    setActiveVideo(null);
                }}
                title="식사 안내"
                content={
                    <div className="space-y-6 text-center">
                        {/* Menu Video Buttons */}
                        <div className="flex flex-wrap justify-center gap-2 mb-4">
                            {menuVideos.map((video) => (
                                <button
                                    key={video.title}
                                    onClick={() => setActiveVideo(video.src)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-serif transition-colors ${activeVideo === video.src
                                        ? "bg-gold text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                >
                                    #{video.title}
                                </button>
                            ))}
                        </div>

                        {/* Video Player or Placeholder */}
                        <div className="bg-gray-100 rounded-lg overflow-hidden aspect-[9/16] max-h-[400px] mx-auto relative shadow-inner">
                            {activeVideo ? (
                                <video
                                    key={activeVideo}
                                    src={activeVideo}
                                    className="w-full h-full object-cover"
                                    controls
                                    autoPlay
                                    playsInline
                                    muted
                                />
                            ) : (
                                <div className="w-full h-full relative">
                                    <img
                                        src={getAssetPath("/images/banquet/banquet001.jpg")}
                                        alt="Premium Buffet"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                        <div className="bg-black/50 text-white px-4 py-2 rounded-full text-xs backdrop-blur-sm">
                                            상단 메뉴를 선택하여 영상 보기
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <h4 className="font-bold text-gold mb-2 text-lg">Premium Buffet</h4>
                            <p className="text-sm leading-relaxed">
                                엄선된 제철 식재료로 정성껏 준비한<br />
                                120여 가지의 프리미엄 뷔페가 준비되어 있습니다.
                            </p>
                        </div>
                        <div className="text-sm space-y-2">
                            <p><span className="font-bold">운영 시간:</span> 예식 30분 전 ~ 예식 후 2시간</p>
                            <p><span className="font-bold">위치:</span> 2층 연회장 (엘리베이터 이용)</p>
                        </div>
                        <div className="pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-400">
                                * 식권은 축의대에서 수령해 주시기 바랍니다.
                            </p>
                        </div>
                    </div>
                }
            />
        </section>
    );
}
