"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Photo {
    id: string;
    url: string;
    caption: string;
    timestamp: number;
}

export default function SharedGallery() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load photos from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("shared_gallery_photos");
        if (saved) {
            setPhotos(JSON.parse(saved));
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // In a real app, we would upload to Firebase/S3 here.
        // For this demo, we'll convert to Base64 to store locally.
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            const newPhoto: Photo = {
                id: Date.now().toString(),
                url: base64,
                caption: "Wedding Moment",
                timestamp: Date.now(),
            };

            const updatedPhotos = [newPhoto, ...photos];
            setPhotos(updatedPhotos);
            try {
                localStorage.setItem("shared_gallery_photos", JSON.stringify(updatedPhotos));
            } catch (err) {
                alert("저장 공간이 부족하여 사진을 저장할 수 없습니다. (데모 버전 제한)");
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="p-4">
            <div className="mb-8 text-center space-y-2">
                <p className="font-serif text-charcoal/80 text-sm leading-relaxed">
                    결혼식의 소중한 순간들을<br />
                    함께 공유해주세요.
                </p>
            </div>

            {/* Upload Button */}
            <div className="mb-8 flex justify-center">
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 bg-charcoal text-white px-6 py-3 rounded-full hover:bg-gold transition-colors font-serif text-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    사진 올리기
                </button>
            </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-2 gap-4">
                <AnimatePresence>
                    {photos.map((photo) => (
                        <motion.div
                            key={photo.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            layout
                            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 shadow-sm"
                        >
                            <img
                                src={photo.url}
                                alt="Shared moment"
                                className="w-full h-full object-cover"
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {photos.length === 0 && (
                <div className="py-20 text-center text-gray-400 font-serif text-sm">
                    <p>아직 공유된 사진이 없습니다.</p>
                    <p>첫 번째 사진을 올려주세요!</p>
                </div>
            )}
        </div>
    );
}
