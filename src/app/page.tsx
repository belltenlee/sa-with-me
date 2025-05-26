'use client';

import * as React from 'react';
import { motion as m } from 'framer-motion';
import Gallery from '@/components/Gallery';
import Map from '@/components/Map';
import ShareButton from '@/components/ShareButton';
import Account from '@/components/Account';
import Carousel from '@/components/Carousel';

export default function Home() {
  const carouselImages = [
    { src: '/images/carousel/placeholder1.svg', alt: 'Placeholder Image 1' },
    { src: '/images/carousel/placeholder2.svg', alt: 'Placeholder Image 2' },
    { src: '/images/carousel/placeholder3.svg', alt: 'Placeholder Image 3' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <m.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl font-bold mb-4"
        >
          우리, 결혼합니다
        </m.h1>
        <m.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-gray-600"
        >
          2024년 8월 15일 토요일 오후 2시
        </m.p>
      </header>

      <section className="mb-12">
        <m.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="relative w-full h-[400px] rounded-lg overflow-hidden bg-gray-200"
        >
          <Carousel images={carouselImages} />
        </m.div>
      </section>

      <section className="text-center mb-12">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <p className="text-lg mb-4">
            김철수 · 이영희
          </p>
          <p className="text-gray-600 mb-2">
            김건우 · 박미영의 장남 철수
          </p>
          <p className="text-gray-600">
            이상호 · 최영미의 장녀 영희
          </p>
        </m.div>
      </section>

      <section className="mb-12">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.8 }}
        >
          <Gallery />
        </m.div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <m.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-xl font-bold mb-4">예식장 안내</h2>
          <p className="text-gray-600">
            더채플앳청담
            <br />
            서울 강남구 청담동 123-45
          </p>
        </m.div>

        <m.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-xl font-bold mb-4">오시는 길</h2>
          <p className="text-gray-600">
            지하철 7호선 청담역 4번 출구
            <br />
            도보 5분 거리
          </p>
        </m.div>
      </section>

      <section className="mb-12">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0, duration: 0.8 }}
        >
          <Map />
        </m.div>
      </section>

      <section className="mb-12">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.8 }}
        >
          <Account />
        </m.div>
      </section>

      <section className="mb-12 flex justify-center">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4, duration: 0.8 }}
        >
          <ShareButton />
        </m.div>
      </section>
    </div>
  );
}
