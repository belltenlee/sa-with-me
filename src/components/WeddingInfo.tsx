"use client";

import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useState, useEffect } from "react";
import { getAssetPath } from "@/utils/basePath";

export default function WeddingInfo() {
    const [isMainModalOpen, setIsMainModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'photobooth' | 'buffet'>('photobooth');

    useEffect(() => {
        if (isMainModalOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.overscrollBehavior = 'none';
        } else {
            document.body.style.overflow = 'unset';
            document.body.style.overscrollBehavior = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.overscrollBehavior = 'unset';
        };
    }, [isMainModalOpen]);

    return (
        <section className="py-24 px-6 bg-[#F8F6F2] text-center">
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
                    className="inline-block px-10 py-4 border border-[#EBC7C7] rounded-[50%] mb-16 bg-[#FFF5F5] shadow-[0_4px_15px_rgba(235,199,199,0.3)]"
                >
                    <h2 className="font-paperlogy font-semibold text-2xl text-[#D99A9A] tracking-widest">예식 안내</h2>
                </motion.div>

                <div className="space-y-20 max-w-md mx-auto">
                    {/* Photo Booth */}
                    <div className="space-y-6">
                        <div className="flex flex-col items-center mb-8">
                            <span className="font-playfair text-[10px] text-[#D99A9A]/60 tracking-[0.4em] uppercase mb-1">Memory Point</span>
                            <h3 className="font-paperlogy text-[#D99A9A] text-xl tracking-widest font-bold mb-2">포토부스</h3>
                            <div className="w-8 h-[1px] bg-[#EBC7C7]/50" />
                        </div>
                        <div className="rounded-2xl overflow-hidden shadow-lg mb-6 bg-white p-2 transform transition-transform hover:scale-[1.02] duration-500">
                            <img
                                src={getAssetPath("/images/info/photobooth_v3.png")}
                                alt="포토부스 샘플"
                                className="w-full h-auto object-cover rounded-xl"
                            />
                        </div>
                        <p className="font-pretendard text-charcoal/80 leading-[1.8] tracking-tight break-keep text-sm sm:text-base">
                            예식 전 준비된 포토부스에서<br />
                            인생네컷 사진을 촬영하시고,<br />
                            소중한 축하 메시지를 남겨주세요
                            <span className="text-pink-400 ml-1">♥</span>
                        </p>
                        <div className="bg-white/60 backdrop-blur-sm border border-[#EBC7C7]/20 py-6 px-8 rounded-2xl space-y-3 text-sm font-pretendard shadow-sm">
                            <div className="flex justify-between items-center border-b border-[#EBC7C7]/10 pb-3">
                                <span className="text-[#D99A9A] font-semibold">운영 시간</span>
                                <span className="text-charcoal font-medium">오후 4시 ~ 5시 30분</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[#D99A9A] font-semibold">장소</span>
                                <span className="text-charcoal font-medium">1층 로비 방향 입구</span>
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
                        <div className="rounded-lg overflow-hidden shadow-md mb-4 bg-white p-2">
                            <img
                                src={getAssetPath("/images/info/banquet001.png")}
                                alt="프리미엄 뷔페"
                                className="w-full h-auto object-cover rounded-sm"
                            />
                        </div>

                        <div className="bg-white/70 border border-[#EBC7C7]/20 py-7 px-6 sm:px-10 rounded-2xl space-y-4 text-sm font-pretendard shadow-[0_4px_12px_rgba(235,199,199,0.1)]">
                            <div className="flex justify-between items-center border-b border-[#EBC7C7]/10 pb-3">
                                <span className="text-[#D99A9A] font-semibold tracking-tight">운영 시간</span>
                                <span className="text-charcoal font-medium">오후 4시 30분 ~ 7시 30분</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[#D99A9A] font-semibold tracking-tight">장소</span>
                                <span className="text-charcoal font-medium">1층 연회장</span>
                            </div>
                        </div>

                        <p className="font-pretendard text-xs text-gray-500 mt-4">
                            * 식권은 축의대에서 수령해 주시기 바랍니다.
                        </p>
                    </div>

                    {/* Wedding Details Card (Trigger) */}
                    <div className="border-t border-[#EBC7C7]/30 pt-16 space-y-8">
                        <div className="flex flex-col items-center mb-4">
                            <span className="font-playfair text-[10px] text-[#D99A9A]/60 tracking-[0.4em] uppercase mb-1">Wedding Information</span>
                            <h3 className="font-paperlogy text-[#D99A9A] text-xl tracking-widest font-bold mb-2">예식 상세 안내</h3>
                            <div className="w-8 h-[1px] bg-[#EBC7C7]/50" />
                        </div>

                        <div className="group relative bg-white rounded-[3rem] p-1 shadow-[0_20px_60px_rgba(235,199,199,0.15)] overflow-hidden">
                            <div className="bg-gradient-to-b from-[#FFFDFD] via-[#FFF9F9] to-[#FFF5F5] rounded-[2.8rem] p-8 sm:p-12 border border-[#FDF2F2] relative overflow-hidden">
                                {/* Decorative background elements */}
                                <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#D99A9A]/5 rounded-full blur-3xl" />
                                <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-[#EBC7C7]/10 rounded-full blur-3xl" />
                                <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none"
                                    style={{ backgroundImage: `radial-gradient(#D99A9A 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />

                                <div className="relative z-10 flex flex-col items-center">
                                    {/* Premium Icon Container */}
                                    <div className="relative mb-10">
                                        <div className="absolute inset-0 bg-[#D99A9A]/10 rounded-full scale-[1.8] blur-2xl animate-pulse" />
                                        <div className="relative flex -space-x-3">
                                            <div className="w-16 h-16 rounded-2xl bg-white/80 backdrop-blur-md shadow-[0_8px_20px_rgba(217,154,154,0.15)] border border-white flex items-center justify-center text-[#D99A9A] transform -rotate-6 group-hover:rotate-0 transition-transform duration-500">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <div className="w-16 h-16 rounded-2xl bg-white/80 backdrop-blur-md shadow-[0_8px_20px_rgba(217,154,154,0.15)] border border-white flex items-center justify-center text-[#D99A9A] transform rotate-6 group-hover:rotate-0 transition-transform duration-500">
                                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center mb-10">
                                        <h4 className="font-paperlogy text-charcoal text-xl font-bold mb-3 tracking-tight break-keep">포토부스 & 연회장 안내</h4>
                                        <p className="font-pretendard text-[#D99A9A]/70 text-[10px] tracking-[0.2em] uppercase font-medium">Photobooth & Dining</p>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setActiveTab('photobooth');
                                            setIsMainModalOpen(true);
                                        }}
                                        className="group/btn relative px-8 sm:px-10 py-4 bg-white border border-[#EBC7C7] text-[#D99A9A] rounded-full font-pretendard text-sm font-bold transition-all duration-500 hover:bg-[#D99A9A] hover:text-white hover:border-[#D99A9A] hover:shadow-[0_15px_30px_rgba(217,154,154,0.3)] active:scale-95 flex items-center gap-3 overflow-hidden whitespace-nowrap"
                                    >
                                        <span className="relative z-10">상세 정보 확인하기</span>
                                        <div className="relative z-10 w-6 h-6 rounded-full bg-[#D99A9A]/10 group-hover/btn:bg-white/20 flex items-center justify-center transition-colors">
                                            <svg className="w-3.5 h-3.5 transition-transform duration-500 group-hover/btn:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                        {/* Shine effect on hover */}
                                        <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/btn:left-full transition-all duration-1000 ease-in-out" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* All-in-one Tabbed Modal */}
            <AnimatePresence>
                {isMainModalOpen && (
                    <motion.div
                        key="wedding-info-modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] grid place-items-center p-6 bg-black/80 backdrop-blur-md overscroll-none touch-none"
                        onClick={() => setIsMainModalOpen(false)}
                    >
                        <motion.div
                            key="wedding-info-modal-content"
                            initial={{ scale: 0.9, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 30 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md h-[680px] overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <LayoutGroup id="wedding-info-tabs">
                                {/* Tab Header */}
                                <div className="flex border-b border-gray-100">
                                    <button
                                        onClick={() => setActiveTab('photobooth')}
                                        className={`flex-1 py-4 font-pretendard text-sm font-bold transition-all relative ${activeTab === 'photobooth' ? 'text-[#D99A9A]' : 'text-gray-400'}`}
                                    >
                                        포토부스
                                        {activeTab === 'photobooth' && (
                                            <motion.div
                                                layoutId="wedding-info-tab-indicator"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D99A9A]"
                                            />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('buffet')}
                                        className={`flex-1 py-4 font-pretendard text-sm font-bold transition-all relative ${activeTab === 'buffet' ? 'text-[#D99A9A]' : 'text-gray-400'}`}
                                    >
                                        연회장
                                        {activeTab === 'buffet' && (
                                            <motion.div
                                                layoutId="wedding-info-tab-indicator"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D99A9A]"
                                            />
                                        )}
                                    </button>
                                </div>

                                {/* Modal Content (Scrollable) */}
                                <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide relative overscroll-contain touch-pan-y">
                                    <AnimatePresence>
                                        {activeTab === 'photobooth' ? (
                                            <motion.div
                                                key="photobooth"
                                                drag="x"
                                                dragConstraints={{ left: 0, right: 0 }}
                                                dragElastic={0.2}
                                                onDragEnd={(e, info) => {
                                                    if (info.offset.x < -50) setActiveTab('buffet');
                                                }}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20, position: 'absolute', width: '100%' }}
                                                transition={{ duration: 0.15, ease: "easeOut" }}
                                                className="p-1.5 w-full cursor-grab active:cursor-grabbing"
                                            >
                                                <div className="relative mb-5 mt-1">
                                                    <img
                                                        src={getAssetPath("/images/info/photobooth_v3.png")}
                                                        alt="포토부스"
                                                        className="w-[82%] aspect-[0.9] object-cover rounded-[1.8rem] mx-auto"
                                                    />
                                                </div>
                                                <div className="px-5 pb-2 text-left">
                                                    <h4 className="font-pretendard text-lg text-charcoal font-bold mb-3 ml-1">포토부스 안내</h4>
                                                    <p className="font-pretendard text-gray-500 text-[13px] leading-relaxed mb-5 break-keep ml-1">
                                                        예식 전 준비된 포토부스에서 인생네컷 사진을 촬영하시고, 소중한 축하 메시지를 남겨주세요
                                                        <span className="text-pink-400 ml-1">♥</span>
                                                    </p>
                                                    <div className="space-y-2.5 font-pretendard bg-[#FFF5F5]/50 p-4 rounded-2xl border border-[#EBC7C7]/20">
                                                        <div className="flex justify-between items-center text-[13px]">
                                                            <span className="text-[#D99A9A] font-semibold">운영 시간</span>
                                                            <span className="text-charcoal">오후 4시 ~ 5시 30분</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-[13px]">
                                                            <span className="text-[#D99A9A] font-semibold">장소</span>
                                                            <span className="text-charcoal">1층 로비 입구</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="buffet"
                                                drag="x"
                                                dragConstraints={{ left: 0, right: 0 }}
                                                dragElastic={0.2}
                                                onDragEnd={(e, info) => {
                                                    if (info.offset.x > 50) setActiveTab('photobooth');
                                                }}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20, position: 'absolute', width: '100%' }}
                                                transition={{ duration: 0.15, ease: "easeOut" }}
                                                className="p-1.5 w-full cursor-grab active:cursor-grabbing"
                                            >
                                                <div className="relative mb-5 mt-1">
                                                    <img
                                                        src={getAssetPath("/images/info/banquet001.png")}
                                                        alt="연회장"
                                                        className="w-[82%] aspect-[0.9] object-cover rounded-[1.8rem] mx-auto"
                                                    />
                                                </div>
                                                <div className="px-5 pb-2 text-left">
                                                    <h4 className="font-pretendard text-lg text-charcoal font-bold mb-3 ml-1">연회장 안내</h4>
                                                    <p className="font-pretendard text-gray-500 text-[13px] leading-relaxed mb-5 break-keep ml-1">
                                                        신선한 제철 식재료로 정성껏 준비한 프리미엄 뷔페가 마련되어 있습니다.
                                                    </p>
                                                    <div className="space-y-2.5 font-pretendard bg-[#FFF5F5]/50 p-4 rounded-2xl border border-[#EBC7C7]/20">
                                                        <div className="flex justify-between items-center text-[13px]">
                                                            <span className="text-[#D99A9A] font-semibold">운영 시간</span>
                                                            <span className="text-charcoal">오후 4시 30분 ~ 7시 30분</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-[13px]">
                                                            <span className="text-[#D99A9A] font-semibold">장소</span>
                                                            <span className="text-charcoal">1층 연회장</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </LayoutGroup>

                            {/* Close Button */}
                            <div className="px-6 pb-6 pt-2 border-t border-gray-50">
                                <button
                                    onClick={() => setIsMainModalOpen(false)}
                                    className="w-full py-4 bg-charcoal text-white rounded-2xl font-pretendard text-sm font-bold hover:bg-black transition-colors"
                                >
                                    닫기
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
