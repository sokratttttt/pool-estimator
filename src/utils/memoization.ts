/**
 * Memoization helpers
 * React.memo and optimization utilities
 */

import { memo } from 'react';

/**
 * Create memoized component with custom comparison
 */
export const createMemoComponent = (Component: any, areEqual: any) => {
    return memo(Component, areEqual);
};

/**
 * Shallow comparison for props
 */
export const shallowEqual = (prevProps: any, nextProps: any) => {
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
export const deepEqual = (prevProps: any, nextProps: any) => {
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
};

/**
 * Compare only specific props
 */
export const compareProps = (...propsToCompare) => {
    return (prevProps: any, nextProps: any) => {
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
export const memoizeOne = (fn: any) => {
    let lastArgs: any[] | null = null;
    let lastResult = null;

    return (...args) => {
        if (!lastArgs || !areArgsEqual(args, lastArgs)) {
            lastArgs = args;
            lastResult = fn(...args);
        }
        return lastResult;
    };
};

const areArgsEqual = (args1: any, args2: any) => {
    if (args1.length !== args2.length) return false;
    return args1.every((arg: any, index: number) => arg === args2[index]);
};
