"use client";

import Hero from "@/components/Hero";
import Invitation from "@/components/Invitation";
import Guestbook from "@/components/Guestbook";
import Gallery from "@/components/Gallery";
import Map from "@/components/Map";
import ShareButton from "@/components/ShareButton";
import Account from "@/components/Account";
import NoticePopup from "@/components/NoticePopup";
import RsvpSection from "@/components/RsvpSection";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <NoticePopup />
      <Hero />

      <div className="max-w-md mx-auto w-full bg-white shadow-xl min-h-screen">
        <Invitation />

        <RsvpSection />

        {/* Gallery */}
        <section className="py-16 px-6">
          <h2 className="font-playfair text-3xl text-center mb-8 text-gold">갤러리</h2>
          <Gallery />
          <div className="mt-8 text-center">
            <a
              href="/our-gallery"
              className="inline-block border-b border-charcoal text-charcoal text-sm pb-1 hover:text-gold hover:border-gold transition-colors font-serif"
            >
              하객 갤러리 보러가기 →
            </a>
          </div>
        </section>

        {/* Location */}
        <section className="py-16 px-6 bg-gray-50">
          <h2 className="font-playfair text-3xl text-center mb-8 text-gold">오시는 길</h2>
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
            © 2026 <a href="/secret-gallery" className="hover:text-gray-500 transition-colors cursor-default">성애 & 종열</a>. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
