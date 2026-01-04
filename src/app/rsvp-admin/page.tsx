"use client";

import { useState, useEffect } from "react";
import { getAllRsvps, RsvpData } from "@/services/rsvp";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function RsvpAdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [rsvps, setRsvps] = useState<RsvpData[]>([]);
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [hasMore, setHasMore] = useState(true);

    const PAGE_SIZE = 30;

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === "1359") {
            setIsAuthenticated(true);
            fetchRsvps();
        } else {
            alert("비밀번호가 틀렸습니다.");
        }
    };

    const fetchRsvps = async (isNextPage = false) => {
        setLoading(true);
        try {
            const result = await getAllRsvps(PAGE_SIZE, isNextPage ? lastDoc : null);
            if (isNextPage) {
                setRsvps(prev => [...prev, ...result.rsvps]);
            } else {
                setRsvps(result.rsvps);
            }
            setLastDoc(result.lastDoc);
            setHasMore(result.rsvps.length === PAGE_SIZE);
        } catch (err) {
            console.error(err);
            setError("데이터를 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center"
                >
                    <h1 className="font-pretendard text-2xl text-charcoal mb-6">관리자 페이지</h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호를 입력하세요"
                            className="w-full border-b border-gray-300 py-3 text-center focus:outline-none focus:border-gold transition-colors font-serif"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="w-full bg-charcoal text-white py-3 rounded-lg hover:bg-gold transition-colors font-serif"
                        >
                            확인
                        </button>
                    </form>
                    <Link href="/" className="inline-block mt-6 text-sm text-gray-400 hover:text-charcoal transition-colors font-serif">
                        메인으로 돌아가기
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream p-6 pb-20">
            <div className="max-w-md mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="font-serif text-2xl text-charcoal">참석 명단</h1>
                    <Link href="/" className="text-sm text-gray-500 hover:text-gold transition-colors font-serif">
                        홈으로
                    </Link>
                </header>

                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-serif text-sm text-gray-600">성함</th>
                                <th className="px-6 py-4 font-serif text-sm text-gray-600 text-right">인원</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            <AnimatePresence>
                                {rsvps.map((rsvp, idx) => (
                                    <motion.tr
                                        key={rsvp.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <td className="px-6 py-4 font-serif text-charcoal">{rsvp.name}</td>
                                        <td className="px-6 py-4 font-serif text-charcoal text-right">{rsvp.attendeeCount}명</td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                        <tfoot className="bg-gray-50">
                            <tr>
                                <td className="px-6 py-4 font-serif text-sm text-gray-600 font-bold">총 합계</td>
                                <td className="px-6 py-4 font-serif text-gold text-right font-bold text-lg">
                                    {rsvps.reduce((acc, curr) => acc + curr.attendeeCount, 0)}명
                                </td>
                            </tr>
                        </tfoot>
                    </table>

                    {rsvps.length === 0 && !loading && (
                        <div className="py-20 text-center text-gray-400 font-serif">
                            아직 참석 등록자가 없습니다.
                        </div>
                    )}
                </div>

                {hasMore && (
                    <div className="mt-8 text-center">
                        <button
                            onClick={() => fetchRsvps(true)}
                            disabled={loading}
                            className="px-8 py-3 bg-white border border-gray-200 rounded-full text-gray-600 hover:border-gold hover:text-gold transition-all font-serif disabled:opacity-50"
                        >
                            {loading ? "불러오는 중..." : "더보기 (30명)"}
                        </button>
                    </div>
                )}

                {error && <p className="mt-4 text-center text-red-500 text-sm font-serif">{error}</p>}
            </div>
        </div>
    );
}
