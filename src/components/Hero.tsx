"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { getAssetPath } from "@/utils/basePath";

const HERO_IMAGES = [
    getAssetPath("/images/gallery/G01.jpg"),
    getAssetPath("/images/gallery/G02.jpg"),
    getAssetPath("/images/gallery/G03.jpg"),
    getAssetPath("/images/gallery/G04.jpg"),
    getAssetPath("/images/gallery/G05.jpg"),
];

export default function Hero() {
    const containerRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    // Map scroll progress (0 to 1) to image index (0 to 4)
    // Adjusted range to distribute transitions evenly across the scroll
    const currentImageIndex = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [0, 1, 2, 3, 4]);

    return (
        <section ref={containerRef} className="relative w-full h-[300vh]">
            <div className="sticky top-0 h-[100dvh] overflow-hidden">
                {/* Background Images */}
                {HERO_IMAGES.map((img, index) => (
                    <motion.div
                        key={index}
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: `url('${img}')`,
                            opacity: useTransform(
                                currentImageIndex,
                                (latest) => {
                                    // Smooth cross-fade logic
                                    const diff = Math.abs(latest - index);
                                    // If diff is 0, opacity is 1.
                                    // If diff is 1, opacity is 0.
                                    // Linear interpolation for smooth transition.
                                    return Math.max(0, 1 - diff);
                                }
                            ),
                            zIndex: 0
                        }}
                    >
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/30" />
                    </motion.div>
                ))}

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <p className="text-sm sm:text-lg md:text-xl tracking-[0.2em] mb-4 uppercase font-light whitespace-nowrap">
                            저희 결혼합니다
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl mb-6 whitespace-nowrap">
                            박성애 · 이종열
                        </h1>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        <p className="font-playfair text-xl sm:text-2xl md:text-3xl whitespace-nowrap">
                            2026. 02. 21
                        </p>
                        <p className="mt-2 text-xs sm:text-sm tracking-widest uppercase opacity-80 whitespace-nowrap">
                            토요일 오후 5시
                        </p>
                        <p className="mt-2 font-playfair text-lg sm:text-xl md:text-2xl whitespace-nowrap">
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
                    style={{ opacity: useTransform(scrollYProgress, [0.9, 1], [1, 0]) }} // Fade out at the end
                >
                    <span className="text-xs tracking-widest uppercase">Scroll</span>
                </motion.div>
            </div>
        </section>
    );
}
