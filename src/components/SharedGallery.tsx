"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/services/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { uploadImageToImgBB } from '@/services/imgbb';

interface Photo {
    id: string;
    url: string;
    thumbUrl?: string;
    caption: string;
    uploaderName?: string;
    timestamp: any;
}

interface SharedGalleryProps {
    collectionName?: string;
    title?: React.ReactNode;
}

export default function SharedGallery({
    collectionName = "gallery_photos",
    title = <>결혼식의 소중한 순간들을<br />함께 공유해주세요.</>
}: SharedGalleryProps) {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [uploaderName, setUploaderName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load photos from Firestore
    useEffect(() => {
        const q = query(collection(db, collectionName), orderBy("timestamp", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newPhotos = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Photo[];
            setPhotos(newPhotos);
        });

        // Load saved name
        const savedName = localStorage.getItem('uploader_name');
        if (savedName) setUploaderName(savedName);

        return () => unsubscribe();
    }, [collectionName]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setUploaderName(name);
        localStorage.setItem('uploader_name', name);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (!uploaderName.trim()) {
            alert("사진을 올리려면 이름을 입력해주세요!");
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setIsUploading(true);
        setUploadProgress({ current: 0, total: files.length });

        try {
            for (let i = 0; i < files.length; i++) {
                setUploadProgress(prev => ({ ...prev, current: i + 1 }));
                const file = files[i];

                // 1. Upload to ImgBB
                const { url, thumbUrl } = await uploadImageToImgBB(file);

                // 2. Save URL to Firestore
                await addDoc(collection(db, collectionName), {
                    url: url,
                    thumbUrl: thumbUrl,
                    caption: "Wedding Moment",
                    uploaderName: uploaderName,
                    timestamp: serverTimestamp(),
                });
            }
        } catch (err) {
            console.error("Upload failed:", err);
            alert("사진 업로드에 실패했습니다.");
        } finally {
            setIsUploading(false);
            setUploadProgress({ current: 0, total: 0 });
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="p-4 min-h-screen bg-white">
            <div className="mb-8 text-center space-y-2">
                <p className="font-serif text-charcoal/80 text-sm leading-relaxed">
                    {title}
                </p>
            </div>

            {/* Upload Section */}
            <div className="mb-8 flex flex-col items-center gap-4 sticky top-4 z-10 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-100">
                <input
                    type="text"
                    placeholder="이름을 입력해주세요"
                    value={uploaderName}
                    onChange={handleNameChange}
                    className="w-48 px-4 py-2 text-center border-b border-gray-300 focus:border-gold outline-none font-serif text-sm bg-transparent placeholder-gray-400"
                    maxLength={10}
                />

                <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-2 bg-charcoal text-white px-6 py-3 rounded-full hover:bg-gold transition-colors font-serif text-sm disabled:opacity-80 shadow-md w-full justify-center sm:w-auto"
                >
                    {isUploading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>{uploadProgress.current}/{uploadProgress.total} 업로드 중...</span>
                        </div>
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
            <div className="grid grid-cols-3 gap-1">
                <AnimatePresence>
                    {photos.map((photo) => (
                        <motion.div
                            key={photo.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            layout
                            className="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer group"
                            onClick={() => setSelectedPhoto(photo)}
                        >
                            <img
                                src={photo.thumbUrl || photo.url}
                                alt="Shared moment"
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                            />
                            {photo.uploaderName && (
                                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                    <p className="text-white text-[10px] font-serif text-right truncate">
                                        by {photo.uploaderName}
                                    </p>
                                </div>
                            )}
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

            {/* Lightbox */}
            <AnimatePresence>
                {selectedPhoto && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <button
                            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-50"
                            onClick={() => setSelectedPhoto(null)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <motion.img
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            src={selectedPhoto.url}
                            alt="Full size"
                            className="max-w-full max-h-[85vh] object-contain rounded-sm"
                            onClick={(e) => e.stopPropagation()}
                        />

                        {selectedPhoto.uploaderName && (
                            <div className="absolute bottom-8 left-0 right-0 text-center">
                                <p className="text-white/80 font-serif text-sm">
                                    Uploaded by {selectedPhoto.uploaderName}
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
