"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { submitRsvp } from "@/services/rsvp";

interface RsvpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function RsvpModal({ isOpen, onClose }: RsvpModalProps) {
    const [name, setName] = useState("");
    const [attendeeCount, setAttendeeCount] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            const savedName = localStorage.getItem("uploaderName");
            if (savedName) setName(savedName);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
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
            await submitRsvp(name, attendeeCount);
            localStorage.setItem("uploaderName", name); // Save for future use
            localStorage.setItem("hasSubmittedRsvp", "true");
            alert("참석 여부가 전달되었습니다. 감사합니다!");
            onClose();
        } catch (err: any) {
            setError(err.message || "오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
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
                            <h3 className="font-serif text-xl text-charcoal font-bold">참석 의사 전달</h3>
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-gray-400 hover:text-charcoal transition-colors p-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-5 border-b border-gray-100 text-center relative">
                            <h2 className="font-serif text-sm text-gray-600">원활한 식사 준비를 위해 참석 여부를 알려주세요.</h2>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-serif text-gray-600 mb-1">성함</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="성함을 입력해주세요"
                                    className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-gold transition-colors font-serif"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-serif text-gray-600 mb-1">참석 인원 (본인 포함)</label>
                                <div className="flex items-center gap-4 space-y-2">
                                    <button
                                        type="button"
                                        onClick={() => setAttendeeCount(Math.max(1, attendeeCount - 1))}
                                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-gold hover:text-gold"
                                    >
                                        -
                                    </button>
                                    <span className="font-serif text-lg w-8 text-center">{attendeeCount}</span>
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
                                className="w-full bg-charcoal text-white py-3 rounded-lg hover:bg-gold transition-colors font-serif mt-4 disabled:opacity-50"
                            >
                                {isSubmitting ? "전송 중..." : "참석 의사 보내기"}
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
