/**
 * Get the base path for the application
 * In production, this will be '/sa-with-me'
 * In development, this will be ''
 */
export const getBasePath = () => {
    return process.env.NODE_ENV === 'production' ? '/sa-with-me' : '';
};

/**
 * Get the full path for an asset with base path included
 * @param path - The path to the asset (should start with /)
 * @returns The full path with base path prepended
 */
export const getAssetPath = (path: string) => {
    const basePath = getBasePath();
    return `${basePath}${path}`;
};
