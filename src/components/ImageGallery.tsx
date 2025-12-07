'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import Image from 'next/image';

interface GalleryImage {
    src: string;
    alt?: string;
    label?: string;
}

interface ImageGalleryProps {
    images?: GalleryImage[];
    title?: string;
    className?: string;
}

export default function ImageGallery({ images, title, className = '' }: ImageGalleryProps) {
    const [selectedImage, setSelectedImage] = useState<{ src: string; alt?: string; label?: string } | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const openLightbox = (index: number) => {
        if (!images) return;
        setCurrentIndex(index);
        setSelectedImage(images[index]);
    };

    const closeLightbox = () => {
        setSelectedImage(null);
    };

    const nextImage = () => {
        if (!images) return;
        const newIndex = (currentIndex + 1) % images.length;
        setCurrentIndex(newIndex);
        setSelectedImage(images[newIndex]);
    };

    const prevImage = () => {
        if (!images) return;
        const newIndex = (currentIndex - 1 + images.length) % images.length;
        setCurrentIndex(newIndex);
        setSelectedImage(images[newIndex]);
    };

    if (!images || images.length === 0) return null;

    return (
        <div className={className}>
            {title && <h3 className="apple-heading-3 mb-4">{title}</h3>}

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images && images.map((image, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="relative aspect-square rounded-xl overflow-hidden bg-apple-bg-secondary cursor-pointer group"
                        onClick={() => openLightbox(index)}
                    >
                        <Image
                            src={image.src}
                            alt={image.alt || `Image ${index + 1}`}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <ZoomIn
                                size={32}
                                className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                        </div>
                        {image.label && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                                <p className="text-white text-sm font-medium">{image.label}</p>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="relative w-full h-full flex items-center justify-center"
                        >
                            {/* Close Button */}
                            <button
                                onClick={closeLightbox}
                                className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                <X size={24} className="text-white" />
                            </button>

                            {/* Navigation */}
                            {images && images.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                    >
                                        <ChevronLeft size={32} className="text-white" />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                    >
                                        <ChevronRight size={32} className="text-white" />
                                    </button>
                                </>
                            )}

                            {/* Image */}
                            <motion.div
                                key={currentIndex}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="relative max-w-5xl max-h-[80vh] w-full h-full"
                            >
                                <Image
                                    src={selectedImage.src}
                                    alt={selectedImage.alt || 'Image'}
                                    fill
                                    className="object-contain"
                                />
                            </motion.div>

                            {/* Caption */}
                            {selectedImage.label && (
                                <div className="absolute bottom-8 left-0 right-0 text-center">
                                    <p className="text-white text-lg font-medium bg-black/50 inline-block px-6 py-3 rounded-full">
                                        {selectedImage.label}
                                    </p>
                                </div>
                            )}

                            {/* Counter */}
                            {images && images.length > 1 && (
                                <div className="absolute top-4 left-4 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
                                    {currentIndex + 1} / {images.length}
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
