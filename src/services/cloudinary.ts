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

export async function uploadImageToCloudinary(file: File): Promise<{
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

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) {
        throw new Error('Cloudinary upload failed');
    }

    const data = (await res.json()) as CloudinaryResponse;
    const url = data.secure_url;
    const thumbUrl = data.eager && data.eager.length > 0 ? data.eager[0].secure_url : url;

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
