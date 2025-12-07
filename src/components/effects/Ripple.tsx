import { useState } from 'react';
import { motion } from 'framer-motion';

export interface RippleItem {
    x: number;
    y: number;
    size: number;
    key: number;
}

/**
 * Ripple effect component for buttons
 * Material Design inspired ripple animation
 */
export function Ripple({ color = 'rgba(255, 255, 255, 0.5)', duration = 600 }) {
    const [ripples, setRipples] = useState<RippleItem[]>([]);

    interface AddRippleProps {
        event?: React.MouseEvent<HTMLElement>;
    }

    const addRipple = ({ event }: AddRippleProps) => {
        // ВАЖНО: Проверяем, что event и currentTarget существуют
        if (!event || !event.currentTarget) {
            console.warn('Ripple: event or currentTarget is undefined');
            return;
        }

        const rippleContainer = event.currentTarget.getBoundingClientRect();
        const size = Math.max(rippleContainer.width, rippleContainer.height);
        const x = event.clientX - rippleContainer.left - size / 2;
        const y = event.clientY - rippleContainer.top - size / 2;

        const newRipple: RippleItem = {
            x,
            y,
            size,
            key: Date.now()
        };

        setRipples((prev) => [...prev, newRipple]);

        // Remove ripple after animation
        setTimeout(() => {
            setRipples((prev) => prev.filter((r) => r.key !== newRipple.key));
        }, duration);
    };

    // Функция-обертка для обработки событий мыши
    const handleMouseDown = (event: React.MouseEvent<HTMLElement>) => {
        addRipple({ event });
    };

    return {
        ripples,
        addRipple,
        RippleContainer: ({ children, className = '', ...props }: React.ComponentProps<'div'>) => (
            <div
                className={`relative overflow-hidden ${className}`}
                onMouseDown={handleMouseDown}
                {...props}
            >
                {children}
                <div className="absolute inset-0 pointer-events-none">
                    {ripples.map((ripple) => (
                        <motion.span
                            key={ripple.key}
                            className="absolute rounded-full"
                            style={{
                                left: ripple.x,
                                top: ripple.y,
                                width: ripple.size,
                                height: ripple.size,
                                backgroundColor: color
                            }}
                            initial={{ scale: 0, opacity: 1 }}
                            animate={{ scale: 2, opacity: 0 }}
                            transition={{ duration: duration / 1000, ease: 'easeOut' }}
                        />
                    ))}
                </div>
            </div>
        )
    };
}

/**
 * Hook version for easier integration
 */
export function useRipple(color = 'rgba(255, 255, 255, 0.5)', duration = 600) {
    return Ripple({ color, duration });
}

/**
 * Безопасная версия хука с проверками
 */
export function useSafeRipple(color = 'rgba(255, 255, 255, 0.5)', duration = 600) {
    const [ripples, setRipples] = useState<RippleItem[]>([]);

    const addRipple = (event: React.MouseEvent<HTMLElement> | undefined) => {
        if (!event || !event.currentTarget) {
            return;
        }

        const rippleContainer = event.currentTarget.getBoundingClientRect();
        const size = Math.max(rippleContainer.width, rippleContainer.height);
        const x = event.clientX - rippleContainer.left - size / 2;
        const y = event.clientY - rippleContainer.top - size / 2;

        const newRipple: RippleItem = {
            x,
            y,
            size,
            key: Date.now()
        };

        setRipples(prev => [...prev, newRipple]);

        setTimeout(() => {
            setRipples(prev => prev.filter(r => r.key !== newRipple.key));
        }, duration);
    };

    const RippleContainer = ({ children, className = '', ...props }: React.ComponentProps<'div'>) => (
        <div
            className={`relative overflow-hidden ${className}`}
            onMouseDown={(e) => addRipple(e)}
            {...props}
        >
            {children}
            <div className="absolute inset-0 pointer-events-none">
                {ripples.map((ripple) => (
                    <motion.span
                        key={ripple.key}
                        className="absolute rounded-full"
                        style={{
                            left: ripple.x,
                            top: ripple.y,
                            width: ripple.size,
                            height: ripple.size,
                            backgroundColor: color
                        }}
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 2, opacity: 0 }}
                        transition={{ duration: duration / 1000, ease: 'easeOut' }}
                    />
                ))}
            </div>
        </div>
    );

    return { ripples, addRipple, RippleContainer };
}

/**
 * HOC to add ripple effect to any component
 */
export function withRipple<P extends object>(Component: React.ComponentType<P>, rippleColor = 'rgba(255, 255, 255, 0.5)') {
    return function RippleComponent(props: P) {
        const { RippleContainer } = useSafeRipple(rippleColor);

        return (
            <RippleContainer>
                <Component {...props} />
            </RippleContainer>
        );
    };
}

/**
 * Простой компонент Ripple для быстрого использования
 */
export function SimpleRipple({
    children,
    color = 'rgba(255, 255, 255, 0.5)',
    duration = 600,
    className = '',
    ...props
}: {
    children: React.ReactNode;
    color?: string;
    duration?: number;
    className?: string;
    [key: string]: unknown;
}) {
    const { RippleContainer } = useSafeRipple(color, duration);

    return (
        <RippleContainer className={className} {...props}>
            {children}
        </RippleContainer>
    );
}

export default Ripple;