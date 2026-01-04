"use client";

import { useState, useEffect } from "react";
import { getAllRsvps, getTotalAttendeeCount, fetchAllRsvps, RsvpData } from "@/services/rsvp";
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
    const [totalAttendeeCount, setTotalAttendeeCount] = useState(0);

    const PAGE_SIZE = 30;

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === "1359") {
            setIsAuthenticated(true);
            fetchRsvps();
            fetchTotalCount();
        } else {
            alert("비밀번호가 틀렸습니다.");
        }
    };

    const fetchTotalCount = async () => {
        try {
            const total = await getTotalAttendeeCount();
            setTotalAttendeeCount(total);
        } catch (err) {
            console.error("Failed to fetch total count", err);
        }
    };

    const handleDownloadCsv = async () => {
        try {
            const allData = await fetchAllRsvps();
            const headers = ["이름", "인원", "날짜"];
            const rows = allData.map(rsvp => [
                rsvp.name,
                rsvp.attendeeCount,
                rsvp.timestamp ? new Date(rsvp.timestamp.seconds * 1000).toLocaleString() : ""
            ]);

            const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
            const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `참석명단_${new Date().toLocaleDateString()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("CSV 다운로드 실패", err);
            alert("다운로드에 실패했습니다.");
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
                            className="w-full border-b border-gray-300 py-3 text-center focus:outline-none focus:border-gold transition-colors font-pretendard"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="w-full bg-charcoal text-white py-3 rounded-lg hover:bg-gold transition-colors font-pretendard"
                        >
                            확인
                        </button>
                    </form>
                    <Link href="/" className="inline-block mt-6 text-sm text-gray-400 hover:text-charcoal transition-colors font-pretendard">
                        메인으로 돌아가기
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream p-4 sm:p-6 pb-20">
            <div className="max-w-md mx-auto">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
                    <div>
                        <h1 className="font-pretendard text-2xl font-bold text-charcoal mb-1">참석 명단</h1>
                        <p className="font-pretendard text-xs text-gray-400 font-medium">총 {totalAttendeeCount}명의 하객 등록</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={handleDownloadCsv}
                            className="flex-1 sm:flex-none text-[10px] sm:text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:border-gold hover:text-gold transition-colors font-pretendard flex items-center justify-center gap-1"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            CSV 저장
                        </button>
                        <Link href="/" className="flex-1 sm:flex-none text-[10px] sm:text-xs px-2.5 py-1.5 border border-gray-100 rounded-lg text-gray-400 hover:text-charcoal transition-colors font-pretendard text-center">
                            홈으로
                        </Link>
                    </div>
                </header>

                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 font-medium">
                            <tr>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 font-pretendard text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">성함</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 font-pretendard text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider text-center">인원</th>
                                <th className="px-3 sm:px-6 py-3 sm:py-4 font-pretendard text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider text-right">날짜</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            <AnimatePresence>
                                {rsvps.map((rsvp, idx) => {
                                    const date = rsvp.timestamp ? new Date(rsvp.timestamp.seconds * 1000).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
                                    return (
                                        <motion.tr
                                            key={rsvp.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 font-pretendard text-charcoal text-sm sm:text-base font-medium">{rsvp.name}</td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 font-pretendard text-charcoal text-sm sm:text-base text-center">{rsvp.attendeeCount}명</td>
                                            <td className="px-3 sm:px-6 py-3 sm:py-4 font-pretendard text-gray-400 text-[10px] sm:text-xs text-right whitespace-nowrap">{date}</td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                        <tfoot className="bg-gray-50">
                            <tr>
                                <td className="px-3 sm:px-6 py-4 font-pretendard text-xs sm:text-sm text-gray-500 font-bold">전체 총 합계</td>
                                <td colSpan={2} className="px-3 sm:px-6 py-4 font-pretendard text-gold text-right font-bold text-base sm:text-lg">
                                    {totalAttendeeCount}명
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
