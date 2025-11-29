import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * Ripple effect component for buttons
 * Material Design inspired ripple animation
 */
export function Ripple({ color = 'rgba(255, 255, 255, 0.5)', duration = 600 }) {
    const [ripples, setRipples] = useState([]);

    const addRipple = (event) => {
        const rippleContainer = event.currentTarget.getBoundingClientRect();
        const size = Math.max(rippleContainer.width, rippleContainer.height);
        const x = event.clientX - rippleContainer.left - size / 2;
        const y = event.clientY - rippleContainer.top - size / 2;

        const newRipple = {
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

    return {
        ripples,
        addRipple,
        RippleContainer: ({ children, className = '', ...props }) => (
            <div
                className={`relative overflow-hidden ${className}`}
                onMouseDown={addRipple}
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
 * HOC to add ripple effect to any component
 */
export function withRipple(Component, rippleColor = 'rgba(255, 255, 255, 0.5)') {
    return function RippleComponent(props) {
        const { RippleContainer } = useRipple(rippleColor);

        return (
            <RippleContainer>
                <Component {...props} />
            </RippleContainer>
        );
    };
}
