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
            const headers = ["이름", "참석여부", "인원", "날짜"];
            const rows = allData.map(rsvp => [
                rsvp.name,
                rsvp.isAttending ? "참석" : "미참석",
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
        <div className="min-h-screen bg-cream p-4 sm:p-8 pb-20">
            <div className="max-w-3xl mx-auto">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                    <div className="space-y-1">
                        <h1 className="font-pretendard text-3xl font-bold text-charcoal tracking-tight">참석 명단 관리</h1>
                        <p className="font-pretendard text-sm text-gray-500 font-medium">실제 참석 예정 하객: <span className="text-gold font-bold">{totalAttendeeCount}명</span></p>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button
                            onClick={handleDownloadCsv}
                            className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:border-gold hover:text-gold transition-all shadow-sm font-pretendard flex items-center justify-center gap-2 text-sm"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            엑셀(CSV) 다운로드
                        </button>
                        <Link href="/" className="flex-1 sm:flex-none px-4 py-2.5 bg-charcoal text-white rounded-xl hover:bg-gold transition-all shadow-sm font-pretendard text-center text-sm">
                            홈으로
                        </Link>
                    </div>
                </header>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left table-auto">
                            <thead className="bg-gray-50 border-b border-gray-100 font-semibold">
                                <tr>
                                    <th className="px-5 py-4 font-pretendard text-xs text-gray-400 uppercase tracking-wider">성함</th>
                                    <th className="px-5 py-4 font-pretendard text-xs text-gray-400 uppercase tracking-wider text-center">상태</th>
                                    <th className="px-5 py-4 font-pretendard text-xs text-gray-400 uppercase tracking-wider text-center">인원</th>
                                    <th className="px-5 py-4 font-pretendard text-xs text-gray-400 uppercase tracking-wider text-right">등록 일시</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                <AnimatePresence>
                                    {rsvps.map((rsvp, idx) => {
                                        const date = rsvp.timestamp ? new Date(rsvp.timestamp.seconds * 1000).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }) : '-';
                                        return (
                                            <motion.tr
                                                key={rsvp.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.03 }}
                                                className="hover:bg-gray-50/50 transition-colors"
                                            >
                                                <td className="px-5 py-4 font-pretendard text-charcoal text-sm font-semibold whitespace-nowrap">{rsvp.name}</td>
                                                <td className="px-5 py-4 text-center">
                                                    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-bold font-pretendard ${rsvp.isAttending ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                        {rsvp.isAttending ? '참석' : '미참석'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 font-pretendard text-charcoal text-sm text-center font-medium">
                                                    {rsvp.isAttending ? <span className="text-gold font-bold">{rsvp.attendeeCount}명</span> : <span className="text-gray-300">-</span>}
                                                </td>
                                                <td className="px-5 py-4 font-pretendard text-gray-400 text-[11px] text-right whitespace-nowrap tracking-tighter">{date}</td>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                            </tbody>
                            <tfoot className="bg-gray-50/50">
                                <tr>
                                    <td colSpan={2} className="px-5 py-5 font-pretendard text-sm text-gray-500 font-bold">참석 확정 인원 합계</td>
                                    <td colSpan={2} className="px-5 py-5 font-pretendard text-gold text-right font-black text-xl">
                                        {totalAttendeeCount}명
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

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
