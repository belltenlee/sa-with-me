'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function Gallery() {
  const [selectedImage, setSelectedImage] = React.useState<number | null>(null);

  const images = [
    { id: 1, src: '/sa-with-me/images/themed_placeholders/wedding_theme_1.svg', alt: 'Wedding Theme Placeholder 1' },
    { id: 2, src: '/sa-with-me/images/themed_placeholders/wedding_theme_2.svg', alt: 'Wedding Theme Placeholder 2' },
    { id: 3, src: '/sa-with-me/images/themed_placeholders/wedding_theme_3.svg', alt: 'Wedding Theme Placeholder 3' },
    { id: 4, src: '/sa-with-me/images/themed_placeholders/wedding_theme_4.svg', alt: 'Wedding Theme Placeholder 4' },
    { id: 5, src: '/sa-with-me/images/themed_placeholders/wedding_theme_1.svg', alt: 'Wedding Theme Placeholder 1 (repeated)' },
    { id: 6, src: '/sa-with-me/images/themed_placeholders/wedding_theme_2.svg', alt: 'Wedding Theme Placeholder 2 (repeated)' },
  ];

  return (
    <div className="py-12">
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-center mb-8"
      >
        우리의 이야기
      </motion.h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: image.id * 0.1 }} // Adjusted delay slightly
            className="relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-100" // Added a light bg for loading
            onClick={() => setSelectedImage(image.id)}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover" // Ensures image covers the div
            />
          </motion.div>
        ))}
      </div>

      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="relative max-w-4xl w-full aspect-[3/2] bg-gray-100 rounded-lg overflow-hidden" // Added bg and overflow
            onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking on image itself
          >
            <img
              src={images.find(img => img.id === selectedImage)?.src}
              alt={images.find(img => img.id === selectedImage)?.alt}
              className="w-full h-full object-contain" // Use object-contain for modal to see full image
            />
            <button
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2"
              onClick={() => setSelectedImage(null)} // Simplified this onClick
            >
              닫기
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}