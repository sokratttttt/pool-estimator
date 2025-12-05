'use client';
import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { X, Search, ShoppingCart, ArrowUpDown } from 'lucide-react';
import AppleButton from './apple/AppleButton';
import AppleCard from './apple/AppleCard';
import AppleInput from './apple/AppleInput';
import { useCatalog } from '@/context/CatalogContext';
import { toast } from 'sonner';

interface CatalogSelectorProps {
    category?: any;
    onSelect?: (product: any) => void;
    onClose?: () => void;
}

export default function CatalogSelector({ category, onSelect, onClose }: CatalogSelectorProps) {
    const { getProductsByCategory } = useCatalog();
    const [searchQuery, setSearchQuery] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [sortBy, setSortBy] = useState('default'); // default, price_asc, price_desc

    const products = getProductsByCategory(category).filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesPrice = (!priceRange.min || product.price >= parseFloat(priceRange.min)) &&
            (!priceRange.max || product.price <= parseFloat(priceRange.max));

        return product.inStock && matchesSearch && matchesPrice;
    });

    const sortedProducts = [...products].sort((a: any, b: any) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        return 0;
    });

    const handleSelect = (product: any) => {
        if (onSelect) onSelect(product);
        toast.success(`${product.name} добавлен в смету`);
        if (onClose) onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-apple-surface rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="bg-apple-surface border-b border-apple-border p-6 flex items-center justify-between">
                    <div>
                        <h2 className="apple-heading-2">Выбрать из каталога</h2>
                        <p className="apple-caption mt-1">
                            {sortedProducts.length} товаров доступно
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-apple-bg-secondary transition-colors"
                    >
                        <X size={24} className="text-apple-text-secondary" />
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="p-6 border-b border-apple-border space-y-4">
                    <AppleInput
                        placeholder="Поиск товаров..."
                        value={searchQuery}
                        onChange={(e: React.ChangeEvent<any>) => setSearchQuery(e.target.value)}
                        icon={<Search size={20} />}
                    />

                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Price Filter */}
                        <div className="flex items-center gap-2 flex-1">
                            <div className="relative flex-1">
                                <input
                                    type="number"
                                    placeholder="Цена от"
                                    value={priceRange.min}
                                    onChange={(e: React.ChangeEvent<any>) => setPriceRange({ ...priceRange, min: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-all"
                                />
                            </div>
                            <span className="text-slate-400">-</span>
                            <div className="relative flex-1">
                                <input
                                    type="number"
                                    placeholder="до"
                                    value={priceRange.max}
                                    onChange={(e: React.ChangeEvent<any>) => setPriceRange({ ...priceRange, max: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Sort */}
                        <div className="relative min-w-[200px]">
                            <select
                                value={sortBy}
                                onChange={(e: React.ChangeEvent<any>) => setSortBy(e.target.value)}
                                className="w-full appearance-none px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
                            >
                                <option value="default" className="bg-slate-800">По умолчанию</option>
                                <option value="price_asc" className="bg-slate-800">Цена: по возрастанию</option>
                                <option value="price_desc" className="bg-slate-800">Цена: по убыванию</option>
                            </select>
                            <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    {sortedProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sortedProducts.map((product: any, index: number) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <AppleCard
                                        hover
                                        onClick={() => handleSelect(product)}
                                        className="cursor-pointer h-full"
                                    >
                                        {/* Image */}
                                        <div className="aspect-square bg-apple-bg-secondary rounded-lg mb-3 overflow-hidden relative">
                                            {product.image ? (
                                                <Image
                                                    src={product.image}
                                                    alt={product.name}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, 300px"
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ShoppingCart size={48} className="text-apple-text-tertiary" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <h3 className="apple-body font-semibold mb-1 line-clamp-2">
                                            {product.name}
                                        </h3>
                                        {product.description && (
                                            <p className="apple-caption mb-2 line-clamp-1">
                                                {product.description}
                                            </p>
                                        )}
                                        <p className="apple-heading-3 text-apple-primary">
                                            {product.price.toLocaleString('ru-RU')} ₽
                                            <span className="apple-caption text-apple-text-secondary ml-1">
                                                / {product.unit}
                                            </span>
                                        </p>
                                    </AppleCard>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <ShoppingCart size={64} className="mx-auto text-apple-text-tertiary mb-4" />
                            <h3 className="apple-heading-3 mb-2">Товары не найдены</h3>
                            <p className="apple-body-secondary">
                                {searchQuery || priceRange.min || priceRange.max
                                    ? 'Попробуйте изменить параметры поиска'
                                    : 'Добавьте товары в каталог'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-apple-border p-6">
                    <AppleButton
                        variant="secondary"
                        onClick={onClose}
                        className="w-full"
                    >
                        Отмена
                    </AppleButton>
                </div>
            </motion.div>
        </div>
    );
}
