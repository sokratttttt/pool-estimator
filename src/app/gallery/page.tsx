'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, Image as ImageIcon, Search } from 'lucide-react';
import Image from 'next/image';
import { EmptyState } from '@/components/ui';

interface GalleryImage {
    src: string;
    title: string;
    category: string;
}

// Map of file names to display names or categories if needed
// For now, we'll just display them in a grid
const galleryImages: GalleryImage[] = [
    { src: '/completed-pools/iqpools/allegro.jpg', title: 'Allegro', category: 'IQ Pools' },
    { src: '/completed-pools/iqpools/forte.jpg', title: 'Forte', category: 'IQ Pools' },
    { src: '/completed-pools/iqpools/gamma.jpg', title: 'Gamma', category: 'IQ Pools' },
    { src: '/completed-pools/iqpools/kvadro.jpg', title: 'Kvadro', category: 'IQ Pools' },
    { src: '/completed-pools/iqpools/kvartet.jpg', title: 'Kvartet', category: 'IQ Pools' },
    { src: '/completed-pools/iqpools/legato.jpg', title: 'Legato', category: 'IQ Pools' },
    { src: '/completed-pools/iqpools/marsh.jpg', title: 'Marsh', category: 'IQ Pools' },
    { src: '/completed-pools/iqpools/okeanik.jpg', title: 'Okeanik', category: 'IQ Pools' },
    { src: '/completed-pools/iqpools/rim.jpg', title: 'Rim', category: 'IQ Pools' },
    { src: '/completed-pools/iqpools/rondo.jpg', title: 'Rondo', category: 'IQ Pools' },
    { src: '/completed-pools/iqpools/royal.jpg', title: 'Royal', category: 'IQ Pools' },
    { src: '/completed-pools/iqpools/skandi.jpg', title: 'Skandi', category: 'IQ Pools' },
    { src: '/completed-pools/iqpools/temp.jpg', title: 'Temp', category: 'IQ Pools' },
    { src: '/completed-pools/iqpools/tertsiya.jpg', title: 'Tertsiya', category: 'IQ Pools' },
    { src: '/completed-pools/iqpools/vivo.jpg', title: 'Vivo', category: 'IQ Pools' },
    { src: '/completed-pools/sanjuan/classic-8537.jpg', title: 'Classic', category: 'San Juan' },
    { src: '/completed-pools/sanjuan/ipool-12037.jpg', title: 'iPool', category: 'San Juan' },
    { src: '/completed-pools/sanjuan/luxor-10537.jpg', title: 'Luxor 10537', category: 'San Juan' },
    { src: '/completed-pools/sanjuan/luxor-6536.jpg', title: 'Luxor 6536', category: 'San Juan' },
    { src: '/completed-pools/sanjuan/luxor-7537.jpg', title: 'Luxor 7537', category: 'San Juan' },
    { src: '/completed-pools/sanjuan/luxor-8537.jpg', title: 'Luxor 8537', category: 'San Juan' },
    { src: '/completed-pools/sanjuan/luxor-9537.jpg', title: 'Luxor 9537', category: 'San Juan' },
    { src: '/completed-pools/sanjuan/marathon-10037.jpg', title: 'Marathon 10037', category: 'San Juan' },
    { src: '/completed-pools/sanjuan/marathon-12037.jpg', title: 'Marathon 12037', category: 'San Juan' },
    { src: '/completed-pools/sanjuan/minipool-4025.jpg', title: 'Minipool 4025', category: 'San Juan' },
    { src: '/completed-pools/sanjuan/minipool-4530.jpg', title: 'Minipool 4530', category: 'San Juan' },
    { src: '/completed-pools/sanjuan/minipool-5530.jpg', title: 'Minipool 5530', category: 'San Juan' },
    { src: '/completed-pools/sanjuan/minipool-6330.jpg', title: 'Minipool 6330', category: 'San Juan' },
    { src: '/completed-pools/sanjuan/quick-5025.jpg', title: 'Quick 5025', category: 'San Juan' },
    { src: '/completed-pools/sanjuan/quick-6025.jpg', title: 'Quick 6025', category: 'San Juan' },
    { src: '/completed-pools/sanjuan/quick-7025.jpg', title: 'Quick 7025', category: 'San Juan' },
    { src: '/completed-pools/sanjuan/rio-7737.jpg', title: 'Rio 7737', category: 'San Juan' },
    { src: '/completed-pools/sanjuan/rio-8737.jpg', title: 'Rio 8737', category: 'San Juan' },
    { src: '/completed-pools/sanjuan/rio-9737.jpg', title: 'Rio 9737', category: 'San Juan' },
    { src: '/completed-pools/sanjuan/spa-2424.jpg', title: 'SPA 2424', category: 'San Juan' },
    { src: '/completed-pools/sanjuan/spa-4025.jpg', title: 'SPA 4025', category: 'San Juan' },
    { src: '/completed-pools/sanjuan/spa-4525.jpg', title: 'SPA 4525', category: 'San Juan' },
    { src: '/completed-pools/sanjuan/spa-5030.jpg', title: 'SPA 5030', category: 'San Juan' },
    { src: '/completed-pools/sanjuan/splash-1818.jpg', title: 'Splash 1818', category: 'San Juan' },
    { src: '/completed-pools/sanjuan/splash-1922.jpg', title: 'Splash 1922', category: 'San Juan' },
];

