"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NoticePopup() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Check if user has seen the notice
        const hasSeenNotice = localStorage.getItem('hasSeenNotice');
        if (!hasSeenNotice) {
            setIsOpen(true);
        }
    }, []);

    const handleClose = () => {
        // localStorage.setItem('hasSeenNotice', 'true');
        setIsOpen(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Content */}
                        <div className="text-center space-y-3">
                            <div className="w-16 h-16 mx-auto bg-gold/10 rounded-full flex items-center justify-center space-x-1">
                                {/* <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-8 h-8 text-gold">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                                    </svg>
                                </div> */}
                                <div>
                                    <h2 className="font-playfair text-2xl text-charcoal">
                                        Notice
                                    </h2>
                                </div>
                            </div>



                            <div className="font-serif text-charcoal/80 text-md leading-relaxed space-y-3">
                                <p>
                                    모바일 청첩장을<br />
                                    풍성하게 꾸미는 중입니다.
                                </p>
                                <p className="text-sm text-gray-500">
                                    일부 기능이 동작하지 않을 수 있습니다.<br />
                                    양해 부탁드립니다.
                                </p>
                                <br />
                            </div>

                            <button
                                onClick={handleClose}
                                className="w-full bg-charcoal text-white py-3 rounded-full hover:bg-gold transition-colors font-serif text-sm mt-6"
                            >
                                확인
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
