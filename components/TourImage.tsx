import React from 'react';
import { getCloudinaryUrl } from '../src/utils/cloudinary';

type TourImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
};

const SIZES = [640, 960, 1440, 2048];

const isCloudinaryId = (src: string) => !src.startsWith('http');

const replaceSize = (src: string, width: number, height: number) =>
  src.replace(/\/(\d+)\/(\d+)(?=$)/, `/${width}/${height}`);

const buildSized = (src: string, width: number, height: number) => {
  if (isCloudinaryId(src)) {
    return getCloudinaryUrl(src, { width, height });
  }
  return replaceSize(src, width, height);
};

const buildSrcSet = (src: string) =>
  SIZES.map((width) => {
    const height = Math.round(width * 0.8);
    const url = buildSized(src, width, height);
    return `${url} ${width}w`;
  }).join(', ');

const TourImage = ({
  src,
  alt,
  className,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  loading = 'lazy',
  priority = false,
}: TourImageProps) => {
  const srcSet = buildSrcSet(src);
  return (
    <picture>
      <img
        src={buildSized(src, 1440, 1152)}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : loading}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        width={1440}
        height={1152}
      />
    </picture>
  );
};

export default TourImage;
