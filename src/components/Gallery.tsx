'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAssetPath } from '@/utils/basePath';

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [shuffledImages, setShuffledImages] = useState<any[]>([]);
  const [displayedCount, setDisplayedCount] = useState(6);
  const [direction, setDirection] = useState(0);
  const galleryRef = React.useRef<HTMLDivElement>(null);

  // Define base images
  const baseImages = useMemo(() => {
    const sample_sources = Array.from({ length: 9 }, (_, i) => ({
      src: getAssetPath(`/images/gallery/G${String(i + 1).padStart(2, '0')}.jpg`),
      alt: `Wedding Photo ${i + 1}`,
    }));

    const soho_sources = Array.from({ length: 14 }, (_, i) => ({
      src: getAssetPath(`/images/gallery/soho${String(i + 1).padStart(2, '0')}.jpg`),
      alt: `Soho Photo ${i + 1}`,
    }));

    const tell_love_sources = Array.from({ length: 20 }, (_, i) => ({
      src: getAssetPath(`/images/gallery/tell${String(i + 1).padStart(2, '0')}.jpg`),
      alt: `Tell Love Photo ${i + 1}`,
    }));

    return [...sample_sources, ...soho_sources, ...tell_love_sources].map((img, index) => ({
      ...img,
      id: index + 1,
    }));
  }, []);

  // Shuffle only on client side after mount to avoid hydration mismatch
  useEffect(() => {
    const combined = [...baseImages];
    for (let i = combined.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [combined[i], combined[j]] = [combined[j], combined[i]];
    }
    setShuffledImages(combined);
  }, [baseImages]);

  // Use baseImages for initial render (server) and shuffledImages for client
  const images = shuffledImages.length > 0 ? shuffledImages : baseImages;
  const visibleImages = images.slice(0, displayedCount);

  // Navigation functions based on current array order (shuffled)
  const currentIndex = images.findIndex((img) => img.id === selectedImage);

  const goToNext = () => {
    if (currentIndex >= 0 && currentIndex < images.length - 1) {
      setDirection(1);
      setSelectedImage(images[currentIndex + 1].id);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setSelectedImage(images[currentIndex - 1].id);
    }
  };

  // Keyboard navigation, scroll locking, and preventing pinch-zoom
  useEffect(() => {
    if (selectedImage === null) {
      document.body.style.overflow = 'unset';
      return;
    }

    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'Escape') {
        setSelectedImage(null);
      }
    };

    const preventPinchZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchmove', preventPinchZoom, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchmove', preventPinchZoom);
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open');
    };
  }, [selectedImage, currentIndex]);

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
              className="relative max-w-4xl w-full h-full flex items-center justify-center"
              style={{ touchAction: 'pan-x' }}
            >
              {/* Close Button - High Visibility Icon */}
              <button
                className="absolute top-6 right-6 z-[60] w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white/90 transition-all active:scale-95"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(null);
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Previous Button */}
              {currentIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrev();
                  }}
                  className="absolute left-4 z-10 w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors duration-300"
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
                className="flex items-center justify-center cursor-grab active:cursor-grabbing w-full h-full"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={images.find((img) => img.id === selectedImage)?.src}
                  alt={images.find((img) => img.id === selectedImage)?.alt}
                  className="max-w-full max-h-[85vh] object-contain shadow-2xl select-none pointer-events-none"
                  style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                />
              </motion.div>

              {/* Next Button */}
              {currentIndex < images.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  className="absolute right-4 z-10 w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors duration-300"
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

              {/* Image Counter */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 px-4 py-1.5 bg-black/30 backdrop-blur-md rounded-full text-white/80 text-xs font-pretendard tracking-widest leading-none">
                {currentIndex + 1} / {images.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}