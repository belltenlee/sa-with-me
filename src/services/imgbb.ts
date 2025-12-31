
interface ImgBBResponse {
    url: string;
    thumbUrl: string;
}

export async function uploadImageToImgBB(file: File): Promise<ImgBBResponse> {
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

    if (!apiKey) {
        console.error('ImgBB API key is not configured');
        throw new Error('ImgBB API key is missing. Please check your .env.local file.');
    }

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('ImgBB upload failed:', errorData);
        throw new Error(`Image upload failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
        url: data.data.url,
        thumbUrl: data.data.thumb?.url || data.data.display_url || data.data.url, // Fallback chain
    };
}
