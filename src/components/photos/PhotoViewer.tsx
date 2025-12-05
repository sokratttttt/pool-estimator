'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePhotos } from '@/context/PhotoContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface Photo {
    id: string;
    file_path: string;
    caption?: string;
    uploaded_at: string;
}

interface PhotoViewerProps {
    photos: Photo[];
    selectedPhoto: Photo | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function PhotoViewer({ photos, selectedPhoto, isOpen, onClose }: PhotoViewerProps) {
    const { getPhotoUrl } = usePhotos();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
        if (selectedPhoto && photos.length > 0) {
            const index = photos.findIndex(p => p.id === selectedPhoto.id);
            if (index !== -1) {
                setCurrentIndex(index);
            }
        }
    }, [selectedPhoto, photos]);

    useEffect(() => {
        // Reset zoom when image changes
        setZoom(1);
    }, [currentIndex]);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev: number) => (prev > 0 ? prev - 1 : photos.length - 1));
    }, [photos.length]);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev: number) => (prev < photos.length - 1 ? prev + 1 : 0));
    }, [photos.length]);

    const handleZoomIn = useCallback(() => {
        setZoom(prev => Math.min(prev + 0.5, 3));
    }, []);

    const handleZoomOut = useCallback(() => {
        setZoom(prev => Math.max(prev - 0.5, 1));
    }, []);

    const formatDate = useCallback((dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }, []);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        } else if (e.key === 'ArrowLeft') {
            handlePrev();
        } else if (e.key === 'ArrowRight') {
            handleNext();
        }
    }, [onClose, handlePrev, handleNext]);

    useEffect(() => {
        if (!isOpen) return;

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleKeyDown]);

    const handlePrevClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        handlePrev();
    }, [handlePrev]);

    const handleNextClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        handleNext();
    }, [handleNext]);

    const handleZoomOutClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        handleZoomOut();
    }, [handleZoomOut]);

    const handleZoomInClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        handleZoomIn();
    }, [handleZoomIn]);

    const handleImageClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
    }, []);

    if (!isOpen || photos.length === 0) return null;

    const currentPhoto = photos[currentIndex];
    const photoUrl = getPhotoUrl(currentPhoto?.file_path);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
                    onClick={onClose}
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
                        aria-label="Закрыть просмотрщик"
                    >
                        <X className="text-white" />
                    </button>

                    {/* Navigation */}
                    {photos.length > 1 && (
                        <>
                            <button
                                onClick={handlePrevClick}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
                                aria-label="Предыдущее фото"
                            >
                                <ChevronLeft className="text-white" size={24} />
                            </button>
                            <button
                                onClick={handleNextClick}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
                                aria-label="Следующее фото"
                            >
                                <ChevronRight className="text-white" size={24} />
                            </button>
                        </>
                    )}

                    {/* Zoom controls */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 z-10">
                        <button
                            onClick={handleZoomOutClick}
                            disabled={zoom <= 1}
                            className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Уменьшить масштаб"
                        >
                            <ZoomOut className="text-white" size={18} />
                        </button>
                        <span className="text-white text-sm font-medium min-w-[3ch] text-center">
                            {Math.round(zoom * 100)}%
                        </span>
                        <button
                            onClick={handleZoomInClick}
                            disabled={zoom >= 3}
                            className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Увеличить масштаб"
                        >
                            <ZoomIn className="text-white" size={18} />
                        </button>
                    </div>

                    {/* Image */}
                    <div
                        className="flex items-center justify-center w-full h-full p-16"
                        onClick={handleImageClick}
                    >
                        <motion.img
                            key={currentPhoto?.id}
                            src={photoUrl || ''}
                            alt={currentPhoto?.caption || 'Фото'}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: zoom }}
                            transition={{ duration: 0.3 }}
                            className="max-w-full max-h-full object-contain cursor-zoom-in"
                            style={{
                                transformOrigin: 'center center'
                            }}
                        />
                    </div>

                    {/* Info */}
                    <div className="absolute bottom-4 right-4 max-w-md bg-white/10 backdrop-blur-sm rounded-xl p-4 text-white">
                        {currentPhoto?.caption && (
                            <p className="font-medium mb-2">{currentPhoto.caption}</p>
                        )}
                        <p className="text-sm text-white/70">
                            {currentPhoto?.uploaded_at ? formatDate(currentPhoto.uploaded_at) : ''}
                        </p>
                        {photos.length > 1 && (
                            <p className="text-xs text-white/50 mt-2">
                                {currentIndex + 1} из {photos.length}
                            </p>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}