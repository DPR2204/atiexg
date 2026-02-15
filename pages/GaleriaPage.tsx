import React, { useState, useCallback, useRef, useEffect } from 'react';
import Seo from '../components/Seo';
import { GlassNav, GlassFooter } from '../components/shared';
import { buildOrganizationSchema, buildWebSiteSchema } from '../seo';

import cloudinaryAssets from '../src/data/cloudinary-assets.json';
import { getCloudinaryUrl } from '../src/utils/cloudinary';

// Dynamic Gallery images from Cloudinary
const GALLERY_IMAGES = cloudinaryAssets.map((asset, index) => ({
  id: index + 1,
  public_id: asset.public_id,
  category: 'Atitlán',
  aspect: (asset.width / asset.height) > 1.2 ? 'landscape' : (asset.width / asset.height) < 0.8 ? 'portrait' : 'square',
  title: asset.display_name || 'Lago de Atitlán',
  location: 'Lago de Atitlán'
}));

const CATEGORIES = ['Todos', ...new Set(GALLERY_IMAGES.map((img) => img.category))];

type ViewMode = 'grid' | 'museum' | 'fullscreen';
type ImageType = typeof GALLERY_IMAGES[0];

const getImageUrl = (public_id: string, width: number, height: number) =>
  getCloudinaryUrl(public_id, { width, height });

const GaleriaPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  const museumRef = useRef<HTMLDivElement>(null);
  const slideshowIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const thumbnailStripRef = useRef<HTMLDivElement>(null);

  const filteredImages =
    selectedCategory === 'Todos'
      ? GALLERY_IMAGES
      : GALLERY_IMAGES.filter((img) => img.category === selectedCategory);

  const handleImageLoad = useCallback((id: number) => {
    setLoadedImages((prev) => new Set([...prev, id]));
  }, []);

  // Slideshow logic
  useEffect(() => {
    if (isSlideshow && viewMode !== 'grid') {
      slideshowIntervalRef.current = setInterval(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % filteredImages.length);
          setIsTransitioning(false);
        }, 500);
      }, 4000);
    }
    return () => {
      if (slideshowIntervalRef.current) {
        clearInterval(slideshowIntervalRef.current);
      }
    };
  }, [isSlideshow, viewMode, filteredImages.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode === 'grid') return;
      if (e.key === 'Escape') {
        setViewMode('grid');
        setIsSlideshow(false);
      }
      if (e.key === 'ArrowLeft') navigateImage('prev');
      if (e.key === 'ArrowRight') navigateImage('next');
      if (e.key === ' ') {
        e.preventDefault();
        setIsSlideshow((prev) => !prev);
      }
      if (e.key === 'i') setShowInfo((prev) => !prev);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, filteredImages.length]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) navigateImage('next');
    if (isRightSwipe) navigateImage('prev');
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    setCurrentIndex((prev) =>
      direction === 'next'
        ? (prev + 1) % filteredImages.length
        : (prev - 1 + filteredImages.length) % filteredImages.length
    );
  };

  // Auto-scroll thumbnail strip to center the active thumbnail
  useEffect(() => {
    if ((viewMode === 'museum' || viewMode === 'fullscreen') && thumbnailStripRef.current) {
      const activeThumb = thumbnailStripRef.current.children[currentIndex] as HTMLElement;
      if (activeThumb) {
        activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentIndex, viewMode]);

  const enterMuseum = (index: number) => {
    setCurrentIndex(index);
    setViewMode('museum');
    document.body.style.overflow = 'hidden';
  };

  const exitMuseum = () => {
    setViewMode('grid');
    setIsSlideshow(false);
    document.body.style.overflow = '';
  };

  const currentImage = filteredImages[currentIndex];

  // Museum View - Fullscreen immersive experience
  if (viewMode === 'museum' || viewMode === 'fullscreen') {
    return (
      <div
        className="fixed inset-0 z-[100] bg-black"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        ref={museumRef}
      >
        <Seo
          title={`${currentImage?.title || 'Galería'} | Museo Atitlán Experiences`}
          description="Explora nuestra galería inmersiva del Lago de Atitlán"
          canonicalPath="/galeria"
          structuredData={[buildOrganizationSchema(), buildWebSiteSchema()]}
        />

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            {/* Back Button */}
            <button
              onClick={exitMuseum}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden sm:inline text-sm font-medium">Volver</span>
            </button>

            {/* Center - Title */}
            <div className="hidden md:flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-white/80 text-sm font-medium tracking-wide">
                MUSEO ATITLÁN
              </span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {/* Info Toggle */}
              <button
                onClick={() => setShowInfo(!showInfo)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${showInfo ? 'bg-white text-gray-900' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                title="Mostrar/Ocultar Info (I)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              {/* Slideshow Toggle */}
              <button
                onClick={() => setIsSlideshow(!isSlideshow)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isSlideshow ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                title="Slideshow (Espacio)"
              >
                {isSlideshow ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Main Image Area */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Navigation Arrows - Desktop */}
          <button
            onClick={() => navigateImage('prev')}
            className="hidden md:flex absolute left-4 lg:left-8 z-10 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all duration-300"
            aria-label="Anterior"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={() => navigateImage('next')}
            className="hidden md:flex absolute right-4 lg:right-8 z-10 w-14 h-14 rounded-full bg-white/10 backdrop-blur-md items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all duration-300"
            aria-label="Siguiente"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Image Container */}
          <div
            className={`relative w-full h-full flex items-center justify-center p-4 sm:p-8 lg:p-16 transition-all duration-500 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
          >
            {currentImage && (
              <img
                src={getImageUrl(currentImage.public_id, 2400, 1800)}
                alt={currentImage.title}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                style={{
                  filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5))',
                }}
              />
            )}
          </div>
        </div>

        {/* Bottom Info Panel */}
        <div
          className={`absolute bottom-0 left-0 right-0 z-20 transition-all duration-500 ${showInfo ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
            }`}
        >
          <div className="bg-gradient-to-t from-black via-black/80 to-transparent pt-20 pb-6 px-4 sm:px-8">
            <div className="max-w-4xl mx-auto">
              {/* Image Info */}
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
                    {currentImage?.category}
                  </span>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">
                    {currentImage?.title}
                  </h2>
                  <p className="text-white/60 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {currentImage?.location}
                  </p>
                </div>

                {/* Counter */}
                <div className="flex items-center gap-4">
                  <span className="text-white/50 text-sm font-mono">
                    {String(currentIndex + 1).padStart(2, '0')} / {String(filteredImages.length).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Thumbnail Strip */}
              <div ref={thumbnailStripRef} className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {filteredImages.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => setCurrentIndex(index)}
                    className={`relative flex-shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden transition-all duration-300 ${index === currentIndex
                      ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-black scale-110'
                      : 'opacity-50 hover:opacity-100'
                      }`}
                  >
                    <img
                      src={getImageUrl(img.public_id, 300, 225)}
                      alt={img.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="md:hidden absolute bottom-32 left-1/2 -translate-x-1/2 z-10 animate-pulse">
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            Desliza para navegar
          </div>
        </div>

        {/* Progress Bar for Slideshow */}
        {isSlideshow && (
          <div className="absolute top-0 left-0 right-0 h-1 z-30">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-red-600"
              style={{
                animation: 'slideProgress 4s linear infinite',
              }}
            />
            <style>{`
              @keyframes slideProgress {
                from { width: 0%; }
                to { width: 100%; }
              }
            `}</style>
          </div>
        )}
      </div>
    );
  }

  // Grid View - Default gallery layout
  return (
    <div className="min-h-screen bg-gray-950">
      <Seo
        title="Galería | Atitlán Experiences - Fotos del Lago de Atitlán"
        description="Explora nuestra galería de fotos del Lago de Atitlán, Guatemala. Paisajes, cultura, gastronomía y aventuras en el lago más hermoso del mundo."
        canonicalPath="/galeria"
        structuredData={[buildOrganizationSchema(), buildWebSiteSchema()]}
      />
      <GlassNav />

      {/* Hero Header */}
      <header className="relative pt-24 pb-12 sm:pt-32 sm:pb-16 px-4 sm:px-6 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-950 to-gray-950" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            {/* Title */}
            <div className="animate-fade-in-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/25">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-red-400">
                  El Museo
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[0.95] tracking-tight">
                Galería
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                  Inmersiva
                </span>
              </h1>
              <p className="mt-4 text-lg text-gray-400 max-w-xl">
                Una experiencia visual del Lago de Atitlán. Haz clic en cualquier imagen para entrar al museo.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="text-center">
                <span className="block text-3xl font-bold text-white">{GALLERY_IMAGES.length}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wider">Fotos</span>
              </div>
              <div className="w-px bg-gray-800" />
              <div className="text-center">
                <span className="block text-3xl font-bold text-white">{CATEGORIES.length - 1}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wider">Categorías</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Bar - Sticky */}
      <div className="sticky top-16 z-40 bg-gray-950/90 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide flex-1">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setCurrentIndex(0);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${selectedCategory === category
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Enter Museum Button */}
            <button
              onClick={() => enterMuseum(0)}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-gray-900 font-bold text-sm hover:bg-gray-100 transition-all duration-300 shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
              Entrar al Museo
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {filteredImages.map((image, index) => {
            const isLoaded = loadedImages.has(image.id);
            const aspectClass =
              image.aspect === 'portrait'
                ? 'aspect-[3/4]'
                : image.aspect === 'square'
                  ? 'aspect-square'
                  : 'aspect-[4/3]';

            return (
              <div
                key={image.id}
                className="break-inside-avoid animate-fade-in-up"
                style={{ animationDelay: `${(index % 8) * 50}ms` }}
              >
                <button
                  onClick={() => enterMuseum(index)}
                  className="group relative w-full overflow-hidden rounded-2xl bg-gray-800/50 hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500"
                >
                  <div className={`relative ${aspectClass}`}>
                    {/* Skeleton Loader */}
                    {!isLoaded && (
                      <div className="absolute inset-0 bg-gray-800 animate-pulse" />
                    )}
                    <img
                      src={getImageUrl(
                        image.public_id,
                        image.aspect === 'portrait' ? 900 : 1200,
                        image.aspect === 'portrait' ? 1200 : image.aspect === 'square' ? 1200 : 900
                      )}
                      alt={image.title}
                      className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                      loading="lazy"
                      onLoad={() => handleImageLoad(image.id)}
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                      <span className="inline-block self-start px-2.5 py-1 rounded-full bg-red-500/80 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-white mb-2">
                        {image.category}
                      </span>
                      <h3 className="text-lg font-bold text-white mb-0.5">{image.title}</h3>
                      <p className="text-xs text-white/60 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {image.location}
                      </p>
                    </div>

                    {/* Zoom Icon */}
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredImages.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-800 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No hay imágenes</h3>
            <p className="text-gray-500">No hay fotos en esta categoría todavía.</p>
          </div>
        )}

        {/* Mobile Museum Button */}
        <div className="sm:hidden fixed bottom-6 right-6 z-50">
          <button
            onClick={() => enterMuseum(0)}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white shadow-xl shadow-red-500/30 flex items-center justify-center hover:scale-110 transition-transform"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
          </button>
        </div>

        {/* CTA Banner */}
        <div className="mt-16 rounded-3xl overflow-hidden">
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 sm:p-12 text-center">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
              <div className="absolute -top-20 -left-20 w-60 h-60 bg-red-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-orange-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/25">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">
                ¿Tienes fotos increíbles?
              </h3>
              <p className="text-gray-400 max-w-xl mx-auto mb-6">
                Comparte tus mejores momentos en Atitlán con nosotros. Próximamente actualizaremos esta
                galería con fotos reales de nuestras experiencias y de viajeros como tú.
              </p>
              <a
                href="https://wa.me/50222681264?text=¡Hola! Quiero compartir mis fotos de Atitlán"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-gray-100 transition-colors shadow-lg"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Enviar fotos
              </a>
            </div>
          </div>
        </div>
      </main>

      <GlassFooter />
    </div>
  );
};

export default GaleriaPage;
