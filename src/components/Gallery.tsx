'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Gallery() {
  const [selectedImage, setSelectedImage] = React.useState<number | null>(null);

  // Using Unsplash images for a more premium feel
  const images = [
    { id: 1, src: 'https://images.unsplash.com/photo-1511285560982-1356c11d4606?q=80&w=1000&auto=format&fit=crop', alt: 'Wedding Photo 1' },
    { id: 2, src: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1000&auto=format&fit=crop', alt: 'Wedding Photo 2' },
    { id: 3, src: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=1000&auto=format&fit=crop', alt: 'Wedding Photo 3' },
    { id: 4, src: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1000&auto=format&fit=crop', alt: 'Wedding Photo 4' },
    { id: 5, src: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1000&auto=format&fit=crop', alt: 'Wedding Photo 5' },
    { id: 6, src: 'https://images.unsplash.com/photo-1522673607200-1645062cd958?q=80&w=1000&auto=format&fit=crop', alt: 'Wedding Photo 6' },
  ];

  return (
    <div className="py-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {images.map((image) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: image.id * 0.1 }}
            className="relative aspect-square cursor-pointer overflow-hidden"
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
                src={images.find(img => img.id === selectedImage)?.src}
                alt={images.find(img => img.id === selectedImage)?.alt}
                className="max-w-full max-h-full object-contain shadow-2xl"
              />
              <button
                className="absolute -top-12 right-0 text-white/80 hover:text-white text-sm tracking-widest uppercase"
                onClick={() => setSelectedImage(null)}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}