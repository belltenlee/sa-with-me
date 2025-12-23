"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import RsvpModal from "./RsvpModal";

export default function RsvpSection() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.5 });
    const [hasAutoOpened, setHasAutoOpened] = useState(false);

    useEffect(() => {
        // Check if already submitted or already auto-opened in this session
        const hasSubmitted = localStorage.getItem("hasSubmittedRsvp");
        const sessionAutoOpened = sessionStorage.getItem("hasAutoOpenedRsvp");

        if (isInView && !hasAutoOpened && !hasSubmitted && !sessionAutoOpened) {
            // Add a small delay so it doesn't pop up immediately when scrolling fast
            const timer = setTimeout(() => {
                setIsModalOpen(true);
                setHasAutoOpened(true);
                sessionStorage.setItem("hasAutoOpenedRsvp", "true");
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isInView, hasAutoOpened]);

    return (
        <>
            <section ref={sectionRef} className="py-10 px-6 bg-cream/30 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <p className="font-serif text-charcoal/80 mb-6 leading-relaxed">
                        참석이 어려우시더라도<br />
                        마음만은 축복해 주시길 바랍니다.
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-white border border-gold text-gold px-8 py-3 rounded-full font-serif hover:bg-gold hover:text-white transition-colors shadow-sm"
                    >
                        참석 의사 전달하기
                    </button>
                </motion.div>
            </section>

            <RsvpModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}
