/**
 * File utilities
 * Helper functions for file operations
 */

/**
 * Read file as text
 */
export const readFileAsText = (file: any) => {
    return new Promise((resolve: any, reject: any) => {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => resolve(e.target?.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
};

/**
 * Read file as data URL
 */
export const readFileAsDataURL = (file: any) => {
    return new Promise((resolve: any, reject: any) => {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => resolve(e.target?.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Read file as array buffer
 */
export const readFileAsArrayBuffer = (file: any) => {
    return new Promise((resolve: any, reject: any) => {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => resolve(e.target?.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: any) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get file extension
 */
export const getFileExtension = (filename: any) => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

/**
 * Validate file type
 */
export const validateFileType = (file: any, allowedTypes: any) => {
    const extension = getFileExtension(file.name).toLowerCase();
    return allowedTypes.some(type => {
        if (type.startsWith('.')) {
            return type.slice(1).toLowerCase() === extension;
        }
        return file.type.match(type);
    });
};

/**
 * Validate file size
 */
export const validateFileSize = (file: any, maxSize: any) => {
    return file.size <= maxSize;
};

/**
 * Compress image
 */
export const compressImage = (file: any, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
    return new Promise((resolve: any, reject: any) => {
        const reader = new FileReader();

        reader.onload = (e: ProgressEvent<FileReader>) => {
            const img = new Image();

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round(height * maxWidth / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round(width * maxHeight / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                }

                canvas.toBlob(
                    (blob: any) => resolve(new File([blob], file.name, { type: file.type })),
                    file.type,
                    quality
                );
            };

            img.onerror = reject;
            img.src = e.target?.result as string;
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Download file
 */
export const downloadFile = (blob: any, filename: any) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

/**
 * Convert data URL to Blob
 */
export const dataURLtoBlob = (dataURL: any) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
};

/**
 * Create file from text
 */
export const createTextFile = (text: any, filename: any, type = 'text/plain') => {
    const blob = new Blob([text], { type });
    return new File([blob], filename, { type });
};
