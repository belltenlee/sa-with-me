"use client";

import { motion } from "framer-motion";

export default function Invitation() {
    return (
        <section className="py-20 px-6 text-center bg-white">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
            >
                <h2 className="font-playfair text-gold text-sm tracking-[0.3em] uppercase mb-12">
                    Invitation
                </h2>

                <div className="font-serif text-charcoal leading-loose text-lg space-y-6 mb-16">
                    <p>
                        Two people who met under the gentle sunlight<br />
                        are now planting a small tree together.
                    </p>
                    <p>
                        We invite you to watch over us<br />
                        as we begin our journey with love and trust.
                    </p>
                    <p>
                        Your presence will be the warmest blessing<br />
                        for our new beginning.
                    </p>
                </div>

                <div className="space-y-2 font-serif">
                    <div className="flex items-center justify-center gap-4 text-lg">
                        <span className="font-bold">Kim Chul-soo</span>
                        <span className="text-gray-400 text-sm">·</span>
                        <span className="font-bold">Lee Young-hee</span>
                        <span className="text-gray-500 text-sm">Son of</span>
                        <span className="font-bold">Kim Gun-woo</span>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-lg">
                        <span className="font-bold">Lee Young-hee</span>
                        <span className="text-gray-400 text-sm">·</span>
                        <span className="font-bold">Park Mi-young</span>
                        <span className="text-gray-500 text-sm">Daughter of</span>
                        <span className="font-bold">Lee Sang-ho</span>
                    </div>
                    {/* Simplified for demo, can be dynamic */}
                    <div className="mt-8 pt-8 border-t border-gray-100 w-1/2 mx-auto">
                        <p className="text-xl font-playfair mb-2">Jisu & Minjun</p>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
