import { useState, useCallback, useRef } from 'react';
import { useHistory } from '@/context/HistoryContext';
import { useTemplates } from '@/context/TemplateContext';
import { toast } from 'sonner';
import type {
    UseEstimateSaveReturn,
    EstimateSaveData,
    SaveOptions,
    SaveResult,
    DraftData,
    VersionConflict,
    PublishOptions,
    PublishedEstimate,
    EstimateVersion,
    DifferenceReport
} from '@/types/estimate-save';

export const useEstimateSave = (): UseEstimateSaveReturn => {
    const { saveEstimate: saveToHistory } = useHistory();
    const { saveTemplate } = useTemplates();

    // State
    const [isSaving, setIsSaving] = useState(false);
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [lastSave, setLastSave] = useState<Date | null>(null);
    const [lastError, setLastError] = useState<string | null>(null);
    const [saveCount, setSaveCount] = useState(0);
    const [drafts, setDrafts] = useState<DraftData[]>([]);
    const [conflicts, setConflicts] = useState<VersionConflict[]>([]);

    // Stats refs
    const statsRef = useRef({
        totalSaves: 0,
        successfulSaves: 0,
        failedSaves: 0,
        totalTime: 0,
        lastSize: 0
    });

    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Main methods
    const saveEstimate = useCallback(async (data: EstimateSaveData, options: SaveOptions = { mode: 'create' }): Promise<SaveResult> => {
        const startTime = Date.now();
        setIsSaving(true);
        setLastError(null);
        statsRef.current.totalSaves++;

        try {
            // Simulate API call / Local processing
            await new Promise(resolve => setTimeout(resolve, 500));

            // Use existing history context for actual saving (adapting types)
            saveToHistory(
                data.title,
                { ...data, clientInfo: { name: '', phone: '', email: '' } }, // Mock client info if missing in data structure or adapt
                data.items,
                data.calculations.total
            );

            const result: SaveResult = {
                success: true,
                data: {
                    estimateId: data.id || crypto.randomUUID(),
                    version: data.version + 1,
                    savedAt: new Date(),
                    url: `/estimates/${data.id}`
                }
            };

            setLastSave(new Date());
            setSaveCount(prev => prev + 1);
            statsRef.current.successfulSaves++;
            statsRef.current.totalTime += Date.now() - startTime;
            statsRef.current.lastSize = JSON.stringify(data).length;

            if (options.notify) {
                toast.success('Смета успешно сохранена');
            }

            return result;
        } catch (error: any) {
            console.error('Save error:', error);
            const errorMessage = error.message || 'Ошибка при сохранении';
            setLastError(errorMessage);
            statsRef.current.failedSaves++;

            toast.error(errorMessage);

            return {
                success: false,
                error: {
                    code: 'SAVE_FAILED',
                    message: errorMessage,
                    details: error
                }
            };
        } finally {
            setIsSaving(false);
        }
    }, [saveToHistory]);

    const saveDraft = useCallback(async (data: Partial<EstimateSaveData>, draftName: string = 'Черновик'): Promise<{ draftId: string; savedAt: Date }> => {
        const draftId = crypto.randomUUID();
        const newDraft: DraftData = {
            id: draftId,
            estimateId: data.id,
            data,
            name: draftName,
            lastModified: new Date(),
            autoSaved: false
        };

        setDrafts(prev => [...prev, newDraft]);
        toast.success('Черновик сохранен');
        return { draftId, savedAt: newDraft.lastModified };
    }, []);

    const loadDraft = useCallback((draftId: string): DraftData | null => {
        return drafts.find(d => d.id === draftId) || null;
    }, [drafts]);

    const deleteDraft = useCallback(async (draftId: string): Promise<boolean> => {
        setDrafts(prev => prev.filter(d => d.id !== draftId));
        return true;
    }, []);

    const autoSave = useCallback(async (data: EstimateSaveData) => {
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

        setIsAutoSaving(true);
        // Debounce auto-save
        autoSaveTimerRef.current = setTimeout(async () => {
            try {
                await saveEstimate(data, { mode: 'auto-save', notify: false });
            } finally {
                setIsAutoSaving(false);
            }
        }, 2000);
    }, [saveEstimate]);

    const stopAutoSave = useCallback(() => {
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
            autoSaveTimerRef.current = null;
        }
        setIsAutoSaving(false);
    }, []);

    const publishEstimate = useCallback(async (estimateId: string, _options?: PublishOptions): Promise<PublishedEstimate> => {
        // Mock implementation
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            id: estimateId,
            url: `https://example.com/estimates/${estimateId}`,
            publishedAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        };
    }, []);

    const getVersions = useCallback(async (_estimateId: string): Promise<EstimateVersion[]> => {
        // Mock implementation
        return [];
    }, []);

    const restoreVersion = useCallback(async (_estimateId: string, _version: number): Promise<EstimateSaveData> => {
        throw new Error('Not implemented');
    }, []);

    const compareVersions = useCallback((_estimateId: string, _version1: number, _version2: number): DifferenceReport => {
        return { additions: [], deletions: [], modifications: [] };
    }, []);

    const resolveConflict = useCallback(async (conflictId: string, _resolution: 'keep_local' | 'use_server' | 'merge'): Promise<void> => {
        setConflicts(prev => prev.filter(c => c.localVersion.toString() !== conflictId)); // Simplistic ID check
    }, []);

    const ignoreConflict = useCallback((conflictId: string) => {
        setConflicts(prev => prev.filter(c => c.localVersion.toString() !== conflictId));
    }, []);

    const getSaveStats = useCallback(() => {
        return {
            totalSaves: statsRef.current.totalSaves,
            successfulSaves: statsRef.current.successfulSaves,
            failedSaves: statsRef.current.failedSaves,
            averageSaveTime: statsRef.current.totalSaves > 0 ? statsRef.current.totalTime / statsRef.current.totalSaves : 0,
            lastSaveSize: statsRef.current.lastSize
        };
    }, []);

    const saveTemplateMethod = useCallback(async (name: string, description: string, data: any): Promise<void> => {
        saveTemplate(name, description, data);
        toast.success('Шаблон сохранен');
    }, [saveTemplate]);

    return {
        isSaving,
        isAutoSaving,
        lastSave,
        lastError,
        saveCount,
        drafts,
        conflicts,
        hasUnresolvedConflicts: conflicts.length > 0,
        saveEstimate,
        saveDraft,
        loadDraft,
        deleteDraft,
        autoSave,
        stopAutoSave,
        publishEstimate,
        getVersions,
        restoreVersion,
        compareVersions,
        resolveConflict,
        ignoreConflict,
        getSaveStats,
        saveTemplate: saveTemplateMethod
    };
};