export default function GalleryPage() {
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

    const categories = ['All', ...Array.from(new Set(galleryImages.map(img => img.category)))];

    const filteredImages = useMemo(() => {
        return galleryImages.filter(img => {
            const matchesCategory = filter === 'All' || img.category === filter;
            const matchesSearch = img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                img.category.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [filter, searchQuery]);

    const handleReset = () => {
        setFilter('All');
        setSearchQuery('');
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Галерея выполненных работ</h1>
                    <p className="text-gray-600">Примеры реализации наших бассейнов</p>
                </div>

                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-6 mb-8 items-start md:items-center justify-between">
                    {/* Filters */}
                    <div className="flex gap-2 overflow-x-auto pb-2 max-w-full md:max-w-2xl no-scrollbar">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setFilter(category)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filter === category
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="w-full md:w-64 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Поиск..."
                            value={searchQuery}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        />
                    </div>
                </div>

                {/* Grid */}
                {filteredImages.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredImages.map((image: GalleryImage, index: number) => (
                            <motion.div
                                key={image.src}
                                layoutId={image.src}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group relative aspect-[4/3] bg-gray-200 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                                onClick={() => setSelectedImage(image)}
                            >
                                <Image
                                    src={image.src}
                                    alt={image.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <p className="text-white font-medium">{image.title}</p>
                                    <p className="text-white/80 text-sm">{image.category}</p>
                                </div>
                                <div className="absolute top-4 right-4 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                                    <ZoomIn className="w-5 h-5 text-gray-700" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12">
                        <EmptyState
                            icon={<ImageIcon size={64} />}
                            title="Фотографии не найдены"
                            description="Попробуйте изменить параметры поиска или выбрать другую категорию"
                            action={{
                                label: 'Сбросить фильтры',
                                onClick: handleReset,
                                variant: 'primary'
                            }}
                        />
                    </div>
                )}

                {/* Lightbox */}
                <AnimatePresence>
                    {selectedImage && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
                            onClick={() => setSelectedImage(null)}
                        >
                            <motion.div
                                layoutId={selectedImage.src}
                                className="relative max-w-5xl w-full max-h-[90vh] aspect-[4/3] rounded-lg overflow-hidden"
                                onClick={e => e.stopPropagation()}
                            >
                                <Image
                                    src={selectedImage.src}
                                    alt={selectedImage.title}
                                    fill
                                    className="object-contain"
                                />
                                <button
                                    onClick={() => setSelectedImage(null)}
                                    className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                                    <h2 className="text-2xl font-bold text-white mb-1">{selectedImage.title}</h2>
                                    <p className="text-white/80">{selectedImage.category}</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
