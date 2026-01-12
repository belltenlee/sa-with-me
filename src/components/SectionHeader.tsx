'use client';

import { motion } from 'framer-motion';

interface SectionHeaderProps {
    title: string;
}

export default function SectionHeader({ title }: SectionHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.6 }} /*bg-[#F0F7FF] */
            // className="inline-block px-12 py-4 border border-[#BDD3E9] rounded-[50%] mb-12 bg-[#F0F7FF] shadow-[0_4px_15px_rgba(189,211,233,0.3)] relative group"
            className="inline-block px-10 py-4 border border-[#EBC7C7] rounded-[50%] mb-12 bg-[#FFF5F5] shadow-[0_4px_15px_rgba(235,199,199,0.3)]"
        >           {/* <div className="absolute inset-0 rounded-[50%] border border-[#E1EEFB] scale-[1.1] pointer-events-none group-hover:scale-[1.15] transition-transform duration-500" />
            <h2 className="font-paperlogy font-semibold text-2xl text-[#7DA2C7] tracking-widest relative z-10">갤러리</h2>
            */}
            <h2 className="font-paperlogy font-semibold text-2xl text-[#D99A9A] tracking-widest">
                {title}
            </h2>
        </motion.div>
    );
}
