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
                    초대합니다
                </h2>

                <div className="font-serif text-charcoal leading-loose text-lg space-y-6 mb-16">
                    <p>
                        따스한 햇살 아래 만난 두 사람이<br />
                        작은 나무를 심으려 합니다.
                    </p>
                    <p>
                        사랑과 믿음으로 시작하는 저희의 앞날을<br />
                        지켜봐 주시길 바랍니다.
                    </p>
                    <p>
                        귀한 걸음 하시어 축복해 주시면<br />
                        더없는 기쁨이 되겠습니다.
                    </p>
                </div>

                <div className="space-y-2 font-serif">
                    <div className="flex items-center justify-center gap-4 text-lg">
                        <span className="font-bold">JY</span>
                        <span className="text-gray-400 text-sm">·</span>
                        <span className="font-bold">SK</span>
                        <span className="text-gray-500 text-sm">의 차남</span>
                        <span className="font-bold">SJ</span>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-lg">
                        <span className="font-bold">SA</span>
                        <span className="text-gray-400 text-sm">·</span>
                        <span className="font-bold">MH</span>
                        <span className="text-gray-500 text-sm">의 장녀</span>
                        <span className="font-bold">SH</span>
                    </div>
                    {/* Simplified for demo, can be dynamic */}
                    <div className="mt-8 pt-8 border-t border-gray-100 w-1/2 mx-auto">
                        <p className="text-xl font-playfair mb-2">SA & JY</p>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
