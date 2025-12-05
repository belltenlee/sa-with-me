"use client";

import { motion } from "framer-motion";

export default function Hero() {
    return (
        <section className="relative w-full h-[100dvh] overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop')", // Wedding couple in field
                }}
            >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/30" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <p className="text-lg md:text-xl tracking-[0.2em] mb-4 uppercase font-light">
                        저희 결혼합니다
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <h1 className="font-playfair text-5xl md:text-5xl mb-6">
                        박성애 & 이종열
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    <p className="font-playfair text-2xl md:text-3xl">
                        2026. 02. 21
                    </p>
                    <p className="mt-2 text-sm tracking-widest uppercase opacity-80">
                        토요일 오후 5시
                    </p>
                    <p className="mt-2 font-playfair text-xl md:text-2xl">
                        LACITTA
                    </p>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-8 w-full text-center text-white/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
                <span className="text-xs tracking-widest uppercase">Scroll</span>
            </motion.div>
        </section>
    );
}
