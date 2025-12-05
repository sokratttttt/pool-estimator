'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

/**
 * Carousel component for images/content
 */
interface CarouselProps {
    items: any[];
    autoPlay?: boolean;
    interval?: number;
    showDots?: boolean;
    showArrows?: boolean;
    className?: string;
}

export default function Carousel({
    items,
    autoPlay = false,
    interval = 3000,
    showDots = true,
    showArrows = true,
    className = ''
}: CarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prev: number) => (prev + 1) % items.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev: number) => (prev - 1 + items.length) % items.length);
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    // Auto play
    React.useEffect(() => {
        if (!autoPlay) return;

        const timer = setInterval(nextSlide, interval);
        return () => clearInterval(timer);
    }, [autoPlay, interval]);

    return (
        <div className={`relative overflow-hidden rounded-lg ${className}`}>
            {/* Slides */}
            <div className="relative h-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full"
                    >
                        {items[currentIndex]}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Arrows */}
            {showArrows && items.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        className="
                            absolute left-4 top-1/2 -translate-y-1/2
                            w-10 h-10 rounded-full
                            bg-white/10 hover:bg-white/20 backdrop-blur-sm
                            flex items-center justify-center
                            transition-colors
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500
                        "
                        aria-label="Previous slide"
                    >
                        <ChevronLeft size={24} className="text-white" />
                    </button>

                    <button
                        onClick={nextSlide}
                        className="
                            absolute right-4 top-1/2 -translate-y-1/2
                            w-10 h-10 rounded-full
                            bg-white/10 hover:bg-white/20 backdrop-blur-sm
                            flex items-center justify-center
                            transition-colors
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500
                        "
                        aria-label="Next slide"
                    >
                        <ChevronRight size={24} className="text-white" />
                    </button>
                </>
            )}

            {/* Dots */}
            {showDots && items.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {items.map((_: any, index: number) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`
                                w-2 h-2 rounded-full transition-all
                                ${index === currentIndex
                                    ? 'bg-cyan-500 w-8'
                                    : 'bg-white/40 hover:bg-white/60'
                                }
                            `}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
