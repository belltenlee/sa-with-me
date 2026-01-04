"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { submitRsvp, checkExistingRsvp, updateRsvp } from "@/services/rsvp";

interface RsvpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function RsvpModal({ isOpen, onClose }: RsvpModalProps) {
    const [name, setName] = useState("");
    const [attendeeCount, setAttendeeCount] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [existingRsvp, setExistingRsvp] = useState<{ id: string, name: string, attendeeCount: number } | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const savedName = localStorage.getItem("uploaderName");
            if (savedName) setName(savedName);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setShowConfirm(false);
            setExistingRsvp(null);
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSubmitting(true);
        setError("");

        try {
            const existing = await checkExistingRsvp(name);
            if (existing) {
                setExistingRsvp(existing as any);
                setShowConfirm(true);
                setIsSubmitting(false);
                return;
            }

            await submitRsvp(name, attendeeCount);
            handleSuccess();
        } catch (err: any) {
            setError(err.message || "오류가 발생했습니다.");
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!existingRsvp) return;
        setIsSubmitting(true);
        try {
            await updateRsvp(existingRsvp.id, attendeeCount);
            handleSuccess();
        } catch (err: any) {
            setError(err.message || "오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
            setShowConfirm(false);
        }
    };

    const handleSuccess = () => {
        localStorage.setItem("uploaderName", name);
        localStorage.setItem("hasSubmittedRsvp", "true");
        alert("참석 여부가 전달되었습니다. 감사합니다!");
        onClose();
        setName("");
        setAttendeeCount(1);
        setExistingRsvp(null);
        setShowConfirm(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-100 text-center relative">
                            <h3 className="font-pretendard text-xl text-charcoal font-bold">참석 의사 전달</h3>
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-gray-400 hover:text-charcoal transition-colors p-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {!showConfirm ? (
                            <>
                                {/* <div className="p-5 border-b border-gray-100 text-center relative">
                                    <h2 className="font-pretendard text-sm text-gray-600">원활한 식사 준비를 위해 참석 여부를 알려주세요.</h2>
                                </div> */}
                                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-sm font-pretendard text-gray-600 mb-1">성함</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="성함을 입력해주세요"
                                            className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-gold transition-colors font-pretendard"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-pretendard text-gray-600 mb-1">참석 인원 (본인 포함)</label>
                                        {/* //수평정렬 class 추가 */}
                                        <div className="flex items-center gap-4 space-y-2">
                                            <button
                                                type="button"
                                                onClick={() => setAttendeeCount(Math.max(1, attendeeCount - 1))}
                                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-gold hover:text-gold mt-2"
                                            >
                                                -
                                            </button>
                                            <span className="font-pretendard text-lg w-8 text-center pt-0.5">{attendeeCount}</span>
                                            <button
                                                type="button"
                                                onClick={() => setAttendeeCount(attendeeCount + 1)}
                                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-gold hover:text-gold"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    {error && <p className="text-red-500 text-xs text-center">{error}</p>}

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-charcoal text-white py-3 rounded-lg hover:bg-gold transition-colors font-pretendard mt-4 disabled:opacity-50"
                                    >
                                        {isSubmitting ? "전송 중..." : "참석 의사 보내기"}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="p-8 text-center space-y-6">
                                <p className="font-pretendard text-gray-700 leading-relaxed">
                                    이미 입력된 성함입니다.<br />
                                    입력하신 내용으로 수정하시겠습니까?
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 py-3 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors font-pretendard"
                                    >
                                        아니오
                                    </button>
                                    <button
                                        onClick={handleUpdate}
                                        disabled={isSubmitting}
                                        className="flex-1 py-3 bg-charcoal text-white rounded-lg hover:bg-gold transition-colors font-pretendard disabled:opacity-50"
                                    >
                                        {isSubmitting ? "수정 중..." : "예"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
