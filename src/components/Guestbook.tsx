"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    id: string;
    name: string;
    text: string;
    date: string;
}

export default function Guestbook() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [name, setName] = useState("");
    const [text, setText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load messages from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("guestbook_messages");
        if (saved) {
            setMessages(JSON.parse(saved));
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !text.trim()) return;

        setIsSubmitting(true);

        const newMessage: Message = {
            id: Date.now().toString(),
            name: name.trim(),
            text: text.trim(),
            date: new Date().toLocaleDateString(),
        };

        const updatedMessages = [newMessage, ...messages];
        setMessages(updatedMessages);
        localStorage.setItem("guestbook_messages", JSON.stringify(updatedMessages));

        setName("");
        setText("");
        setIsSubmitting(false);
    };

    return (
        <section className="py-20 px-6 bg-cream/30">
            <div className="max-w-md mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <h2 className="font-playfair text-3xl text-gold mb-4">Guestbook</h2>
                    <p className="text-charcoal/60 text-sm">Leave a message of blessing.</p>
                </motion.div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mb-12 space-y-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Your Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all bg-white font-serif"
                            maxLength={20}
                        />
                    </div>
                    <div>
                        <textarea
                            placeholder="Write a congratulatory message..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all bg-white font-serif resize-none h-32"
                            maxLength={200}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting || !name || !text}
                        className="w-full bg-charcoal text-white py-3 rounded-lg font-serif hover:bg-gold transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Sending..." : "Send Message"}
                    </button>
                </form>

                {/* Message List */}
                <div className="space-y-4">
                    <AnimatePresence>
                        {messages.length === 0 ? (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center text-gray-400 text-sm italic"
                            >
                                Be the first to leave a message!
                            </motion.p>
                        ) : (
                            messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
                                >
                                    <div className="flex justify-between items-baseline mb-2">
                                        <h4 className="font-bold text-charcoal">{msg.name}</h4>
                                        <span className="text-xs text-gray-400">{msg.date}</span>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                                        {msg.text}
                                    </p>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}
