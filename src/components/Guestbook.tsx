'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/services/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

interface Message {
    id: string;
    name: string;
    message: string;
    date: string;
    timestamp: any;
}

export default function Guestbook() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load messages from Firestore
    useEffect(() => {
        const q = query(collection(db, "guestbook_messages"), orderBy("timestamp", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newMessages = snapshot.docs.map((doc) => {
                const data = doc.data();
                // Convert timestamp to date string for display
                const date = data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleDateString() : new Date().toLocaleDateString();
                return {
                    id: doc.id,
                    name: data.name,
                    message: data.message,
                    date: date,
                    timestamp: data.timestamp,
                };
            }) as Message[];
            setMessages(newMessages);
        });

        return () => unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !message.trim()) return;

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "guestbook_messages"), {
                name,
                message,
                timestamp: serverTimestamp(),
            });
            setName('');
            setMessage('');
        } catch (err) {
            console.error("Error adding document: ", err);
            alert("메시지 등록에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="py-16 px-6 bg-cream">
            <div className="max-w-md mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-10"
                >
                    <h2 className="font-playfair text-3xl text-gold mb-4">Guestbook</h2>
                    <p className="font-serif text-charcoal/60 text-sm">축복의 메시지를 남겨주세요</p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-4 mb-12">
                    <div>
                        <input
                            type="text"
                            placeholder="이름"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors bg-white font-serif"
                            maxLength={10}
                        />
                    </div>
                    <div>
                        <textarea
                            placeholder="축하 메시지를 작성해주세요"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-colors bg-white h-32 resize-none font-serif"
                            maxLength={200}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-charcoal text-white py-3 rounded-lg font-serif hover:bg-gold transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? '등록 중...' : '메시지 남기기'}
                    </button>
                </form>

                <div className="space-y-4">
                    <AnimatePresence>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
                            >
                                <div className="flex justify-between items-baseline mb-2">
                                    <span className="font-bold text-charcoal font-serif">{msg.name}</span>
                                    <span className="text-xs text-gray-400 font-serif">{msg.date}</span>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed font-serif whitespace-pre-wrap">
                                    {msg.message}
                                </p>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {messages.length === 0 && (
                        <div className="text-center text-gray-400 py-8 font-serif text-sm">
                            첫 번째로 축하 메시지를 남겨주세요!
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
