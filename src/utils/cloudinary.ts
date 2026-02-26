/**
 * Cloudinary Utility
 * Cloud Name: dhtcup7uv
 */

const CLOUD_NAME = 'dhtcup7uv';

interface CloudinaryOptions {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
}

/**
 * Generates an optimized Cloudinary URL
 * @param publicId The public ID of the asset
 * @param options Transformation options
 * @returns Fully qualified Cloudinary URL
 */
export const getCloudinaryUrl = (publicId: string, options: CloudinaryOptions & { resourceType?: 'image' | 'video' } = {}) => {
    const {
        width,
        height,
        crop = 'fill',
        quality = 'auto:good',
        format = 'auto',
        resourceType = 'image'
    } = options;

    const transformations = [
        `f_${format}`,
        `q_${quality}`,
        crop ? `c_${crop}` : '',
        width ? `w_${width}` : '',
        height ? `h_${height}` : '',
    ].filter(Boolean).join(',');

    return `https://res.cloudinary.com/${CLOUD_NAME}/${resourceType}/upload/${transformations}/${publicId}`;
};

/**
 * Builds srcSet strings for AVIF, WebP, and JPEG fallback.
 * Use with <picture><source> to guarantee modern format delivery.
 */
export const buildFormatSrcSets = (
    publicId: string,
    widths: number[],
    options: Omit<CloudinaryOptions, 'format'> & { resourceType?: 'image' | 'video' } = {},
) => {
    const buildSrcSet = (format: string) =>
        widths
            .map((w) => {
                const h = options.height
                    ? Math.round((options.height / (options.width || w)) * w)
                    : undefined;
                const url = getCloudinaryUrl(publicId, { ...options, width: w, height: h, format });
                return `${url} ${w}w`;
            })
            .join(', ');

    return {
        avif: buildSrcSet('avif'),
        webp: buildSrcSet('webp'),
        jpg: buildSrcSet('jpg'),
    };
};
