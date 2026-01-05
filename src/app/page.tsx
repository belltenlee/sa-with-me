"use client";

import Hero from "@/components/Hero";
import Invitation from "@/components/Invitation";
import Guestbook from "@/components/Guestbook";
import Gallery from "@/components/Gallery";
import Map from "@/components/Map";
import ShareButton from "@/components/ShareButton";
import Account from "@/components/Account";
import NoticePopup from "@/components/NoticePopup";
import WeddingInfo from "@/components/WeddingInfo";
import RsvpSection from "@/components/RsvpSection";
import Link from "next/link";
import { motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import FallingPetals from "@/components/FallingPetals";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-cream">
      {/* <NoticePopup /> */}
      <FallingPetals />
      <Hero />

      <div className="max-w-md mx-auto w-full bg-white shadow-xl min-h-screen">
        <Invitation />


        <WeddingInfo />

        <div id="rsvp-section">
          <RsvpSection />
        </div>

        {/* Gallery */  /*bg-[#F9FAFB] */}
        <section className="py-20 px-6 text-center bg-[#F8F6F2]" hidden={false}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.6 }}  /*bg-[#F0F7FF] */
            // className="inline-block px-12 py-4 border border-[#BDD3E9] rounded-[50%] mb-12 bg-[#F0F7FF] shadow-[0_4px_15px_rgba(189,211,233,0.3)] relative group"
            className="inline-block px-10 py-4 border border-[#EBC7C7] rounded-[50%] mb-12 bg-[#FFF5F5] shadow-[0_4px_15px_rgba(235,199,199,0.3)]"
          >
            {/* <div className="absolute inset-0 rounded-[50%] border border-[#E1EEFB] scale-[1.1] pointer-events-none group-hover:scale-[1.15] transition-transform duration-500" />
            <h2 className="font-paperlogy font-semibold text-2xl text-[#7DA2C7] tracking-widest relative z-10">갤러리</h2>
           */}
            <h2 className="font-paperlogy font-semibold text-2xl text-[#D99A9A] tracking-widest">갤러리</h2>
          </motion.div>
          <Gallery />
          <div className="mt-8 text-center" hidden={true}>
            <a
              href="/our-gallery"
              className="font-pretendard inline-block border-b border-charcoal text-charcoal text-sm pb-1 hover:text-gold hover:border-gold transition-colors font-serif"
            >
              하객 갤러리 보러가기 →
            </a>
          </div>
        </section>

        {/* Location */}
        <section id="map-section" className="py-16 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.6 }}
            className="inline-block px-10 py-4 border border-[#EBC7C7] rounded-[50%] mb-12 bg-[#FFF5F5] shadow-[0_4px_15px_rgba(235,199,199,0.3)]"
          >
            <h2 className="font-paperlogy font-semibold text-2xl text-[#D99A9A] tracking-widest">오시는 길</h2>
          </motion.div>
          <Map />
        </section>

        <Account />

        <Guestbook />

        <ShareButton />
        {/* Keeping this commented out or replace with simple button if ShareButton is not adapted yet.
          The previous code had a simple button. I'll stick to the simple button for now to avoid issues with the old component.*/}
        {/* <section className="py-16 px-6 flex justify-center">
          <button className="bg-charcoal text-white px-8 py-3 rounded-full hover:bg-gold transition-colors duration-300 font-serif">
            청첩장 공유하기
          </button>
        </section> */}

        <footer className="py-8 text-center text-gray-400 text-sm font-serif">
          <p>
            <a href="/rsvp-admin" className="hover:text-gray-500 transition-colors cursor-default">©</a> 2026 <a href="/secret-gallery" className="hover:text-gray-500 transition-colors cursor-default">종열 & 성애</a>. All rights <a href="/our-gallery" className="hover:text-gray-500 transition-colors cursor-default">reserved.</a>
          </p>
        </footer>
      </div>
    </div>
  );
}
