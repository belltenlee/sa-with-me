"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/services/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { uploadImageToCloudinary } from '@/services/cloudinary';
import { uploadImageToImgBB } from '@/services/imgbb';
import { compressImage } from '@/utils/imageCompression';

interface Photo {
    id: string;
    url: string;
    originalUrl?: string;
    thumbUrl?: string;
    caption: string;
    uploaderName?: string;
    timestamp: any;
    provider?: 'imgbb' | 'cloudinary';
    public_id?: string;
    resource_type?: string;
    format?: string;
    width?: number;
    height?: number;
}

interface SharedGalleryProps {
    collectionName?: string;
    title?: React.ReactNode;
    uploadProvider?: 'imgbb' | 'cloudinary';
}

export default function SharedGallery({
    collectionName = "gallery_photos",
    title = <>결혼식의 소중한 순간들을<br />함께 공유해주세요.</>,
    uploadProvider = 'imgbb',
}: SharedGalleryProps) {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [uploaderName, setUploaderName] = useState('');
    const [direction, setDirection] = useState(0);
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

    // Navigation functions
    const goToNext = () => {
        if (!selectedPhoto) return;
        const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
        if (currentIndex < photos.length - 1) {
            setDirection(1);
            setSelectedPhoto(photos[currentIndex + 1]);
        }
    };

    const goToPrev = () => {
        if (!selectedPhoto) return;
        const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id);
        if (currentIndex > 0) {
            setDirection(-1);
            setSelectedPhoto(photos[currentIndex - 1]);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        if (!selectedPhoto) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') {
                goToNext();
            } else if (e.key === 'ArrowLeft') {
                goToPrev();
            } else if (e.key === 'Escape') {
                setSelectedPhoto(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedPhoto, photos]);

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

                // 1. Upload to selected provider (default: ImgBB)
                let url: string;
                let thumbUrl: string | undefined;

                let public_id: string | undefined;
                let resource_type: string | undefined;
                let format: string | undefined;
                let width: number | undefined;
                let height: number | undefined;
                let originalUrl: string | undefined;

                if (uploadProvider === 'cloudinary') {
                    const res = await uploadImageToCloudinary(file);
                    url = res.url;
                    thumbUrl = res.thumbUrl;
                    public_id = res.public_id;
                    resource_type = res.resource_type;
                    format = res.format;
                    width = res.width;
                    height = res.height;
                } else {
                    // ImgBB: Dual upload strategy
                    // 1. Upload Original
                    const originalRes = await uploadImageToImgBB(file);
                    const originalImgBbUrl = originalRes.url;

                    // 2. Compress for display
                    const compressedFile = await compressImage(file, {
                        maxWidth: 1920,
                        quality: 0.8
                    });

                    // 3. Upload Compressed (Display version)
                    const displayRes = await uploadImageToImgBB(compressedFile);

                    url = displayRes.url;
                    thumbUrl = displayRes.thumbUrl;
                    originalUrl = originalImgBbUrl;
                }

                // 2. Save URL and provider metadata to Firestore
                const docData: any = {
                    url: url,
                    thumbUrl: thumbUrl,
                    caption: "Wedding Moment",
                    uploaderName: uploaderName,
                    provider: uploadProvider,
                    public_id: public_id,
                    resource_type: resource_type,
                    format: format,
                    width: width,
                    height: height,
                    timestamp: serverTimestamp(),
                };

                if (originalUrl) {
                    docData.originalUrl = originalUrl;
                }

                await addDoc(collection(db, collectionName), docData);
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
            <AnimatePresence initial={false} custom={direction}>
                {selectedPhoto && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
                            {/* Previous Button */}
                            {photos.findIndex(p => p.id === selectedPhoto.id) > 0 && (
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
                                key={selectedPhoto.id}
                                custom={direction}
                                initial={{
                                    x: direction > 0 ? 1000 : -1000,
                                    opacity: 0,
                                }}
                                animate={{
                                    x: 0,
                                    opacity: 1,
                                }}
                                exit={{
                                    x: direction < 0 ? 1000 : -1000,
                                    opacity: 0,
                                }}
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
                                className="flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <img
                                    src={selectedPhoto.url}
                                    alt="Full size"
                                    className="max-w-full max-h-[85vh] object-contain rounded-sm select-none pointer-events-none"
                                    style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                                />
                                {selectedPhoto.uploaderName && (
                                    <div className="mt-4">
                                        <p className="text-white/80 font-serif text-sm">
                                            Uploaded by {selectedPhoto.uploaderName}
                                        </p>
                                    </div>
                                )}
                            </motion.div>

                            {/* Next Button */}
                            {photos.findIndex(p => p.id === selectedPhoto.id) < photos.length - 1 && (
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
                                className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-50"
                                onClick={() => setSelectedPhoto(null)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Image Counter */}
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/80 text-sm">
                                {photos.findIndex(p => p.id === selectedPhoto.id) + 1} / {photos.length}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
