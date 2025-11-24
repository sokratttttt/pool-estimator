'use client';
import { motion } from 'framer-motion';
import { MapPin, Calendar, DollarSign } from 'lucide-react';
import AppleCard from '../../components/apple/AppleCard';
import ImageGallery from '../../components/ImageGallery';

export default function GalleryPage() {
    // Sample projects data
    const projects = [
        {
            id: 1,
            title: 'Загородный дом в Подмосковье',
            location: 'Московская область',
            date: 'Июнь 2024',
            size: '8×4×1.5м',
            volume: '48 м³',
            cost: '2 450 000 ₽',
            type: 'Бетонный бассейн',
            description: 'Современный бетонный бассейн с системой подогрева и автоматической очисткой',
            images: [
                { src: 'https://placehold.co/800x600', alt: 'Готовый бассейн', label: 'Общий вид' },
                { src: 'https://placehold.co/800x600', alt: 'Зона отдыха', label: 'Зона отдыха' },
                { src: 'https://placehold.co/800x600', alt: 'Ночная подсветка', label: 'Вечернее освещение' },
            ],
        },
        {
            id: 2,
            title: 'Композитная чаша LUXOR',
            location: 'Санкт-Петербург',
            date: 'Май 2024',
            size: '7.5×3.7×1.5м',
            volume: '42 м³',
            cost: '1 890 000 ₽',
            type: 'Композитный бассейн',
            description: 'Быстрая установка композитной чаши с полным комплектом оборудования',
            images: [
                { src: 'https://placehold.co/800x600', alt: 'Композитная чаша', label: 'Установленная чаша' },
                { src: 'https://placehold.co/800x600', alt: 'Оборудование', label: 'Техническое помещение' },
            ],
        },
        {
            id: 3,
            title: 'Семейный бассейн',
            location: 'Краснодар',
            date: 'Апрель 2024',
            size: '10×5×1.8м',
            volume: '90 м³',
            cost: '3 200 000 ₽',
            type: 'Бетонный бассейн',
            description: 'Просторный бассейн для всей семьи с детской зоной',
            images: [
                { src: 'https://placehold.co/800x600', alt: 'Семейный бассейн', label: 'Панорама' },
                { src: 'https://placehold.co/800x600', alt: 'Детская зона', label: 'Мелкая часть' },
                { src: 'https://placehold.co/800x600', alt: 'Лестница', label: 'Римская лестница' },
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-apple-bg-primary">
            <div className="apple-container apple-section">
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="apple-heading-1 mb-4">Галерея проектов</h1>
                        <p className="apple-body-secondary max-w-2xl mx-auto">
                            Примеры наших реализованных проектов. Вдохновляйтесь и создавайте свой идеальный бассейн.
                        </p>
                    </motion.div>
                </div>

                {/* Projects */}
                <div className="space-y-12 max-w-6xl mx-auto">
                    {projects.map((project, index) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <AppleCard>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Images */}
                                    <div>
                                        <ImageGallery images={project.images} />
                                    </div>

                                    {/* Info */}
                                    <div>
                                        <h2 className="apple-heading-2 mb-3">{project.title}</h2>
                                        <p className="apple-body-secondary mb-6">{project.description}</p>

                                        {/* Details */}
                                        <div className="space-y-4 mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                    <MapPin size={20} className="text-apple-primary" />
                                                </div>
                                                <div>
                                                    <p className="apple-caption">Локация</p>
                                                    <p className="apple-body font-medium">{project.location}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                                    <Calendar size={20} className="text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="apple-caption">Дата завершения</p>
                                                    <p className="apple-body font-medium">{project.date}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                                    <DollarSign size={20} className="text-purple-600" />
                                                </div>
                                                <div>
                                                    <p className="apple-caption">Стоимость</p>
                                                    <p className="apple-heading-3 text-apple-primary">{project.cost}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Specs */}
                                        <div className="grid grid-cols-2 gap-4 p-4 bg-apple-bg-secondary rounded-lg">
                                            <div>
                                                <p className="apple-caption mb-1">Тип</p>
                                                <p className="apple-body font-medium">{project.type}</p>
                                            </div>
                                            <div>
                                                <p className="apple-caption mb-1">Размеры</p>
                                                <p className="apple-body font-medium">{project.size}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="apple-caption mb-1">Объем</p>
                                                <p className="apple-body font-medium">{project.volume}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </AppleCard>
                        </motion.div>
                    ))}
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-16 text-center"
                >
                    <AppleCard className="max-w-2xl mx-auto">
                        <h3 className="apple-heading-2 mb-4">Готовы создать свой проект?</h3>
                        <p className="apple-body-secondary mb-6">
                            Используйте наш калькулятор для расчета стоимости вашего бассейна
                        </p>
                        <a href="/calculator">
                            <button className="apple-btn apple-btn-primary apple-btn-lg">
                                Создать смету
                            </button>
                        </a>
                    </AppleCard>
                </motion.div>
            </div>
        </div>
    );
}
