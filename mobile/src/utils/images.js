/**
 * Parse the images field from a listing (handles both JSON array strings and
 * the legacy comma-separated format).
 */
export const parseImages = (images) => {
    if (!images) return [];
    if (typeof images !== 'string') return Array.isArray(images) ? images : [];
    if (images.startsWith('[')) {
        try { return JSON.parse(images); } catch {}
    }
    return images.split(',').filter(Boolean);
};

export const firstImage = (images) => parseImages(images)[0] || null;
