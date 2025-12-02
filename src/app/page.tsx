"use client";

import Hero from "@/components/Hero";
import Invitation from "@/components/Invitation";
import Guestbook from "@/components/Guestbook";
import Gallery from "@/components/Gallery";
import Map from "@/components/Map";
import ShareButton from "@/components/ShareButton";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-cream">
      <Hero />

      <div className="max-w-md mx-auto w-full bg-white shadow-xl min-h-screen">
        <Invitation />

        {/* Gallery */}
        <section className="py-16 px-6">
          <h2 className="font-playfair text-3xl text-center mb-8 text-gold">Gallery</h2>
          <Gallery />
        </section>

        {/* Location */}
        <section className="py-16 px-6 bg-gray-50">
          <h2 className="font-playfair text-3xl text-center mb-8 text-gold">Location</h2>
          <Map />
        </section>

        <Guestbook />

        <section className="py-16 px-6 flex justify-center">
          {/* <ShareButton /> -- Keeping this commented out or replace with simple button if ShareButton is not adapted yet. 
               The previous code had a simple button. I'll stick to the simple button for now to avoid issues with the old component.
           */}
          <button className="bg-charcoal text-white px-8 py-3 rounded-full hover:bg-gold transition-colors duration-300 font-serif">
            Share Invitation
          </button>
        </section>

        <footer className="py-8 text-center text-gray-400 text-sm font-serif">
          <p>© 2025 Jisu & Minjun. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
