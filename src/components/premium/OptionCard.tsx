'use client';
import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

interface OptionCardProps {
    title?: any;
    description?: any;
    price?: any;
    image?: any;
    selected?: any;
    onClick?: () => void;
    badge?: any;
    delay?: any;
}

export default function OptionCard({
    title,
    description,
    price,
    image,
    selected,
    onClick,
    badge,
    delay = 0
}: OptionCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={onClick}
            className={`
                relative cursor-pointer rounded-2xl overflow-hidden
                transition-all duration-300 backdrop-blur-xl
                ${selected
                    ? 'ring-2 ring-cyan-bright shadow-xl shadow-cyan-bright/30'
                    : 'shadow-lg hover:shadow-2xl'
                }
            `}
            style={{
                background: selected
                    ? 'linear-gradient(135deg, rgba(0, 217, 255, 0.15) 0%, rgba(30, 58, 95, 0.8) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                border: selected ? '2px solid rgba(0, 217, 255, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
            }}
        >
            {/* Gradient overlay on hover */}
            <div className={`
                absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300
                pointer-events-none
            `} style={{
                    background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.1) 0%, transparent 100%)'
                }} />

            {/* Badge */}
            {badge && (
                <div className="absolute top-4 right-4 z-10">
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
                        style={{
                            background: 'linear-gradient(135deg, #FFB800 0%, #E6A600 100%)',
                            color: '#0A1929'
                        }}>
                        <Sparkles size={12} />
                        {badge}
                    </div>
                </div>
            )}

            {/* Selected indicator */}
            {selected && (
                <div className="absolute top-4 left-4 z-10">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-8 h-8 rounded-full flex items-center justify-center shadow-glow"
                        style={{
                            background: 'linear-gradient(135deg, #00D9FF 0%, #0099FF 100%)'
                        }}
                    >
                        <Check size={20} className="text-white" />
                    </motion.div>
                </div>
            )}

            {/* Image/Icon */}
            {image && (
                <div className="relative h-48 w-full overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, #1E3A5F 0%, #0A1929 100%)'
                    }}>
                    {typeof image === 'string' && (image.startsWith('/') || image.startsWith('http') || image.startsWith('data:')) ? (
                        <Image
                            src={image}
                            alt={title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-contain transition-transform duration-500 hover:scale-110 p-2"
                        />
                    ) : typeof image === 'string' ? (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                            {image}
                        </div>
                    ) : React.isValidElement(image) ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className={`
                                w-16 h-16 rounded-2xl flex items-center justify-center
                                ${selected ? 'shadow-glow' : ''}
                            `} style={{
                                    background: selected
                                        ? 'linear-gradient(135deg, #00D9FF 0%, #0099FF 100%)'
                                        : 'rgba(255, 255, 255, 0.05)'
                                }}>
                                {React.cloneElement(image as React.ReactElement<any>, {
                                    size: 32,
                                    className: selected ? "text-white" : "text-cyan-bright"
                                } as any)}
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className={`
                                w-16 h-16 rounded-2xl flex items-center justify-center
                                ${selected ? 'shadow-glow' : ''}
                            `} style={{
                                    background: selected
                                        ? 'linear-gradient(135deg, #00D9FF 0%, #0099FF 100%)'
                                        : 'rgba(255, 255, 255, 0.05)'
                                }}>
                                {React.createElement(image as React.ComponentType<any>, {
                                    size: 32,
                                    className: selected ? "text-white" : "text-cyan-bright"
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Content */}
            <div className="p-6">
                <h3 className={`
                    text-xl font-bold mb-2
                    ${selected ? 'text-cyan-bright' : 'text-white'}
                `}>
                    {title}
                </h3>

                {description && (
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                        {description}
                    </p>
                )}

                {price !== undefined && price !== null && (
                    <div className="flex items-baseline gap-2">
                        <span className={`
                            text-2xl font-bold font-mono
                            ${selected ? 'text-gold' : 'text-cyan-bright'}
                        `}>
                            {typeof price === 'number' ? price.toLocaleString('ru-RU') : price}
                        </span>
                        {typeof price === 'number' && (
                            <span className="text-gray-400 text-sm">₽</span>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom gradient line */}
            <div className={`
                h-1 w-full transition-all duration-300
            `} style={{
                    background: selected ? 'linear-gradient(135deg, #00D9FF 0%, #0099FF 100%)' : 'transparent'
                }} />
        </motion.div>
    );
}
