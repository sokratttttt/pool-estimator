import { useEffect } from 'react';

interface KeyboardNavigationProps {
    handleNext: () => void;
    handleBack: () => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    canGoNext: boolean;
    canGoBack: boolean;
}

export const useKeyboardNavigation = ({
    handleNext,
    handleBack,
    undo,
    redo,
    canUndo,
    canRedo,
    canGoNext,
    canGoBack
}: KeyboardNavigationProps) => {
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Undo/Redo shortcuts
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                if (canUndo) undo();
                return;
            }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                if (canRedo) redo();
                return;
            }

            // Navigation shortcuts
            if (e.key === 'Enter' && !e.shiftKey && canGoNext && !(e.target as HTMLElement).matches('input, textarea, select')) {
                handleNext();
            }

            if (e.key === 'Enter' && e.shiftKey && canGoBack) {
                handleBack();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [handleNext, handleBack, undo, redo, canUndo, canRedo, canGoNext, canGoBack]);
};
