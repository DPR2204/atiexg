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
export const getCloudinaryUrl = (publicId: string, options: CloudinaryOptions = {}) => {
    const {
        width,
        height,
        crop = 'fill',
        quality = 'auto:good',
        format = 'auto'
    } = options;

    const transformations = [
        `f_${format}`,
        `q_${quality}`,
        crop ? `c_${crop}` : '',
        width ? `w_${width}` : '',
        height ? `h_${height}` : '',
    ].filter(Boolean).join(',');

    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
};
