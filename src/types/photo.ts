export interface PhotoData {
    id: string;
    estimate_id: string;
    file_path: string;
    caption: string;
    stage: string;
    uploaded_by: string;
    uploaded_at: string;
    url?: string; // Public URL
}

export interface PhotoContextType {
    photos: PhotoData[];
    loading: boolean;
    error: string | null;
    getPhotos: (estimateId: string) => Promise<PhotoData[]>;
    uploadPhoto: (estimateId: string, file: File, caption?: string, stage?: string) => Promise<PhotoData | null>;
    deletePhoto: (photoId: string) => Promise<boolean>;
    getPhotoUrl: (filePath: string) => string | null;
}
