'use client';

import React from 'react';
import { motion } from 'framer-motion';

const images = [
  { id: 1, src: '/images/gallery/1.jpg', alt: '웨딩 사진 1' },
  { id: 2, src: '/images/gallery/2.jpg', alt: '웨딩 사진 2' },
  { id: 3, src: '/images/gallery/3.jpg', alt: '웨딩 사진 3' },
  { id: 4, src: '/images/gallery/4.jpg', alt: '웨딩 사진 4' },
  { id: 5, src: '/images/gallery/5.jpg', alt: '웨딩 사진 5' },
  { id: 6, src: '/images/gallery/6.jpg', alt: '웨딩 사진 6' },
];

export default function Gallery() {
  const [selectedImage, setSelectedImage] = React.useState<number | null>(null);

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
            transition={{ delay: image.id * 0.2 }}
            className="relative aspect-square cursor-pointer overflow-hidden rounded-lg"
            onClick={() => setSelectedImage(image.id)}
          >
            <div className="relative w-full h-full">
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400">
                {`사진 ${image.id}`}
              </div>
            </div>
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
            className="relative max-w-4xl w-full aspect-[3/2] bg-white rounded-lg"
          >
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              클릭한 사진이 크게 표시됩니다
            </div>
            <button
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              닫기
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
} 