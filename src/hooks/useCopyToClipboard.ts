// TODO: Add proper TypeScript types for state
import { useState, useCallback } from 'react';

/**
 * Custom hook to copy text to clipboard
 * @returns {[Function, boolean]} [copy function, isCopied state]
 */
type CopyFn = (text: string) => Promise<boolean>;

export function useCopyToClipboard(): [CopyFn, boolean] {
    const [isCopied, setIsCopied] = useState(false);

    const copy = useCallback(async (text: string) => {
        if (!navigator?.clipboard) {
            console.warn('Clipboard not supported');
            return false;
        }

        try {
            await navigator.clipboard.writeText(text);
            setIsCopied(true);

            // Reset after 2 seconds
            setTimeout(() => {
                setIsCopied(false);
            }, 2000);

            return true;
        } catch (error) {
            console.warn('Copy failed', error);
            setIsCopied(false);
            return false;
        }
    }, []);

    return [copy, isCopied];
}
