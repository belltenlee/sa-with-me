"use client";

import { motion } from "framer-motion";

export default function Hero() {
    return (
        <section className="relative w-full h-screen overflow-hidden">
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
                        We Are Getting Married
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <h1 className="font-playfair text-5xl md:text-7xl mb-6">
                        Jisu & Minjun
                    </h1>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    <p className="font-playfair text-2xl md:text-3xl">
                        2025. 10. 25
                    </p>
                    <p className="mt-2 text-sm tracking-widest uppercase opacity-80">
                        Saturday 12:00 PM
                    </p>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
                <span className="text-xs tracking-widest uppercase">Scroll</span>
            </motion.div>
        </section>
    );
}
