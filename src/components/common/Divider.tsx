'use client';

/**
 * Divider component
 */
interface DividerProps {
  orientation?: any;
  // horizontal?: any;
  vertical
    className?: any;
  label?: any;
}

export default function Divider({ 
    orientation = 'horizontal', // horizontal, vertical
    className = '',
    label
 }: DividerProps) {
    if (orientation === 'vertical') {
        return (
            <div className={`w-px bg-white/10 ${className}`} />
        );
    }

    if (label) {
        return (
            <div className={`flex items-center gap-4 ${className}`}>
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-sm text-white/60">{label}</span>
                <div className="flex-1 h-px bg-white/10" />
            </div>
        );
    }

    return (
        <div className={`h-px bg-white/10 ${className}`} />
    );
}
