'use client';
import { useState, useEffect } from 'react';
import { Upload, X, Palette } from 'lucide-react';
import AppleCard from './apple/AppleCard';
import AppleButton from './apple/AppleButton';
import AppleInput from './apple/AppleInput';
import { toast } from 'sonner';

export default function PDFSettings() {
    const [settings, setSettings] = useState({
        logo: null,
        logoDataUrl: null,
        primaryColor: '#00b4d8',
        secondaryColor: '#003366',
        companyName: 'MOS-POOL',
        footerText: 'Спасибо за сотрудничество!',
        phone: '+7 (919) 296-16-47',
        email: 'info@mos-pool.ru'
    });

    useEffect(() => {
        const saved = localStorage.getItem('pdf-settings');
        if (saved) {
            try {
                setSettings(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to load PDF settings:', e);
            }
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('pdf-settings', JSON.stringify(settings));
        toast.success('Настройки PDF сохранены');
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Пожалуйста, выберите изображение');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setSettings({
                ...settings,
                logo: file.name,
                logoDataUrl: event.target.result
            });
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveLogo = () => {
        setSettings({
            ...settings,
            logo: null,
            logoDataUrl: null
        });
    };

    const handleReset = () => {
        if (confirm('Сбросить настройки PDF к значениям по умолчанию?')) {
            const defaultSettings = {
                logo: null,
                logoDataUrl: null,
                primaryColor: '#00b4d8',
                secondaryColor: '#003366',
                companyName: 'MOS-POOL',
                footerText: 'Спасибо за сотрудничество!',
                phone: '+7 (919) 296-16-47',
                email: 'info@mos-pool.ru'
            };
            setSettings(defaultSettings);
            localStorage.setItem('pdf-settings', JSON.stringify(defaultSettings));
            toast.success('Настройки сброшены');
        }
    };

    return (
        <AppleCard variant="flat" className="max-w-4xl mx-auto">
            <h2 className="apple-heading-2 mb-6">Настройки PDF</h2>

            <div className="space-y-6">
                {/* Logo Upload */}
                <div>
                    <label className="block text-sm font-medium text-apple-text-primary mb-2">
                        Логотип компании
                    </label>
                    {settings.logoDataUrl ? (
                        <div className="relative inline-block">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={settings.logoDataUrl}
                                alt="Logo"
                                className="h-20 w-auto border border-apple-border rounded-lg"
                            />
                            <button
                                onClick={handleRemoveLogo}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-apple-border rounded-lg cursor-pointer hover:border-apple-primary transition-colors">
                            <div className="flex flex-col items-center">
                                <Upload size={32} className="text-apple-text-tertiary mb-2" />
                                <span className="text-sm text-apple-text-secondary">
                                    Нажмите для загрузки логотипа
                                </span>
                                <span className="text-xs text-apple-text-tertiary mt-1">
                                    PNG, JPG до 2MB
                                </span>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>

                {/* Company Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AppleInput
                        label="Название компании"
                        value={settings.companyName}
                        onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                    />
                    <AppleInput
                        label="Телефон"
                        value={settings.phone}
                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    />
                    <AppleInput
                        label="Email"
                        value={settings.email}
                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    />
                </div>

                {/* Colors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-apple-text-primary mb-2">
                            Основной цвет
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={settings.primaryColor}
                                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                className="h-10 w-20 rounded-lg cursor-pointer border border-apple-border"
                            />
                            <input
                                type="text"
                                value={settings.primaryColor}
                                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                                className="apple-input flex-1"
                                placeholder="#00b4d8"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-apple-text-primary mb-2">
                            Вторичный цвет
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={settings.secondaryColor}
                                onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                                className="h-10 w-20 rounded-lg cursor-pointer border border-apple-border"
                            />
                            <input
                                type="text"
                                value={settings.secondaryColor}
                                onChange={(e) => setSettings({ ...settings, secondaryColor: e.target.value })}
                                className="apple-input flex-1"
                                placeholder="#003366"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Text */}
                <div>
                    <AppleInput
                        label="Текст в подвале"
                        value={settings.footerText}
                        onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                        placeholder="Спасибо за сотрудничество!"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <AppleButton variant="primary" onClick={handleSave}>
                        Сохранить настройки
                    </AppleButton>
                    <AppleButton variant="secondary" onClick={handleReset}>
                        Сбросить
                    </AppleButton>
                </div>

                {/* Preview Note */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-sm text-blue-400">
                        💡 <strong>Совет:</strong> Эти настройки будут применены ко всем экспортируемым PDF документам.
                        Чтобы увидеть изменения, экспортируйте любую смету в PDF.
                    </p>
                </div>
            </div>
        </AppleCard>
    );
}
