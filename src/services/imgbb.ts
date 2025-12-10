
interface ImgBBResponse {
    url: string;
    thumbUrl: string;
}

export async function uploadImageToImgBB(file: File): Promise<ImgBBResponse> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Image upload failed');
    }

    const data = await response.json();
    return {
        url: data.data.url,
        thumbUrl: data.data.thumb?.url || data.data.display_url || data.data.url, // Fallback chain
    };
}
