"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function DDayCounter() {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const targetDate = new Date("2026-02-21T17:00:00");

        const calculateTimeLeft = () => {
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, []);

    const TimeUnit = ({ value, label }: { value: number; label: string }) => (
        <div className="flex flex-col items-center mx-2 sm:mx-4">
            <div className="text-2xl sm:text-3xl font-playfair font-bold text-gold tabular-nums">
                {String(value).padStart(2, '0')}
            </div>
            <div className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest mt-1 font-light">
                {label}
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="py-6 flex justify-center items-center bg-cream/30 rounded-2xl mx-4 my-4"
        >
            <TimeUnit value={timeLeft.days} label="Days" />
            <div className="text-gold/30 text-xl pb-4">:</div>
            <TimeUnit value={timeLeft.hours} label="Hour" />
            <div className="text-gold/30 text-xl pb-4">:</div>
            <TimeUnit value={timeLeft.minutes} label="Min" />
            <div className="text-gold/30 text-xl pb-4">:</div>
            <TimeUnit value={timeLeft.seconds} label="Sec" />
        </motion.div>
    );
}
