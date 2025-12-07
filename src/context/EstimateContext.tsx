'use client';
import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { toast } from 'sonner';
import dynamicPrices from '@/data/prices.json';
import { useCatalog } from './CatalogContext';
import type { Bowl, Dimensions, MaterialSelection, FiltrationSelection, HeatingSelection, PartsSelection } from '@/types';

// ============================================
// TYPES
// ============================================

interface ClientInfo {
    name: string;
    phone: string;
    email: string;
}

// Local interfaces removed, imported from @/types


// Unified AdditionalItem type
export interface AdditionalItem {
    id: string;
    name: string;
    category: string;
    price: number;
    quantity: number;
    unit: string;
    description?: string;
    taxable: boolean;
    mandatory: boolean;
    installationPrice?: number;
    // Additional fields for compatibility
    section?: string;
    total?: number;
    source?: string;
    catalogArticle?: string;
}

// WorkItem replaced by WorkSelection from types/estimate-utils
import type { WorkSelection } from '@/types/estimate-utils';

export interface Selection {
    material: MaterialSelection | null;
    dimensions: (Dimensions & { volume?: number }) | null;
    bowl: Bowl | null;
    filtration: FiltrationSelection | null;
    heating: HeatingSelection | null;
    parts: PartsSelection | null;
    additional: AdditionalItem[];
    works?: Record<string, WorkSelection> | WorkSelection[];
    clientInfo: ClientInfo;
    [key: string]: unknown; // Index signature for compatibility
}

// Измененный тип для совместимости
interface CatalogData {
    bowls?: Bowl[];
    heating?: HeatingSelection[];
    filtration?: FiltrationSelection[];
    additional?: AdditionalItem[];
    [key: string]: unknown; // Index signature for compatibility
}

interface EstimateContextValue {
    selection: Selection;
    setSelection: React.Dispatch<React.SetStateAction<Selection>>;
    // Looser signature for compatibility with hooks that use string keys
    updateSelection: (key: string, value: unknown) => void;
    getDynamicPrice: (itemName: string | undefined, defaultPrice: number) => number;
    catalog: CatalogData;
    isLoadingCatalog: boolean;
    updateCatalog: (category: string, items: unknown[]) => void;
    isInitialized: boolean;
    lastSaved: Date | null;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    // Method to add items to additional array
    addItem: (item: AdditionalItem) => void;
}

// ============================================
// CONTEXT
// ============================================

const EstimateContext = createContext<EstimateContextValue | null>(null);

const defaultSelection: Selection = {
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

interface EstimateProviderProps {
    children: ReactNode;
}

export function EstimateProvider({ children }: EstimateProviderProps) {

    const [selection, setSelection] = useState<Selection>(defaultSelection);
    const [isInitialized, setIsInitialized] = useState(false);
    const [history, setHistory] = useState<Selection[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Use CatalogContext
    const { catalog, isLoadingCatalog, updateCatalog } = useCatalog();

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('pool-estimate-selection');
            if (saved) {
                const parsedSelection = JSON.parse(saved) as Selection;
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
        if (selection.bowl && !catalog.bowls?.find(b => b.id === selection.bowl?.id)) {
            updateCatalog('bowls', [{ ...selection.bowl, category: 'bowls' }]);
        }

        // Check Heating
        if (selection.heating && !catalog.heating?.find(h => h.id === selection.heating?.id)) {
            updateCatalog('heating', [{ ...selection.heating, category: 'heating' }]);
        }

        // Check Filtration
        if (selection.filtration && !catalog.filtration?.find(f => f.id === selection.filtration?.id)) {
            updateCatalog('filtration', [{ ...selection.filtration, category: 'filtration' }]);
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

    const updateSelection = useCallback((key: string, value: unknown) => {
        setSelection(prev => {
            const newSelection = { ...prev, [key]: value } as Selection;

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

    // Add item to additional array
    const addItem = useCallback((item: AdditionalItem) => {
        setSelection(prev => ({
            ...prev,
            additional: [...prev.additional, item]
        }));
    }, []);

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
        return undefined;
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
                    }
                } catch (_error) {
                }
            }
        }, 30000); // 30 seconds

        return () => clearInterval(autoSaveInterval);
    }, [selection, isInitialized]);

    // Helper to get price, checking dynamic overrides first
    const getDynamicPrice = useCallback((itemName: string | undefined, defaultPrice: number): number => {
        if (!itemName) return defaultPrice;
        // Check if we have a dynamic price for this item name
        const dynamic = (dynamicPrices as Record<string, number>)[itemName];
        return dynamic !== undefined ? dynamic : defaultPrice;
    }, []);

    // Функция для адаптации данных каталога
    const adaptCatalogData = useCallback((catalogData: Partial<CatalogData>): CatalogData => {
        return {
            bowls: (catalogData.bowls || []) as Bowl[],
            heating: (catalogData.heating || []) as HeatingSelection[],
            filtration: (catalogData.filtration || []) as FiltrationSelection[],
            additional: catalogData.additional || []
        };
    }, []);

    const value = useMemo<EstimateContextValue>(() => ({
        selection,
        setSelection,
        updateSelection,
        getDynamicPrice,
        catalog: adaptCatalogData(catalog as any),
        isLoadingCatalog,
        updateCatalog: updateCatalog as (category: string, items: unknown[]) => void,
        isInitialized,
        lastSaved,
        undo,
        redo,
        canUndo,
        canRedo,
        addItem
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
        canRedo,
        addItem,
        adaptCatalogData
    ]);

    return (
        <EstimateContext.Provider value={value}>
            {children}
        </EstimateContext.Provider>
    );
}

export function useEstimate(): EstimateContextValue {
    const context = useContext(EstimateContext);
    if (!context) {
        throw new Error('useEstimate must be used within an EstimateProvider');
    }
    return context;
}

// Re-export Selection type for use in other files
export type { ClientInfo, MaterialSelection, FiltrationSelection, HeatingSelection, PartsSelection, WorkSelection as WorkItem };