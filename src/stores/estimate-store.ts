/**
 * Zustand Store for Estimates
 * Replaces EstimateContext to reduce re-renders
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface Selection {
    material?: any;
    dimensions?: any;
    bowl?: any;
    filtration?: any;
    heating?: any;
    parts?: any;
    additional?: any[];
    clientInfo?: {
        name: string;
        phone: string;
        email: string;
    };
}

interface EstimateState {
    // State
    selection: Selection;
    allItems: any[];
    isInitialized: boolean;
    lastSaved: Date | null;

    // History
    history: Selection[];
    historyIndex: number;

    // Actions
    updateSelection: (key: string, value: any) => void;
    setAllItems: (items: any[]) => void;

    // History actions
    undo: () => void;
    redo: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;

    // Utility
    reset: () => void;
}

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
        email: '',
    },
};

export const useEstimateStore = create<EstimateState>()(
    devtools(
        persist(
            (set: any, get: any) => ({
                // Initial state
                selection: defaultSelection,
                allItems: [] as any[],
                isInitialized: false as boolean,
                lastSaved: null as Date | null,
                history: [defaultSelection],
                historyIndex: 0,

                // Update selection with history tracking
                updateSelection: (key: string, value: any) => {
                    set((state: any) => {
                        const newSelection = { ...state.selection, [key]: value };

                        // Add to history (trim future if not at end)
                        const newHistory = state.history.slice(0, state.historyIndex + 1);
                        newHistory.push(newSelection);

                        // Limit history to 20 items
                        const limitedHistory = newHistory.length > 20
                            ? newHistory.slice(-20)
                            : newHistory;

                        return {
                            selection: newSelection,
                            history: limitedHistory,
                            historyIndex: limitedHistory.length - 1,
                            lastSaved: new Date(),
                        };
                    });
                },

                setAllItems: (items: any[]) => {
                    set({ allItems: items });
                },

                // History controls
                undo: () => {
                    set((state: any) => {
                        if (state.historyIndex > 0) {
                            const newIndex = state.historyIndex - 1;
                            return {
                                historyIndex: newIndex,
                                selection: state.history[newIndex],
                            };
                        }
                        return state;
                    });
                },

                redo: () => {
                    set((state: any) => {
                        if (state.historyIndex < state.history.length - 1) {
                            const newIndex = state.historyIndex + 1;
                            return {
                                historyIndex: newIndex,
                                selection: state.history[newIndex],
                            };
                        }
                        return state;
                    });
                },

                canUndo: () => get().historyIndex > 0,
                canRedo: () => get().historyIndex < get().history.length - 1,

                reset: () => {
                    set({
                        selection: defaultSelection,
                        allItems: [],
                        history: [defaultSelection],
                        historyIndex: 0,
                    });
                },
            }),
            {
                name: 'estimate-storage',
                // Only persist selection, not computed state
                partialize: (state: any) => ({
                    selection: state.selection,
                    history: state.history,
                    historyIndex: state.historyIndex,
                }),
            }
        ),
        {
            name: 'estimate-store',
        }
    )
);
