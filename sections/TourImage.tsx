import React from 'react';

type TourImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
};

const SIZES = [480, 768, 1000, 1400];

const replaceSize = (src: string, width: number, height: number) =>
  src.replace(/\/(\d+)\/(\d+)(?=$)/, `/${width}/${height}`);

const buildSized = (src: string, width: number, height: number, format?: string) => {
  const base = replaceSize(src, width, height);
  return format ? `${base}.${format}` : base;
};

const buildSrcSet = (src: string, format?: string) =>
  SIZES.map((width) => {
    const height = Math.round(width * 0.8);
    const url = buildSized(src, width, height, format);
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
      <source type="image/avif" srcSet={buildSrcSet(src, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={buildSrcSet(src, 'webp')} sizes={sizes} />
      <img
        src={buildSized(src, 1000, 800)}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : loading}
        decoding="async"
        fetchPriority={priority ? 'high' : 'auto'}
        width={1000}
        height={800}
      />
    </picture>
  );
};

export default TourImage;
