'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAssetPath } from '@/utils/basePath';

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [displayedCount, setDisplayedCount] = useState(6);
  const [direction, setDirection] = useState(0);
  const galleryRef = React.useRef<HTMLDivElement>(null);

  const sample_images = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    src: getAssetPath(`/images/gallery/G${String(i + 1).padStart(2, '0')}.jpg`),
    alt: `Wedding Photo ${i + 1}`,
  }));

  const soho_images = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    src: getAssetPath(`/images/gallery/soho${String(i + 1).padStart(2, '0')}.jpg`),
    alt: `Soho Photo ${i + 1}`,
  }));

  const images = sample_images.concat(soho_images);

  const visibleImages = images.slice(0, displayedCount);

  // Navigation functions
  const goToNext = () => {
    if (selectedImage !== null && selectedImage < images.length) {
      setDirection(1);
      setSelectedImage(selectedImage + 1);
    }
  };

  const goToPrev = () => {
    if (selectedImage !== null && selectedImage > 1) {
      setDirection(-1);
      setSelectedImage(selectedImage - 1);
    }
  };

  // Keyboard navigation and scroll locking
  useEffect(() => {
    if (selectedImage === null) {
      document.body.style.overflow = 'unset';
      return;
    }

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'Escape') {
        setSelectedImage(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div ref={galleryRef} className="py-4">
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
            className="px-6 py-2 text-sm text-gray-600 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors duration-300 font-pretendard"
          >
            사진 더 보기 (+{images.length - displayedCount})
          </button>
        ) : (
          <button
            onClick={() => {
              setDisplayedCount(6);
              galleryRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-6 py-2 text-sm text-gray-600 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors duration-300 font-pretendard"
          >
            접기
          </button>
        )}
      </div>

      <AnimatePresence initial={false} custom={direction}>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center"
              style={{ touchAction: 'pan-x' }}
            >
              {/* Previous Button */}
              {selectedImage > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrev();
                  }}
                  className="absolute left-4 z-10 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors duration-300"
                  aria-label="Previous image"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              )}

              {/* Image with swipe support */}
              <motion.div
                key={selectedImage}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) * velocity.x;
                  if (swipe < -10000) {
                    goToNext();
                  } else if (swipe > 10000) {
                    goToPrev();
                  }
                }}
                className="flex items-center justify-center cursor-grab active:cursor-grabbing"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={images.find((img) => img.id === selectedImage)?.src}
                  alt={images.find((img) => img.id === selectedImage)?.alt}
                  className="max-w-full max-h-[90vh] object-contain shadow-2xl select-none pointer-events-none"
                  style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                />
              </motion.div>

              {/* Next Button */}
              {selectedImage < images.length && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  className="absolute right-4 z-10 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors duration-300"
                  aria-label="Next image"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              )}

              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-white/80 hover:text-white text-sm tracking-widest uppercase font-pretendard"
                onClick={() => setSelectedImage(null)}
              >
                닫기
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/80 text-sm font-pretendard">
                {selectedImage} / {images.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}