"use client";

import { motion, useScroll, useTransform, motionValue } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { getAssetPath } from "@/utils/basePath";

const HERO_IMAGES = [
    getAssetPath("/images/gallery/G01.jpg"),
    getAssetPath("/images/gallery/G02.jpg"),
    getAssetPath("/images/gallery/G05.jpg"),
];

export default function Hero() {
    const containerRef = useRef<HTMLElement>(null);
    const [height, setHeight] = useState<number | string>("100vh"); // Default to 100vh for SSR/initial render

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    // Handle dynamic viewport height without resizing on scroll (address bar toggle)
    useEffect(() => {
        const updateHeight = () => {
            setHeight(window.innerHeight);
        };

        // Set initial height
        updateHeight();

        // Only update height if width changes (orientation change), ignore vertical resize (address bar)
        let lastWidth = window.innerWidth;
        const handleResize = () => {
            if (window.innerWidth !== lastWidth) {
                lastWidth = window.innerWidth;
                updateHeight();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Lock scroll until images are loaded
    useEffect(() => {
        // Prevent scrolling
        document.body.style.overflow = 'hidden';

        const preloadImages = async () => {
            const promises = HERO_IMAGES.map((src) => {
                return new Promise((resolve) => {
                    const img = new Image();
                    img.src = src;
                    img.onload = resolve;
                    img.onerror = resolve; // Proceed even if error
                });
            });

            await Promise.all(promises);

            // Add a small delay to ensure layout is stable and animations have started
            setTimeout(() => {
                document.body.style.overflow = '';
            }, 100);
        };

        preloadImages();

        // Cleanup in case component unmounts before loading finishes
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    // 3D Zoom & Swap animations
    // Total height: 330vh. Viewport height: 100vh. Scrollable range: 230vh.
    // Snap points: 0vh (Progress 0), 100vh (Progress 100/230 ≈ 0.435), 200vh (Progress 200/260 ≈ 0.870)

    // Image 0 (Initial)
    const scale0 = useTransform(scrollYProgress, [0, 0.435], [1, 0.85]);
    const opacity0 = useTransform(scrollYProgress, [0.25, 0.435], [1, 0]);
    const blur0 = useTransform(scrollYProgress, [0, 0.435], [0, 10]);

    // Image 1 (Second) - Reaches focus at 0.435
    const scale1 = useTransform(scrollYProgress, [0, 0.435, 0.870], [1.3, 1, 0.85]);
    const opacity1 = useTransform(scrollYProgress, [0.1, 0.38, 0.52, 0.8], [0, 1, 1, 0]);
    const blur1 = useTransform(scrollYProgress, [0, 0.38, 0.435, 0.52, 0.870], [10, 0, 0, 0, 10]);

    // Image 2 (Third) - Reaches focus at 0.870
    const scale2 = useTransform(scrollYProgress, [0.5, 0.870, 1], [1.3, 1, 1.02]);
    const opacity2 = useTransform(scrollYProgress, [0.6, 0.870], [0, 1]);
    const blur2 = useTransform(scrollYProgress, [0.5, 0.82, 0.870], [10, 0, 0]);

    const scales = [scale0, scale1, scale2];
    const opacities = [opacity0, opacity1, opacity2];
    const blurs = [blur0, blur1, blur2];

    return (
        <section ref={containerRef} className="relative w-full h-[330vh] bg-white">
            {/* Snap Points */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="h-[100vh] snap-start" />
                <div className="h-[100vh] snap-start" />
                <div className="h-[100vh] snap-start" />
            </div>

            <div
                className="sticky top-0 overflow-hidden"
                style={{ height: height }}
            >
                {/* Background Images */}
                {HERO_IMAGES.map((img, index) => (
                    <motion.div
                        key={index}
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: `url('${img}')`,
                            scale: scales[index],
                            opacity: opacities[index],
                            filter: useTransform(blurs[index], (b) => `blur(${b}px)`),
                            zIndex: index,
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
                            이종열 · 박성애
                        </h1>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        <p className="font-playfair text-xl font-bold sm:text-2xl md:text-3xl whitespace-nowrap">
                            2026. 02. 21
                        </p>
                        <p className="mt-2 text-sm font-bold sm:text-sm tracking-widest uppercase opacity-80 whitespace-nowrap">
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
