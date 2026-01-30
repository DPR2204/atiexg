import React, { useState, useCallback } from 'react';
import Seo from './Seo';
import { GlassNav, GlassFooter } from './shared';
import { buildOrganizationSchema, buildWebSiteSchema } from '../seo';

// Generate gallery images with different seeds for variety
const GALLERY_IMAGES = [
  { id: 1, seed: 'atitlan-lake-1', category: 'Paisajes', aspect: 'landscape' },
  { id: 2, seed: 'atitlan-boat-2', category: 'Lanchas', aspect: 'portrait' },
  { id: 3, seed: 'atitlan-sunset-3', category: 'Atardeceres', aspect: 'landscape' },
  { id: 4, seed: 'atitlan-culture-4', category: 'Cultura', aspect: 'square' },
  { id: 5, seed: 'atitlan-food-5', category: 'Gastronomía', aspect: 'portrait' },
  { id: 6, seed: 'atitlan-volcano-6', category: 'Volcanes', aspect: 'landscape' },
  { id: 7, seed: 'atitlan-artisan-7', category: 'Artesanías', aspect: 'square' },
  { id: 8, seed: 'atitlan-kayak-8', category: 'Aventura', aspect: 'landscape' },
  { id: 9, seed: 'atitlan-village-9', category: 'Pueblos', aspect: 'portrait' },
  { id: 10, seed: 'atitlan-sunrise-10', category: 'Amaneceres', aspect: 'landscape' },
  { id: 11, seed: 'atitlan-market-11', category: 'Mercados', aspect: 'square' },
  { id: 12, seed: 'atitlan-coffee-12', category: 'Café', aspect: 'portrait' },
  { id: 13, seed: 'atitlan-people-13', category: 'Gente', aspect: 'portrait' },
  { id: 14, seed: 'atitlan-nature-14', category: 'Naturaleza', aspect: 'landscape' },
  { id: 15, seed: 'atitlan-dock-15', category: 'Muelles', aspect: 'square' },
  { id: 16, seed: 'atitlan-mountain-16', category: 'Montañas', aspect: 'landscape' },
  { id: 17, seed: 'atitlan-craft-17', category: 'Artesanías', aspect: 'portrait' },
  { id: 18, seed: 'atitlan-water-18', category: 'Paisajes', aspect: 'landscape' },
  { id: 19, seed: 'atitlan-street-19', category: 'Pueblos', aspect: 'square' },
  { id: 20, seed: 'atitlan-bird-20', category: 'Naturaleza', aspect: 'portrait' },
  { id: 21, seed: 'atitlan-church-21', category: 'Cultura', aspect: 'landscape' },
  { id: 22, seed: 'atitlan-flower-22', category: 'Naturaleza', aspect: 'square' },
  { id: 23, seed: 'atitlan-boat-23', category: 'Lanchas', aspect: 'landscape' },
  { id: 24, seed: 'atitlan-night-24', category: 'Atardeceres', aspect: 'portrait' },
];

const CATEGORIES = ['Todos', ...new Set(GALLERY_IMAGES.map((img) => img.category))];

const getImageUrl = (seed: string, width: number, height: number) =>
  `https://picsum.photos/seed/${seed}/${width}/${height}`;

const GaleriaPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [lightboxImage, setLightboxImage] = useState<typeof GALLERY_IMAGES[0] | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  const filteredImages =
    selectedCategory === 'Todos'
      ? GALLERY_IMAGES
      : GALLERY_IMAGES.filter((img) => img.category === selectedCategory);

  const handleImageLoad = useCallback((id: number) => {
    setLoadedImages((prev) => new Set([...prev, id]));
  }, []);

  const openLightbox = (image: typeof GALLERY_IMAGES[0]) => {
    setLightboxImage(image);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxImage(null);
    document.body.style.overflow = '';
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (!lightboxImage) return;
    const currentIndex = filteredImages.findIndex((img) => img.id === lightboxImage.id);
    const newIndex =
      direction === 'next'
        ? (currentIndex + 1) % filteredImages.length
        : (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    setLightboxImage(filteredImages[newIndex]);
  };

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxImage) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox('prev');
      if (e.key === 'ArrowRight') navigateLightbox('next');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImage]);

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title="Galería | Atitlán Experiences - Fotos del Lago de Atitlán"
        description="Explora nuestra galería de fotos del Lago de Atitlán, Guatemala. Paisajes, cultura, gastronomía y aventuras en el lago más hermoso del mundo."
        canonicalPath="/galeria"
        structuredData={[buildOrganizationSchema(), buildWebSiteSchema()]}
      />
      <GlassNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Header */}
        <div className="mb-10 sm:mb-16 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-px w-8 bg-red-500" />
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-red-500">
              Momentos capturados
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-[0.95] tracking-tight mb-6">
            Galería
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
              de Atitlán
            </span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl">
            Una colección de los momentos más especiales en el Lago de Atitlán. Próximamente
            actualizaremos con fotos de nuestras propias experiencias.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-10 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20'
                    : 'glass-card text-gray-600 hover:bg-white/80'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry Gallery */}
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
                  onClick={() => openLightbox(image)}
                  className="group relative w-full overflow-hidden rounded-2xl glass-card hover:shadow-xl transition-all duration-500"
                >
                  <div className={`relative ${aspectClass}`}>
                    {/* Skeleton Loader */}
                    {!isLoaded && (
                      <div className="absolute inset-0 bg-gray-100 animate-pulse" />
                    )}
                    <img
                      src={getImageUrl(
                        image.seed,
                        image.aspect === 'portrait' ? 600 : 800,
                        image.aspect === 'portrait' ? 800 : image.aspect === 'square' ? 600 : 600
                      )}
                      alt={`${image.category} - Lago de Atitlán`}
                      className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                        isLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      loading="lazy"
                      onLoad={() => handleImageLoad(image.id)}
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Category Badge */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                      <span className="px-3 py-1 glass-card text-[10px] font-bold uppercase tracking-wider rounded-full">
                        {image.category}
                      </span>
                      <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"/>
                        </svg>
                      </span>
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
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No hay imágenes</h3>
            <p className="text-gray-500">No hay fotos en esta categoría todavía.</p>
          </div>
        )}

        {/* Info Banner */}
        <div className="mt-16 glass-card rounded-3xl p-8 sm:p-12 text-center animate-fade-in-up">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/25">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-3">¿Tienes fotos increíbles?</h3>
          <p className="text-gray-500 max-w-xl mx-auto mb-6">
            Comparte tus mejores momentos en Atitlán con nosotros. Próximamente actualizaremos esta
            galería con fotos reales de nuestras experiencias y de viajeros como tú.
          </p>
          <a
            href="https://wa.me/50222681264?text=¡Hola! Quiero compartir mis fotos de Atitlán"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-red-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Enviar fotos
          </a>
        </div>
      </main>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-fade-in"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          {/* Navigation Buttons */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox('prev');
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label="Anterior"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateLightbox('next');
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label="Siguiente"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>

          {/* Image */}
          <div
            className="relative max-w-5xl max-h-[85vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={getImageUrl(lightboxImage.seed, 1200, 800)}
              alt={`${lightboxImage.category} - Lago de Atitlán`}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl animate-scale-in"
            />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <span className="px-4 py-2 glass-card rounded-full text-sm font-bold">
                {lightboxImage.category}
              </span>
              <span className="text-white/50 text-sm">
                {filteredImages.findIndex((img) => img.id === lightboxImage.id) + 1} /{' '}
                {filteredImages.length}
              </span>
            </div>
          </div>
        </div>
      )}

      <GlassFooter />
    </div>
  );
};

export default GaleriaPage;
