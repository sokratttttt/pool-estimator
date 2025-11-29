import { useRef, useEffect, useState, useCallback } from 'react';
import { useAnimation } from 'framer-motion';

/**
 * useAnimationFrame hook
 * Request animation frame loop
 */
export function useAnimationFrame(callback) {
    const requestRef = useRef();
    const previousTimeRef = useRef();

    const animate = useCallback((time) => {
        if (previousTimeRef.current !== undefined) {
            const deltaTime = time - previousTimeRef.current;
            callback(deltaTime);
        }
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
    }, [callback]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [animate]);
}

/**
 * useSpring hook
 * Spring animation value
 */
export function useSpring({ from = 0, to = 1, stiffness = 100, damping = 10 }) {
    const [value, setValue] = useState(from);
    const velocity = useRef(0);

    useAnimationFrame(() => {
        const springForce = -(value - to) * stiffness;
        const dampingForce = -velocity.current * damping;
        const acceleration = springForce + dampingForce;

        velocity.current += acceleration * 0.016;
        setValue(value + velocity.current * 0.016);
    });

    return value;
}

/**
 * useSequence hook
 * Sequence animations
 */
export function useSequence(animations) {
    const controls = useAnimation();
    const [currentIndex, setCurrentIndex] = useState(0);

    const next = useCallback(async () => {
        if (currentIndex < animations.length - 1) {
            await controls.start(animations[currentIndex + 1]);
            setCurrentIndex(currentIndex + 1);
        }
    }, [controls, animations, currentIndex]);

    const previous = useCallback(async () => {
        if (currentIndex > 0) {
            await controls.start(animations[currentIndex - 1]);
            setCurrentIndex(currentIndex - 1);
        }
    }, [controls, animations, currentIndex]);

    const goto = useCallback(async (index) => {
        if (index >= 0 && index < animations.length) {
            await controls.start(animations[index]);
            setCurrentIndex(index);
        }
    }, [controls, animations]);

    return {
        controls,
        currentIndex,
        next,
        previous,
        goto,
        isFirst: currentIndex === 0,
        isLast: currentIndex === animations.length - 1
    };
}

/**
 * useParallax hook
 * Parallax scroll effect
 */
export function useParallax(speed = 0.5) {
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setOffset(window.pageYOffset * speed);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [speed]);

    return offset;
}
