'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePhotos } from '@/context/PhotoContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Trash2, Filter } from 'lucide-react';
import Image from 'next/image';
import PhotoViewer from './PhotoViewer';
import type { PhotoData } from '@/types/photo';

const STAGES = [
    { value: 'all', label: 'Все этапы' },
    { value: 'excavation', label: 'Земляные работы' },
    { value: 'foundation', label: 'Фундамент' },
    { value: 'installation', label: 'Установка чаши' },
    { value: 'plumbing', label: 'Сантехника' },
    { value: 'electrical', label: 'Электрика' },
    { value: 'finishing', label: 'Отделка' },
    { value: 'completion', label: 'Завершение' },
    { value: 'other', label: 'Другое' },
];

interface PhotoGalleryProps {
    estimateId?: string;
}

export default function PhotoGallery({ estimateId }: PhotoGalleryProps) {
    const { photos, loading, getPhotos, deletePhoto, getPhotoUrl } = usePhotos();
    const [selectedStage, setSelectedStage] = useState<string>('all');
    const [selectedPhoto, setSelectedPhoto] = useState<PhotoData | null>(null);
    const [viewerOpen, setViewerOpen] = useState(false);

    const fetchPhotos = useCallback(async () => {
        if (estimateId) {
            await getPhotos(estimateId);
        }
    }, [estimateId, getPhotos]);

    useEffect(() => {
        fetchPhotos();
    }, [fetchPhotos]);

    const handleDelete = useCallback(async (photoId: string, e: React.MouseEvent) => {
        e.stopPropagation();

        if (!confirm('Удалить это фото?')) return;

        await deletePhoto(photoId);
    }, [deletePhoto]);

    const handlePhotoClick = useCallback((photo: PhotoData) => {
        setSelectedPhoto(photo);
        setViewerOpen(true);
    }, []);

    const handleCloseViewer = useCallback(() => {
        setViewerOpen(false);
        setSelectedPhoto(null);
    }, []);

    const handleStageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedStage(e.target.value);
    }, []);

    const filteredPhotos = selectedStage === 'all'
        ? photos
        : photos.filter(p => p.stage === selectedStage);

    if (loading && photos.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apple-accent"></div>
            </div>
        );
    }

    if (photos.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-apple-bg-secondary flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-apple-text-tertiary" />
                </div>
                <p className="text-apple-text-secondary">
                    Фотографии ещё не загружены
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filter */}
            <div className="flex items-center gap-2">
                <Filter size={16} className="text-apple-text-secondary" />
                <select
                    value={selectedStage}
                    onChange={handleStageChange}
                    className="px-3 py-1.5 bg-apple-bg-secondary border border-apple-border rounded-lg text-sm text-apple-text-primary focus:outline-none focus:border-apple-accent"
                >
                    {STAGES.map(s => (
                        <option key={s.value} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </select>
                <span className="text-sm text-apple-text-tertiary">
                    {filteredPhotos.length} фото
                </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredPhotos.map((photo: PhotoData, index: number) => {
                        const photoUrl = getPhotoUrl(photo.file_path);
                        const stageLabel = STAGES.find(s => s.value === photo.stage)?.label || photo.stage;

                        return (
                            <motion.div
                                key={photo.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => handlePhotoClick(photo)}
                                className="group relative aspect-square rounded-xl overflow-hidden border border-apple-border hover:border-apple-accent cursor-pointer transition-all"
                            >
                                {/* Image */}
                                <Image
                                    src={photoUrl || ''}
                                    alt={photo.caption || 'Фото проекта'}
                                    fill
                                    className="object-cover transition-transform group-hover:scale-110"
                                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                />

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                    {/* Caption */}
                                    {photo.caption && (
                                        <div className="absolute bottom-0 left-0 right-0 p-3">
                                            <p className="text-white text-sm font-medium line-clamp-2">
                                                {photo.caption}
                                            </p>
                                        </div>
                                    )}

                                    {/* Delete button */}
                                    <button
                                        onClick={(e) => handleDelete(photo.id, e)}
                                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
                                        aria-label="Удалить фото"
                                    >
                                        <Trash2 size={14} className="text-white" />
                                    </button>
                                </div>

                                {/* Stage badge */}
                                <div className="absolute top-2 left-2">
                                    <span className="px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
                                        {stageLabel}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Viewer */}
            <PhotoViewer
                photos={filteredPhotos}
                selectedPhoto={selectedPhoto}
                isOpen={viewerOpen}
                onClose={handleCloseViewer}
            />
        </div>
    );
}