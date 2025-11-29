import { useState, useCallback } from 'react';

export const useModals = () => {
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [showGanttModal, setShowGanttModal] = useState(false);
    const [showDescriptionModal, setShowDescriptionModal] = useState(false);
    const [showCatalogSelector, setShowCatalogSelector] = useState(false);

    const openSaveModal = useCallback(() => setShowSaveModal(true), []);
    const closeSaveModal = useCallback(() => setShowSaveModal(false), []);

    const openTemplateModal = useCallback(() => setShowTemplateModal(true), []);
    const closeTemplateModal = useCallback(() => setShowTemplateModal(false), []);

    const openGanttModal = useCallback(() => setShowGanttModal(true), []);
    const closeGanttModal = useCallback(() => setShowGanttModal(false), []);

    const openDescriptionModal = useCallback(() => setShowDescriptionModal(true), []);
    const closeDescriptionModal = useCallback(() => setShowDescriptionModal(false), []);

    const openCatalogSelector = useCallback(() => setShowCatalogSelector(true), []);
    const closeCatalogSelector = useCallback(() => setShowCatalogSelector(false), []);

    const closeAllModals = useCallback(() => {
        setShowSaveModal(false);
        setShowTemplateModal(false);
        setShowGanttModal(false);
        setShowDescriptionModal(false);
        setShowCatalogSelector(false);
    }, []);

    return {
        // State
        showSaveModal,
        showTemplateModal,
        showGanttModal,
        showDescriptionModal,
        showCatalogSelector,

        // Setters (for backward compatibility)
        setShowSaveModal,
        setShowTemplateModal,
        setShowGanttModal,
        setShowDescriptionModal,
        setShowCatalogSelector,

        // Actions
        openSaveModal,
        closeSaveModal,
        openTemplateModal,
        closeTemplateModal,
        openGanttModal,
        closeGanttModal,
        openDescriptionModal,
        closeDescriptionModal,
        openCatalogSelector,
        closeCatalogSelector,
        closeAllModals
    };
};
