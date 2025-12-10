'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAssetPath } from '@/utils/basePath';

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [displayedCount, setDisplayedCount] = useState(6);

  const images = Array.from({ length: 11 }, (_, i) => ({
    id: i + 1,
    src: getAssetPath(`/images/gallery/G${String(i + 1).padStart(2, '0')}.jpg`),
    alt: `Wedding Photo ${i + 1}`,
  }));

  const visibleImages = images.slice(0, displayedCount);

  return (
    <div className="py-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {visibleImages.map((image) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: (image.id % 6) * 0.1 }}
            className="relative aspect-square cursor-pointer overflow-hidden rounded-lg shadow-sm hover:shadow-md"
            onClick={() => setSelectedImage(image.id)}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300" />
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        {displayedCount < images.length ? (
          <button
            onClick={() => setDisplayedCount(images.length)}
            className="px-6 py-2 text-sm text-gray-600 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors duration-300"
          >
            사진 더 보기 (+{images.length - displayedCount})
          </button>
        ) : (
          <button
            onClick={() => setDisplayedCount(6)}
            className="px-6 py-2 text-sm text-gray-600 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors duration-300"
          >
            접기
          </button>
        )}
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images.find((img) => img.id === selectedImage)?.src}
                alt={images.find((img) => img.id === selectedImage)?.alt}
                className="max-w-full max-h-full object-contain shadow-2xl touch-none select-none"
                style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
              />
              <button
                className="absolute -top-12 right-0 text-white/80 hover:text-white text-sm tracking-widest uppercase"
                onClick={() => setSelectedImage(null)}
              >
                닫기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}