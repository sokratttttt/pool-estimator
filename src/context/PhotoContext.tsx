'use client';

import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type { PhotoContextType, PhotoData } from '@/types/photo';

const PhotoContext = createContext<PhotoContextType | null>(null);

export function PhotoProvider({ children }: { children: React.ReactNode }) {
    const [photos, setPhotos] = useState<PhotoData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Загрузка фотографий для конкретной сметы
    const getPhotos = async (estimateId: string): Promise<PhotoData[]> => {
        if (!estimateId) return [];

        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase
                .from('project_photos')
                .select('*')
                .eq('estimate_id', estimateId)
                .order('uploaded_at', { ascending: false });

            if (error) throw error;

            setPhotos(data || []);
            return data || [];
        } catch (err: any) {
            console.error('Error fetching photos:', err);
            setError(err.message);
            toast.error('Ошибка загрузки фотографий');
            return [];
        } finally {
            setLoading(false);
        }
    };

    // Загрузка фото в Storage и сохранение метаданных
    const uploadPhoto = async (estimateId: string, file: File, caption: string = '', stage: string = 'other'): Promise<PhotoData | null> => {
        if (!estimateId || !file) {
            toast.error('Не указана смета или файл');
            return null;
        }

        // Валидация размера (макс 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            toast.error('Файл слишком большой. Максимум 5MB');
            return null;
        }

        // Валидация формата
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Неподдерживаемый формат. Используйте JPG, PNG или WebP');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('Необходима авторизация');
                return null;
            }

            // Генерируем уникальное имя файла
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${estimateId}/${user.id}/${fileName}`;

            // Загружаем файл в Storage
            const { error: uploadError } = await supabase.storage
                .from('project-photos')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            // Сохраняем метаданные в БД
            const { data: photoData, error: dbError } = await supabase
                .from('project_photos')
                .insert({
                    estimate_id: estimateId,
                    file_path: filePath,
                    caption: caption,
                    stage: stage,
                    uploaded_by: user.id
                })
                .select()
                .single();

            if (dbError) {
                // Если не удалось сохранить в БД, удаляем файл из Storage
                await supabase.storage.from('project-photos').remove([filePath]);
                throw dbError;
            }

            // Обновляем локальное состояние
            setPhotos(prev => [photoData, ...prev]);
            toast.success('Фото успешно загружено');
            return photoData;

        } catch (err: any) {
            console.error('Error uploading photo:', err);
            setError(err.message);
            toast.error('Ошибка загрузки фото');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Удаление фото
    const deletePhoto = async (photoId: string): Promise<boolean> => {
        if (!photoId) return false;

        setLoading(true);
        setError(null);

        try {
            // Получаем метаданные фото
            const { data: photo, error: fetchError } = await supabase
                .from('project_photos')
                .select('file_path, uploaded_by')
                .eq('id', photoId)
                .single();

            if (fetchError) throw fetchError;

            // Проверяем, что пользователь - владелец
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || user.id !== photo.uploaded_by) {
                toast.error('Вы можете удалять только свои фото');
                return false;
            }

            // Удаляем из БД
            const { error: dbError } = await supabase
                .from('project_photos')
                .delete()
                .eq('id', photoId);

            if (dbError) throw dbError;

            // Удаляем из Storage
            const { error: storageError } = await supabase.storage
                .from('project-photos')
                .remove([photo.file_path]);

            if (storageError) {
                console.warn('Storage deletion failed:', storageError);
            }

            // Обновляем локальное состояние
            setPhotos(prev => prev.filter(p => p.id !== photoId));
            toast.success('Фото удалено');
            return true;

        } catch (err: any) {
            console.error('Error deleting photo:', err);
            setError(err.message);
            toast.error('Ошибка удаления фото');
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Получение публичного URL фото
    const getPhotoUrl = (filePath: string): string | null => {
        if (!filePath) return null;

        const { data } = supabase.storage
            .from('project-photos')
            .getPublicUrl(filePath);

        return data?.publicUrl || null;
    };

    const value: PhotoContextType = {
        photos,
        loading,
        error,
        getPhotos,
        uploadPhoto,
        deletePhoto,
        getPhotoUrl
    };

    return (
        <PhotoContext.Provider value={value}>
            {children}
        </PhotoContext.Provider>
    );
}

export function usePhotos() {
    const context = useContext(PhotoContext);
    if (!context) {
        throw new Error('usePhotos must be used within a PhotoProvider');
    }
    return context;
}
