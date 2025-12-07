/**
 * Memoization helpers
 * React.memo and optimization utilities
 */

import { memo, ComponentType } from 'react';

type AnyProps = Record<string, unknown>;

/**
 * Create memoized component with custom comparison
 */
export const createMemoComponent = <P extends object>(
    Component: ComponentType<P>,
    areEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
): React.MemoExoticComponent<ComponentType<P>> => {
    return memo(Component, areEqual);
};

/**
 * Shallow comparison for props
 */
export const shallowEqual = (prevProps: AnyProps, nextProps: AnyProps): boolean => {
    const prevKeys = Object.keys(prevProps);
    const nextKeys = Object.keys(nextProps);

    if (prevKeys.length !== nextKeys.length) {
        return false;
    }

    for (const key of prevKeys) {
        if (prevProps[key] !== nextProps[key]) {
            return false;
        }
    }

    return true;
};

/**
 * Deep comparison for props
 */
export const deepEqual = (prevProps: unknown, nextProps: unknown): boolean => {
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
};

/**
 * Compare only specific props
 */
export const compareProps = <P extends AnyProps>(...propsToCompare: (keyof P)[]): (prevProps: P, nextProps: P) => boolean => {
    return (prevProps: P, nextProps: P): boolean => {
        for (const prop of propsToCompare) {
            if (prevProps[prop] !== nextProps[prop]) {
                return false;
            }
        }
        return true;
    };
};

/**
 * Memoize expensive calculations
 */
export const memoizeOne = <T extends unknown[], R>(fn: (...args: T) => R): ((...args: T) => R) => {
    let lastArgs: T | null = null;
    let lastResult: R | null = null;

    return (...args: T): R => {
        if (!lastArgs || !areArgsEqual(args, lastArgs)) {
            lastArgs = args;
            lastResult = fn(...args);
        }
        return lastResult as R;
    };
};

const areArgsEqual = <T extends unknown[]>(args1: T, args2: T): boolean => {
    if (args1.length !== args2.length) return false;
    return args1.every((arg: unknown, index: number) => arg === args2[index]);
};
