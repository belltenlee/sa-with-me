"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/services/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { uploadImageToImgBB } from '@/services/imgbb';

interface Photo {
    id: string;
    url: string;
    caption: string;
    timestamp: any;
}

export default function SharedGallery() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load photos from Firestore
    useEffect(() => {
        const q = query(collection(db, "gallery_photos"), orderBy("timestamp", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newPhotos = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Photo[];
            setPhotos(newPhotos);
        });

        return () => unsubscribe();
    }, []);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // 1. Upload to ImgBB
            const imageUrl = await uploadImageToImgBB(file);

            // 2. Save URL to Firestore
            await addDoc(collection(db, "gallery_photos"), {
                url: imageUrl,
                caption: "Wedding Moment",
                timestamp: serverTimestamp(),
            });

        } catch (err) {
            console.error("Upload failed:", err);
            alert("사진 업로드에 실패했습니다.");
        } finally {
            setIsUploading(false);
        }
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
                    disabled={isUploading}
                    className="flex items-center gap-2 bg-charcoal text-white px-6 py-3 rounded-full hover:bg-gold transition-colors font-serif text-sm disabled:opacity-50"
                >
                    {isUploading ? (
                        <span>업로드 중...</span>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                            <span>사진 올리기</span>
                        </>
                    )}
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

            {photos.length === 0 && !isUploading && (
                <div className="py-20 text-center text-gray-400 font-serif text-sm">
                    <p>아직 공유된 사진이 없습니다.</p>
                    <p>첫 번째 사진을 올려주세요!</p>
                </div>
            )}
        </div>
    );
}
