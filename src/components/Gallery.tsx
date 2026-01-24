'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GalleryProps {
  initialImages: { src: string; alt: string }[];
}

export default function Gallery({ initialImages }: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [shuffledImages, setShuffledImages] = useState<any[]>([]);
  const [displayedCount, setDisplayedCount] = useState(15);
  const [direction, setDirection] = useState(0);
  const galleryRef = React.useRef<HTMLDivElement>(null);

  // Shuffle on client mount
  useEffect(() => {
    // Fisher-Yates Shuffle
    const combined = [...initialImages];
    for (let i = combined.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [combined[i], combined[j]] = [combined[j], combined[i]];
    }

    // Re-assign unique IDs for the final order
    setShuffledImages(combined.map((img, index) => ({
      ...img,
      id: index + 1
    })));
  }, [initialImages]);

  // Use initialImages for initial render (SSR) and shuffledImages for client
  const images = shuffledImages.length > 0 ? shuffledImages : initialImages.map((img, i) => ({ ...img, id: i + 1 }));
  const visibleImages = images.slice(0, displayedCount);
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

  useEffect(() => {
    if (selectedImage === null) {
      document.body.style.overflow = 'unset';
      return;
    }
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goToNext();
      else if (e.key === 'ArrowLeft') goToPrev();
      else if (e.key === 'Escape') setSelectedImage(null);
    };

    const preventPinchZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
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
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  if (images.length === 0) return null;

  return (
    <div ref={galleryRef} className="py-4">
      <div className="grid grid-cols-3 gap-2">
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
            onClick={() => setDisplayedCount(prev => Math.min(prev + 15, images.length))}
            className="px-6 py-2 text-sm text-gray-600 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors duration-300 font-pretendard"
          >
            사진 더 보기 (+{images.length - displayedCount})
          </button>
        ) : (
          <button
            onClick={() => {
              setDisplayedCount(15);
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
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
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
                  if (swipe < -10000) goToNext();
                  else if (swipe > 10000) goToPrev();
                }}
                className="flex items-center justify-center cursor-grab active:cursor-grabbing w-full h-full"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={images.find((img) => img.id === selectedImage)?.src}
                  alt={images.find((img) => img.id === selectedImage)?.alt}
                  className="max-w-full max-h-[85vh] object-contain shadow-2xl select-none pointer-events-none"
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
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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