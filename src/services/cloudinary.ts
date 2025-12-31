import { compressImage } from '@/utils/imageCompression';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';

interface CloudinaryResponse {
    secure_url: string;
    public_id?: string;
    resource_type?: string;
    format?: string;
    width?: number;
    height?: number;
    eager?: Array<{ secure_url: string }>;
}

/**
 * Generate optimized Cloudinary URL with transformations
 * @param url - Original Cloudinary URL
 * @param options - Transformation options
 */
export function getOptimizedCloudinaryUrl(
    url: string,
    options: {
        width?: number;
        height?: number;
        quality?: 'auto' | number;
        format?: 'auto' | 'webp' | 'jpg' | 'png';
    } = {}
): string {
    if (!url.includes('cloudinary.com')) return url;

    const { width, height, quality = 'auto', format = 'auto' } = options;

    // Build transformation string
    const transformations: string[] = [];
    if (width) transformations.push(`w_${width}`);
    if (height) transformations.push(`h_${height}`);
    transformations.push(`q_${quality}`);
    transformations.push(`f_${format}`);
    transformations.push('c_limit'); // Don't upscale

    const transformation = transformations.join(',');

    // Insert transformation into URL
    // Example: https://res.cloudinary.com/cloud/image/upload/v123/abc.jpg
    // Becomes: https://res.cloudinary.com/cloud/image/upload/w_800,q_auto,f_auto/v123/abc.jpg
    return url.replace('/upload/', `/upload/${transformation}/`);
}

/**
 * Upload image to Cloudinary with optional client-side compression
 * @param file - File to upload
 * @param compress - Whether to compress before upload (default: true for images)
 */
export async function uploadImageToCloudinary(
    file: File,
    compress: boolean = true
): Promise<{
    url: string;
    thumbUrl: string;
    public_id?: string;
    resource_type?: string;
    format?: string;
    width?: number;
    height?: number;
}> {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        throw new Error('Cloudinary configuration missing. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.');
    }

    let fileToUpload = file;

    // Compress image before upload (skip for videos)
    const isImage = file.type.startsWith('image/');
    if (compress && isImage) {
        console.log('Compressing image before Cloudinary upload...');
        fileToUpload = await compressImage(file, {
            maxWidth: 4096,
            quality: 0.9
        });
    }

    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Cloudinary upload failed:', errorData);
        throw new Error(`Cloudinary upload failed: ${res.status} ${res.statusText}`);
    }

    const data = (await res.json()) as CloudinaryResponse;
    const url = data.secure_url;


    // const thumbUrl = data.eager && data.eager.length > 0 ? data.eager[0].secure_url : url;
    // Generate optimized thumbnail URL (800px width, auto quality, auto format)
    const thumbUrl = getOptimizedCloudinaryUrl(url, {
        width: 800,
        quality: 'auto',
        format: 'auto'
    });

    return {
        url,
        thumbUrl,
        public_id: data.public_id,
        resource_type: data.resource_type,
        format: data.format,
        width: data.width,
        height: data.height,
    };
}
