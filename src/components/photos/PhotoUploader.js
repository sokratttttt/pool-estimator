'use client';

import { useState, useRef } from 'react';
import { usePhotos } from '@/context/PhotoContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import AppleButton from '../apple/AppleButton';

const STAGES = [
    { value: 'excavation', label: 'Земляные работы' },
    { value: 'foundation', label: 'Фундамент' },
    { value: 'installation', label: 'Установка чаши' },
    { value: 'plumbing', label: 'Сантехника' },
    { value: 'electrical', label: 'Электрика' },
    { value: 'finishing', label: 'Отделка' },
    { value: 'completion', label: 'Завершение' },
    { value: 'other', label: 'Другое' },
];

export default function PhotoUploader({ estimateId, onUploadComplete, onClose }) {
    const { uploadPhoto, loading } = usePhotos();
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [caption, setCaption] = useState('');
    const [stage, setStage] = useState('other');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = (file) => {
        if (!file) return;

        // Валидация
        const maxSize = 5 * 1024 * 1024;
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (file.size > maxSize) {
            alert('Файл слишком большой. Максимум 5MB');
            return;
        }

        if (!allowedTypes.includes(file.type)) {
            alert('Неподдерживаемый формат. Используйте JPG, PNG или WebP');
            return;
        }

        setSelectedFile(file);

        // Создаем превью
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        handleFileSelect(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        const result = await uploadPhoto(estimateId, selectedFile, caption, stage);

        if (result) {
            // Успешная загрузка
            setSelectedFile(null);
            setPreview(null);
            setCaption('');
            setStage('other');

            if (onUploadComplete) {
                onUploadComplete(result);
            }
            if (onClose) {
                onClose();
            }
        }
    };

    const handleCancel = () => {
        setSelectedFile(null);
        setPreview(null);
        setCaption('');
        setStage('other');
        if (onClose) {
            onClose();
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-apple-text-primary">
                Загрузить фото
            </h3>

            {/* Drop Zone */}
            {!selectedFile ? (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                        border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
                        transition-all duration-200
                        ${isDragging
                            ? 'border-apple-accent bg-apple-accent/5'
                            : 'border-apple-border hover:border-apple-accent/50'
                        }
                    `}
                >
                    <div className="flex flex-col items-center gap-4">
                        <div className={`
                            w-16 h-16 rounded-full flex items-center justify-center
                            ${isDragging ? 'bg-apple-accent' : 'bg-apple-bg-secondary'}
                        `}>
                            <Upload className={`w-8 h-8 ${isDragging ? 'text-white' : 'text-apple-text-secondary'}`} />
                        </div>
                        <div>
                            <p className="text-lg font-medium text-apple-text-primary">
                                Перетащите фото сюда
                            </p>
                            <p className="text-sm text-apple-text-secondary mt-1">
                                или кликните для выбора файла
                            </p>
                            <p className="text-xs text-apple-text-tertiary mt-2">
                                JPG, PNG, WebP • Максимум 5MB
                            </p>
                        </div>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleFileInputChange}
                        className="hidden"
                    />
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    {/* Preview */}
                    <div className="relative rounded-xl overflow-hidden border border-apple-border">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-64 object-cover"
                        />
                        <button
                            onClick={() => {
                                setSelectedFile(null);
                                setPreview(null);
                            }}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
                        >
                            <X size={16} className="text-white" />
                        </button>
                    </div>

                    {/* Caption */}
                    <div>
                        <label className="block text-sm font-medium text-apple-text-secondary mb-2">
                            Описание (необязательно)
                        </label>
                        <input
                            type="text"
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Например: Подготовка котлована"
                            className="w-full px-4 py-2 bg-apple-bg-secondary border border-apple-border rounded-lg text-apple-text-primary placeholder:text-apple-text-tertiary focus:outline-none focus:border-apple-accent"
                        />
                    </div>

                    {/* Stage */}
                    <div>
                        <label className="block text-sm font-medium text-apple-text-secondary mb-2">
                            Этап работы
                        </label>
                        <select
                            value={stage}
                            onChange={(e) => setStage(e.target.value)}
                            className="w-full px-4 py-2 bg-apple-bg-secondary border border-apple-border rounded-lg text-apple-text-primary focus:outline-none focus:border-apple-accent"
                        >
                            {STAGES.map(s => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <AppleButton
                            variant="secondary"
                            onClick={handleCancel}
                            className="flex-1"
                            disabled={loading}
                        >
                            Отмена
                        </AppleButton>
                        <AppleButton
                            variant="primary"
                            onClick={handleUpload}
                            className="flex-1"
                            loading={loading}
                            icon={<Upload size={16} />}
                        >
                            Загрузить
                        </AppleButton>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
