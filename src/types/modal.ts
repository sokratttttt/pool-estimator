export interface ModalState {
    id: string;
    isOpen: boolean;
    [key: string]: any;
}

export interface ModalContextType {
    modals: ModalState[];
    openModal: (id: string, props?: Record<string, any>) => void;
    closeModal: (id: string) => void;
    closeAllModals: () => void;
    toggleModal: (id: string, props?: Record<string, any>) => void;
    isModalOpen: (id: string) => boolean;
}
