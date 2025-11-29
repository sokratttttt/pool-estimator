'use client';
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import dynamicPrices from '@/data/prices.json';
import { useCatalog } from './CatalogContext';

const EstimateContext = createContext();

const defaultSelection = {
    material: null,
    dimensions: null,
    bowl: null,
    filtration: null,
    heating: null,
    parts: null,
    additional: [],
    clientInfo: {
        name: '',
        phone: '',
        email: ''
    }
};

export function EstimateProvider({ children }) {

    const [selection, setSelection] = useState(defaultSelection);
    const [isInitialized, setIsInitialized] = useState(false);
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [lastSaved, setLastSaved] = useState(null);

    // Use CatalogContext
    const { catalog, isLoadingCatalog, updateCatalog } = useCatalog();

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('pool-estimate-selection');
            if (saved) {
                const parsedSelection = JSON.parse(saved);
                setSelection(parsedSelection);
                setHistory([parsedSelection]);
                setHistoryIndex(0);
            } else {
                setHistory([defaultSelection]);
                setHistoryIndex(0);
            }
        } catch (error) {
            console.error('Failed to load selection:', error);
            setHistory([defaultSelection]);
            setHistoryIndex(0);
        }
        setIsInitialized(true);
    }, []);

    // Ensure selected items are in the catalog (for legacy/custom items)
    useEffect(() => {
        if (isLoadingCatalog) return;

        // Check Bowl
        if (selection.bowl && !catalog.bowls?.find(b => b.id === selection.bowl.id)) {
            updateCatalog('bowls', [selection.bowl]);
        }

        // Check Heating
        if (selection.heating && !catalog.heating?.find(h => h.id === selection.heating.id)) {
            updateCatalog('heating', [selection.heating]);
        }

        // Check Filtration
        if (selection.filtration && !catalog.filtration?.find(f => f.id === selection.filtration.id)) {
            updateCatalog('filtration', [selection.filtration]);
        }
    }, [selection, isLoadingCatalog, catalog, updateCatalog]);

    // Undo/Redo functions
    const undo = useCallback(() => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setSelection(history[newIndex]);
            toast.success('Отменено');
        }
    }, [historyIndex, history]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setSelection(history[newIndex]);
            toast.success('Возвращено');
        }
    }, [historyIndex, history]);

    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    const updateSelection = useCallback((key, value) => {
        setSelection(prev => {
            const newSelection = { ...prev, [key]: value };

            // Add to history (trim future if we're not at the end)
            setHistory(h => {
                const newHistory = h.slice(0, historyIndex + 1);
                newHistory.push(newSelection);
                // Limit history to 20 items
                if (newHistory.length > 20) {
                    newHistory.shift();
                    setHistoryIndex(19);
                } else {
                    setHistoryIndex(newHistory.length - 1);
                }
                return newHistory;
            });

            return newSelection;
        });
    }, [historyIndex]);

    // Debounced save to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const timeoutId = setTimeout(() => {
                try {
                    localStorage.setItem('pool-estimate-selection', JSON.stringify(selection));
                    setLastSaved(new Date());
                } catch (error) {
                    console.error('Failed to save selection:', error);
                }
            }, 1000); // Debounce for 1 second

            return () => clearTimeout(timeoutId);
        }
    }, [selection]);

    // Auto-save every 30 seconds
    useEffect(() => {
        if (!isInitialized) return;

        const autoSaveInterval = setInterval(() => {
            if (typeof window !== 'undefined' && selection) {
                try {
                    localStorage.setItem('pool-estimate-selection', JSON.stringify(selection));
                    localStorage.setItem('pool-estimate-autosave', JSON.stringify({
                        selection,
                        timestamp: new Date().toISOString()
                    }));
                    setLastSaved(new Date());

                    // Show subtle toast notification
                    if (process.env.NODE_ENV === 'development') {
                        console.log('Auto-saved at', new Date().toLocaleTimeString());
                    }
                } catch (error) {
                    console.error('Auto-save failed:', error);
                }
            }
        }, 30000); // 30 seconds

        return () => clearInterval(autoSaveInterval);
    }, [selection, isInitialized]);

    // Helper to get price, checking dynamic overrides first
    const getDynamicPrice = useCallback((itemName, defaultPrice) => {
        if (!itemName) return defaultPrice;
        // Check if we have a dynamic price for this item name
        const dynamic = dynamicPrices[itemName];
        return dynamic !== undefined ? dynamic : defaultPrice;
    }, []);

    const value = useMemo(() => ({
        selection,
        setSelection,
        updateSelection,
        getDynamicPrice,
        catalog,
        isLoadingCatalog,
        updateCatalog,
        isInitialized,
        lastSaved,
        undo,
        redo,
        canUndo,
        canRedo
    }), [
        selection,
        updateSelection,
        getDynamicPrice,
        catalog,
        isLoadingCatalog,
        updateCatalog,
        isInitialized,
        lastSaved,
        undo,
        redo,
        canUndo,
        canRedo
    ]);

    return (
        <EstimateContext.Provider value={value}>
            {children}
        </EstimateContext.Provider>
    );
}

export function useEstimate() {
    return useContext(EstimateContext);
}
