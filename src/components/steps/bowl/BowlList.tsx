'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Waves } from 'lucide-react';

interface BowlListProps {
    bowls?: any;
    onSelect?: (bowl: any) => void;
    selectedId?: string;
    getDimensions?: any;
    getManufacturer?: any;
}

export default function BowlList({ bowls, onSelect, selectedId, getDimensions, getManufacturer }: BowlListProps) {
    return (
        <div className="space-y-3">
            {bowls.map((bowl: any, index: number) => {
                const dims = getDimensions(bowl);
                return (
                    <motion.div
                        key={bowl.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => onSelect?.(bowl)}
                        className={`
                            flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border
                            ${selectedId === bowl.id
                                ? 'bg-cyan-50 border-cyan-500 shadow-md'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-cyan-300 hover:shadow-sm'
                            }
                        `}
                    >
                        <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                            {bowl.image ? (
                                <div className="relative w-full h-full">
                                    <Image
                                        src={bowl.image}
                                        alt={bowl.name}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-cover rounded-lg"
                                    />
                                </div>
                            ) : (
                                <Waves className="text-cyan-600" size={24} />
                            )}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-900 dark:text-white">{bowl.name}</h3>
                            <p className="text-sm text-slate-500">{getManufacturer(bowl)}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-slate-500 mb-1">
                                {dims.length || '?'} × {dims.width || '?'} × {dims.depth || '?'}м
                            </div>
                            <div className="font-bold text-cyan-600">
                                {bowl.price?.toLocaleString('ru-RU')} ₽
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
