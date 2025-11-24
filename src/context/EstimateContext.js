'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import dynamicPrices from '@/data/prices.json';

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

    const [catalog, setCatalog] = useState({ bowls: [], additional: [], filtration: [], heating: [], parts: [] });
    const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);

    // Load catalog on mount
    useEffect(() => {
        const loadCatalog = async () => {
            setIsLoadingCatalog(true);
            try {
                if (!supabase) {
                    console.warn('Supabase not configured');
                    setIsLoadingCatalog(false);
                    return;
                }

                const { data: products, error } = await supabase
                    .from('products')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // Group products by category
                const grouped = {
                    bowls: [],
                    heating: [],
                    filtration: [],
                    parts: [],
                    additional: []
                };

                (products || []).forEach(product => {
                    // Map 'accessories' to 'additional' if needed, or keep as is
                    // The API mapped 'additional' -> 'accessories' in one place, but here it expects 'additional'
                    // Let's follow the API logic:
                    // API: grouped[product.category].push(product)
                    // Categories in DB: bowls, heating, filtration, parts, additional (or accessories?)
                    // Let's handle both just in case
                    if (grouped[product.category]) {
                        grouped[product.category].push(product);
                    } else if (product.category === 'accessories') {
                        grouped.additional.push(product);
                    }
                });

                setCatalog(grouped);
            } catch (err) {
                console.error('Failed to load catalog:', err);
                toast.error('Не удалось загрузить каталог. Попробуйте обновить страницу.');
            } finally {
                setIsLoadingCatalog(false);
            }
        };

        loadCatalog();
    }, []);

    // Ensure selected items are in the catalog (for legacy/custom items)
    useEffect(() => {
        if (isLoadingCatalog) return;

        setCatalog(prev => {
            const next = { ...prev };
            let hasChanges = false;

            // Check Bowl
            if (selection.bowl && !next.bowls?.find(b => b.id === selection.bowl.id)) {
                next.bowls = [...(next.bowls || []), selection.bowl];
                hasChanges = true;
            }

            // Check Heating
            if (selection.heating && !next.heating?.find(h => h.id === selection.heating.id)) {
                next.heating = [...(next.heating || []), selection.heating];
                hasChanges = true;
            }

            // Check Filtration
            if (selection.filtration && !next.filtration?.find(f => f.id === selection.filtration.id)) {
                next.filtration = [...(next.filtration || []), selection.filtration];
                hasChanges = true;
            }

            return hasChanges ? next : prev;
        });
    }, [selection, isLoadingCatalog]);

    // Undo/Redo functions
    const undo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setSelection(history[newIndex]);
            toast.success('Отменено');
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setSelection(history[newIndex]);
            toast.success('Возвращено');
        }
    };

    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    const updateSelection = (key, value) => {
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
    };

    // Save to localStorage whenever selection changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('pool-estimate-selection', JSON.stringify(selection));
                setLastSaved(new Date());
            } catch (error) {
                console.error('Failed to save selection:', error);
            }
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
    const getDynamicPrice = (itemName, defaultPrice) => {
        if (!itemName) return defaultPrice;
        // Check if we have a dynamic price for this item name
        const dynamic = dynamicPrices[itemName];
        return dynamic !== undefined ? dynamic : defaultPrice;
    };

    const updateCatalog = (type, newItems) => {
        setCatalog(prev => {
            const updated = { ...prev };
            // Merge new items with existing ones, avoiding duplicates by ID
            const existingIds = new Set(updated[type]?.map(i => i.id));
            const uniqueNewItems = newItems.filter(i => !existingIds.has(i.id));

            updated[type] = [...(updated[type] || []), ...uniqueNewItems];
            return updated;
        });
        toast.success(`Каталог обновлен: добавлено ${newItems.length} позиций`);
    };

    return (
        <EstimateContext.Provider value={{ selection, setSelection, updateSelection, getDynamicPrice, catalog, isLoadingCatalog, updateCatalog, isInitialized, lastSaved, undo, redo, canUndo, canRedo }}>
            {children}
        </EstimateContext.Provider>
    );
}

export function useEstimate() {
    return useContext(EstimateContext);
}
