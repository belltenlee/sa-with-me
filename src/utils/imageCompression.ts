export interface CompressionOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    type?: string;
}

export async function compressImage(file: File, options: CompressionOptions = {}): Promise<File> {
    const {
        maxWidth = 1920,
        maxHeight = 1920,
        quality = 0.8,
        type = 'image/jpeg'
    } = options;

    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.src = e.target?.result as string;
        };

        reader.onerror = (e) => {
            reject(new Error('Failed to read image file'));
        };

        img.onload = () => {
            let width = img.width;
            let height = img.height;

            // Calculate new dimensions
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            // Draw image on canvas
            ctx.drawImage(img, 0, 0, width, height);

            // Convert to blob/file
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Canvas to Blob conversion failed'));
                    return;
                }
                const newFile = new File([blob], file.name, {
                    type: type,
                    lastModified: Date.now(),
                });
                resolve(newFile);
            }, type, quality);
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        reader.readAsDataURL(file);
    });
}
