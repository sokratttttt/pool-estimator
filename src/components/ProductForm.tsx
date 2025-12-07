'use client';
import { useState } from 'react';
import NextImage from 'next/image';
import { motion } from 'framer-motion';
import { X, Upload } from 'lucide-react';
import AppleButton from './apple/AppleButton';
import AppleInput from './apple/AppleInput';

import { useCatalog } from '@/context/CatalogContext';
import { toast } from 'sonner';

import { Product } from '@/types/index';

interface ProductFormProps {
    product?: Product;
    onClose?: () => void;
}

export default function ProductForm({ product, onClose }: ProductFormProps) {
    const { addProduct, updateProduct } = useCatalog();
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || '',
        category: product?.category || 'bowls',
        image: product?.image || '',
        unit: product?.unit || 'шт',
    });
    const [imagePreview, setImagePreview] = useState(product?.image || '');
    const [isDragging, setIsDragging] = useState(false);

    const categories = [
        { id: 'bowls', label: 'Чаши' },
        { id: 'filtration', label: 'Фильтрация' },
        { id: 'heating', label: 'Подогрев' },
        { id: 'parts', label: 'Закладные' },
        { id: 'accessories', label: 'Аксессуары' },
        { id: 'chemicals', label: 'Химия' },
    ];

    const processFile = (file: File) => {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Файл слишком большой (макс. 5MB)');
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            toast.error('Можно загружать только изображения');
            return;
        }

        // Create image element to compress
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e: ProgressEvent<FileReader>) => {
            if (typeof e.target?.result === 'string') {
                img.src = e.target.result;
            }
        };

        img.onload = () => {
            // Create canvas for compression
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Calculate new dimensions (max 800px)
            const maxSize = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxSize) {
                    height = (height * maxSize) / width;
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width = (width * maxSize) / height;
                    height = maxSize;
                }
            }

            canvas.width = width;
            canvas.height = height;

            // Draw and compress
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to JPEG with quality 0.8 to reduce size
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);

            // Check final size (base64 strings are ~33% larger, so max ~2MB final)
            const sizeInMB = (compressedBase64.length * 0.75) / (1024 * 1024);
            if (sizeInMB > 2) {
                toast.error('Изображение слишком большое даже после сжатия. Попробуйте другое.');
                return;
            }

            setImagePreview(compressedBase64);
            setFormData(prev => ({ ...prev, image: compressedBase64 }));
            toast.success('Изображение загружено');
        };

        img.onerror = () => {
            toast.error('Не удалось загрузить изображение');
        };

        reader.readAsDataURL(file);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            processFile(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.price) {
            toast.error('Заполните обязательные поля');
            return;
        }

        const productData = {
            ...formData,
            price: parseFloat(String(formData.price)),
        };

        // Log image size for debugging
        if (productData.image) {
            const sizeInKB = (productData.image.length * 0.75) / 1024;
            if (process.env.NODE_ENV === 'development') {
            }

            if (sizeInKB > 2000) {
                toast.error(`Изображение слишком большое: ${(sizeInKB / 1024).toFixed(2)} MB. Попробуйте другое изображение меньшего размера.`);
                return;
            }
        }

        try {
            if (product) {
                updateProduct(product.id, productData);
            } else {
                addProduct(productData);
            }
            onClose?.();
        } catch (error) {
            console.error('Ошибка отправки формы:', error);
            toast.error('Произошла ошибка при сохранении товара');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-apple-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
                <div className="sticky top-0 bg-apple-surface border-b border-apple-border p-6 flex items-center justify-between z-10">
                    <h2 className="apple-heading-2">
                        {product ? 'Редактировать товар' : 'Добавить товар'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-apple-bg-secondary transition-colors"
                    >
                        <X size={24} className="text-apple-text-secondary" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Image Upload */}
                    <div>
                        <label className="apple-body font-medium mb-2 block">
                            Изображение товара
                        </label>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block w-full cursor-pointer">
                                    <div
                                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${isDragging
                                            ? 'border-apple-primary bg-apple-primary/10 scale-105'
                                            : 'border-apple-border hover:border-apple-primary hover:bg-apple-bg-secondary'
                                            }`}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                    >
                                        {imagePreview ? (
                                            <div className="relative w-full h-48">
                                                <NextImage
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    fill
                                                    className="object-contain rounded-lg"
                                                />
                                            </div>
                                        ) : (
                                            <div>
                                                <Upload size={48} className="mx-auto text-apple-text-tertiary mb-2" />
                                                <p className="apple-body-secondary">
                                                    {isDragging ? 'Отпустите файл' : 'Перетащите или нажмите для загрузки'}
                                                </p>
                                                <p className="apple-caption mt-1 text-apple-text-tertiary">
                                                    PNG, JPG до 5MB
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Name */}
                    <AppleInput
                        label="Название *"
                        placeholder="Например: Чаша композитная LUXOR 7537"
                        value={formData.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                    />

                    {/* Description */}
                    <div>
                        <label className="apple-body font-medium mb-2 block">
                            Описание
                        </label>
                        <textarea
                            className="apple-input w-full min-h-[100px] resize-none bg-slate-800 text-white border-slate-600 focus:border-blue-400 placeholder-slate-400"
                            placeholder="Описание товара..."
                            value={formData.description}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>

                    {/* Price and Unit */}
                    <div className="grid grid-cols-2 gap-4">
                        <AppleInput
                            type="number"
                            label="Цена *"
                            placeholder="0"
                            value={formData.price}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                            required
                            step="0.01"
                        />
                        <AppleInput
                            label="Единица измерения"
                            placeholder="шт"
                            value={formData.unit}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="apple-body font-medium mb-2 block">
                            Категория *
                        </label>
                        <div className="relative">
                            <select
                                className="apple-input w-full appearance-none cursor-pointer bg-slate-800 text-white border-slate-600 focus:border-blue-400"
                                value={formData.category}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                                required
                            >
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id} className="bg-navy-medium text-white">
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-apple-text-secondary">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </div>
                        </div>
                    </div>


                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-apple-border">
                        <AppleButton
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Отмена
                        </AppleButton>
                        <AppleButton
                            type="submit"
                            variant="primary"
                            className="flex-1"
                        >
                            {product ? 'Сохранить' : 'Добавить'}
                        </AppleButton>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
