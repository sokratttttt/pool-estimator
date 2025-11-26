'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Search, Plus, Edit2, Trash2, ArrowUpDown } from 'lucide-react';
import AppleButton from '../../components/apple/AppleButton';
import AppleCard from '../../components/apple/AppleCard';
import AppleInput from '../../components/apple/AppleInput';
import ContextMenu from '@/components/ContextMenu';
import ProductForm from '../../components/ProductForm';
import { useCatalog } from '../../context/CatalogContext';
import { toast } from 'sonner';

export default function CatalogPage() {
    const { products, deleteProduct, getProductsByCategory } = useCatalog();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [sortBy, setSortBy] = useState('default'); // default, price_asc, price_desc

    const categories = [
        { id: 'all', label: 'Все' },
        { id: 'bowls', label: 'Чаши' },
        { id: 'filtration', label: 'Фильтрация' },
        { id: 'heating', label: 'Подогрев' },
        { id: 'parts', label: 'Закладные' },
        { id: 'accessories', label: 'Аксессуары' },
        { id: 'chemicals', label: 'Химия' },
    ];

    const filteredProducts = getProductsByCategory(selectedCategory).filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesPrice = (!priceRange.min || product.price >= parseFloat(priceRange.min)) &&
            (!priceRange.max || product.price <= parseFloat(priceRange.max));

        return matchesSearch && matchesPrice;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        return 0;
    });

    const handleEdit = (product) => {
        setEditingProduct(product);
        setShowProductForm(true);
    };

    const handleDelete = (product) => {
        if (confirm(`Удалить товар "${product.name}"?`)) {
            deleteProduct(product.id);
            toast.success('Товар удален');
        }
    };

    const handleAddNew = () => {
        setEditingProduct(null);
        setShowProductForm(true);
    };

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 24;

    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
    const currentProducts = sortedProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedCategory, priceRange]);

    return (
        <div className="min-h-screen bg-apple-bg-primary">
            <div className="apple-container apple-section">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h1 className="apple-heading-1 mb-2">Каталог оборудования</h1>
                            <p className="apple-body-secondary">
                                {products.length} товаров в каталоге
                            </p>
                        </motion.div>
                    </div>
                    <AppleButton
                        variant="primary"
                        icon={<Plus size={20} />}
                        onClick={handleAddNew}
                    >
                        Добавить товар
                    </AppleButton>
                </div>

                {/* Search and Filters */}
                <div className="mb-8 space-y-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <AppleInput
                                placeholder="Поиск оборудования..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                icon={<Search size={20} />}
                            />
                        </div>

                        {/* Price Filter */}
                        <div className="flex items-center gap-2 min-w-[300px]">
                            <div className="relative flex-1">
                                <input
                                    type="number"
                                    placeholder="Цена от"
                                    value={priceRange.min}
                                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-all"
                                />
                            </div>
                            <span className="text-slate-400">-</span>
                            <div className="relative flex-1">
                                <input
                                    type="number"
                                    placeholder="до"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* Sort */}
                        <div className="relative min-w-[200px]">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full appearance-none px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
                            >
                                <option value="default" className="bg-slate-800">По умолчанию</option>
                                <option value="price_asc" className="bg-slate-800">Цена: по возрастанию</option>
                                <option value="price_desc" className="bg-slate-800">Цена: по убыванию</option>
                            </select>
                            <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`px-4 py-2 rounded-full transition-all ${selectedCategory === category.id
                                    ? 'bg-apple-primary text-white'
                                    : 'bg-apple-bg-secondary text-apple-text-primary hover:bg-apple-bg-tertiary'
                                    }`}
                            >
                                {category.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Grid */}
                {currentProducts.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {currentProducts.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <AppleCard className="h-full flex flex-col">
                                        {/* Image */}
                                        <div className="aspect-square bg-apple-bg-secondary rounded-lg mb-4 overflow-hidden relative">
                                            {product.image ? (
                                                <Image
                                                    src={product.image}
                                                    alt={product.name}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    className="object-contain"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package size={64} className="text-apple-text-tertiary" />
                                                </div>
                                            )}

                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 flex flex-col">
                                            <h3 className="apple-heading-3 mb-2 line-clamp-2">
                                                {product.name}
                                            </h3>
                                            {product.description && (
                                                <p className="apple-caption mb-3 line-clamp-2 flex-1">
                                                    {product.description}
                                                </p>
                                            )}
                                            <div className="mt-auto">
                                                <p className="apple-heading-2 text-apple-primary mb-4">
                                                    {product.price.toLocaleString('ru-RU')} ₽
                                                    <span className="apple-caption text-apple-text-secondary ml-1">
                                                        / {product.unit}
                                                    </span>
                                                </p>

                                                {/* Actions */}
                                                <div className="flex gap-2">
                                                    <AppleButton
                                                        variant="secondary"
                                                        size="sm"
                                                        icon={<Edit2 size={16} />}
                                                        onClick={() => handleEdit(product)}
                                                        className="flex-1"
                                                    >
                                                        Изменить
                                                    </AppleButton>
                                                    <AppleButton
                                                        variant="secondary"
                                                        size="sm"
                                                        icon={<Trash2 size={16} />}
                                                        onClick={() => handleDelete(product)}
                                                        className="text-red-500 hover:bg-red-50"
                                                    >
                                                    </AppleButton>
                                                </div>
                                            </div>
                                        </div>
                                    </AppleCard>
                                </motion.div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Назад
                                </button>
                                <span className="px-4 py-2 text-slate-400">
                                    Страница {currentPage} из {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Вперед
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-16">
                        <Package size={64} className="mx-auto text-apple-text-tertiary mb-4" />
                        <h3 className="apple-heading-3 mb-2">Товары не найдены</h3>
                        <p className="apple-body-secondary mb-6">
                            {searchQuery || priceRange.min || priceRange.max
                                ? 'Попробуйте изменить параметры поиска'
                                : 'Добавьте первый товар в каталог'}
                        </p>
                        {!searchQuery && !priceRange.min && !priceRange.max && (
                            <AppleButton
                                variant="primary"
                                icon={<Plus size={20} />}
                                onClick={handleAddNew}
                            >
                                Добавить товар
                            </AppleButton>
                        )}
                    </div>
                )}
            </div>

            {/* Product Form Modal */}
            <AnimatePresence>
                {showProductForm && (
                    <ProductForm
                        product={editingProduct}
                        onClose={() => {
                            setShowProductForm(false);
                            setEditingProduct(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
