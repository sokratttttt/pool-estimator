'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

import type { Dimensions } from '@/types';

interface PoolVisualizerProps {
    dimensions?: Dimensions;
    material?: string;
    className?: string;
}

export default function PoolVisualizer({ dimensions, material, className = '' }: PoolVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Get dimensions or use defaults
        const poolLength = dimensions?.length || 8;
        const poolWidth = dimensions?.width || 4;
        const poolDepth = dimensions?.depth || 1.5;

        // Scale for drawing
        const scale = Math.min(width / (poolLength + 4), height / (poolWidth + 4));
        const offsetX = (width - poolLength * scale) / 2;
        const offsetY = (height - poolWidth * scale) / 2;

        // Draw pool (top view)
        ctx.save();

        // Shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;

        // Pool fill
        const gradient = ctx.createLinearGradient(
            offsetX, offsetY,
            offsetX + poolLength * scale, offsetY + poolWidth * scale
        );

        if (material === 'composite') {
            gradient.addColorStop(0, '#4FC3F7');
            gradient.addColorStop(1, '#0277BD');
        } else {
            gradient.addColorStop(0, '#64B5F6');
            gradient.addColorStop(1, '#1976D2');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(offsetX, offsetY, poolLength * scale, poolWidth * scale);

        // Pool border
        ctx.strokeStyle = '#0D47A1';
        ctx.lineWidth = 3;
        ctx.strokeRect(offsetX, offsetY, poolLength * scale, poolWidth * scale);

        ctx.restore();

        // Draw depth indicator (side view - small)
        const sideViewX = offsetX;
        const sideViewY = offsetY + poolWidth * scale + 40;
        const sideViewWidth = poolLength * scale;
        const sideViewHeight = 60;

        // Side view background
        ctx.fillStyle = '#E3F2FD';
        ctx.fillRect(sideViewX, sideViewY, sideViewWidth, sideViewHeight);

        // Water
        const waterGradient = ctx.createLinearGradient(
            sideViewX, sideViewY,
            sideViewX, sideViewY + sideViewHeight
        );
        waterGradient.addColorStop(0, '#4FC3F7');
        waterGradient.addColorStop(1, '#0277BD');

        ctx.fillStyle = waterGradient;
        ctx.fillRect(sideViewX, sideViewY, sideViewWidth, sideViewHeight);

        // Border
        ctx.strokeStyle = '#0D47A1';
        ctx.lineWidth = 2;
        ctx.strokeRect(sideViewX, sideViewY, sideViewWidth, sideViewHeight);

        // Dimensions labels
        ctx.fillStyle = '#1D1D1F';
        ctx.font = 'bold 14px system-ui';
        ctx.textAlign = 'center';

        // Length
        ctx.fillText(
            `${poolLength}м`,
            offsetX + (poolLength * scale) / 2,
            offsetY - 10
        );

        // Width
        ctx.save();
        ctx.translate(offsetX - 20, offsetY + (poolWidth * scale) / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(`${poolWidth}м`, 0, 0);
        ctx.restore();

        // Depth
        ctx.fillText(
            `Глубина: ${poolDepth}м`,
            sideViewX + sideViewWidth / 2,
            sideViewY + sideViewHeight + 20
        );

        // Volume calculation
        const volume = poolLength * poolWidth * poolDepth;
        ctx.font = '12px system-ui';
        ctx.fillStyle = '#666';
        ctx.fillText(
            `Объем: ${volume.toFixed(1)} м³`,
            width / 2,
            height - 10
        );

    }, [dimensions, material]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-apple-surface rounded-2xl p-6 ${className}`}
        >
            <h3 className="apple-heading-3 mb-4 text-center">Визуализация бассейна</h3>
            <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="w-full h-auto"
            />
            <div className="mt-4 text-center">
                <p className="apple-caption">
                    {material === 'composite' ? 'Композитная чаша' : 'Бетонный бассейн'}
                </p>
            </div>
        </motion.div>
    );
}
