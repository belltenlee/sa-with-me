import fs from 'fs';
import path from 'path';
import Hero from "@/components/Hero";
import Invitation from "@/components/Invitation";
import Guestbook from "@/components/Guestbook";
import Gallery from "@/components/Gallery";
import Map from "@/components/Map";
import ShareButton from "@/components/ShareButton";
import Account from "@/components/Account";
import WeddingInfo from "@/components/WeddingInfo";
import RsvpSection from "@/components/RsvpSection";
import FallingPetals from "@/components/FallingPetals";
import SectionHeader from "@/components/SectionHeader";

export default function Home() {
  // Read gallery images at build time (Server-side)
  const galleryDir = path.join(process.cwd(), 'public/images/gallery');
  let initialImages: { src: string; alt: string }[] = [];

  try {
    const files = fs.readdirSync(galleryDir);
    initialImages = files
      .filter(file => /^(G|soho|tell)\d+\.jpg$/i.test(file))
      .map(file => {
        const prefix = file.match(/^(G|soho|tell)/i)?.[0].toLowerCase();
        let altPrefix = "Wedding";
        if (prefix === 'soho') altPrefix = "Soho";
        if (prefix === 'tell') altPrefix = "Tell Love";

        return {
          src: `/images/gallery/${file}`,
          alt: `${altPrefix} Photo`,
        };
      });
  } catch (error) {
    console.error("Failed to read gallery directory:", error);
  }

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      {/* <NoticePopup /> */}
      <FallingPetals />
      <Hero />

      <div className="max-w-md mx-auto w-full bg-white shadow-xl min-h-screen snap-start pb-32">
        <Invitation />

        <WeddingInfo />

        <div id="rsvp-section">
          <RsvpSection />
        </div>

        {/* Gallery */  /*bg-[#F9FAFB] */}
        <section className="py-20 px-6 text-center bg-[#F8F6F2]" hidden={false}>
          <SectionHeader title="갤러리" />
          <Gallery initialImages={initialImages} />
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
          <SectionHeader title="오시는 길" />
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
