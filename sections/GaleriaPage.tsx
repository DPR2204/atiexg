import React, { useState, useCallback, useEffect, useRef } from 'react';
import Seo from './Seo';
import { GlassNav, GlassFooter } from './shared';
import { buildOrganizationSchema, buildWebSiteSchema } from '../seo';

// Gallery images with categories
const GALLERY_IMAGES = [
  { id: 1, seed: 'atitlan-lake-1', category: 'Paisajes', aspect: 'landscape', title: 'Vista panorámica del lago', description: 'El majestuoso Lago de Atitlán rodeado de volcanes' },
  { id: 2, seed: 'atitlan-boat-2', category: 'Lanchas', aspect: 'portrait', title: 'Lancha tradicional', description: 'Navegando las aguas cristalinas' },
  { id: 3, seed: 'atitlan-sunset-3', category: 'Atardeceres', aspect: 'landscape', title: 'Atardecer dorado', description: 'Los colores del cielo reflejados en el agua' },
  { id: 4, seed: 'atitlan-culture-4', category: 'Cultura', aspect: 'square', title: 'Tradiciones mayas', description: 'El legado vivo de los pueblos originarios' },
  { id: 5, seed: 'atitlan-food-5', category: 'Gastronomía', aspect: 'portrait', title: 'Sabores locales', description: 'La riqueza culinaria guatemalteca' },
  { id: 6, seed: 'atitlan-volcano-6', category: 'Volcanes', aspect: 'landscape', title: 'Volcán San Pedro', description: 'Imponente guardián del lago' },
  { id: 7, seed: 'atitlan-artisan-7', category: 'Artesanías', aspect: 'square', title: 'Textiles tradicionales', description: 'Arte tejido a mano por generaciones' },
  { id: 8, seed: 'atitlan-kayak-8', category: 'Aventura', aspect: 'landscape', title: 'Kayak al amanecer', description: 'Aventura sobre aguas tranquilas' },
  { id: 9, seed: 'atitlan-village-9', category: 'Pueblos', aspect: 'portrait', title: 'San Juan La Laguna', description: 'Colores y vida en cada rincón' },
  { id: 10, seed: 'atitlan-sunrise-10', category: 'Amaneceres', aspect: 'landscape', title: 'Primer luz del día', description: 'El despertar del lago sagrado' },
  { id: 11, seed: 'atitlan-market-11', category: 'Mercados', aspect: 'square', title: 'Mercado de Chichicastenango', description: 'Colores, aromas y tradición' },
  { id: 12, seed: 'atitlan-coffee-12', category: 'Café', aspect: 'portrait', title: 'Café de altura', description: 'El oro negro guatemalteco' },
  { id: 13, seed: 'atitlan-people-13', category: 'Gente', aspect: 'portrait', title: 'Sonrisas auténticas', description: 'La calidez de su gente' },
  { id: 14, seed: 'atitlan-nature-14', category: 'Naturaleza', aspect: 'landscape', title: 'Flora nativa', description: 'Biodiversidad única del altiplano' },
  { id: 15, seed: 'atitlan-dock-15', category: 'Muelles', aspect: 'square', title: 'Muelle de Panajachel', description: 'Puerta de entrada al lago' },
  { id: 16, seed: 'atitlan-mountain-16', category: 'Montañas', aspect: 'landscape', title: 'Sierra de las Minas', description: 'Horizontes infinitos' },
  { id: 17, seed: 'atitlan-craft-17', category: 'Artesanías', aspect: 'portrait', title: 'Cerámica artesanal', description: 'Tradición milenaria en barro' },
  { id: 18, seed: 'atitlan-water-18', category: 'Paisajes', aspect: 'landscape', title: 'Reflejos del lago', description: 'Espejo natural perfecto' },
  { id: 19, seed: 'atitlan-street-19', category: 'Pueblos', aspect: 'square', title: 'Calles empedradas', description: 'Historia en cada paso' },
  { id: 20, seed: 'atitlan-bird-20', category: 'Naturaleza', aspect: 'portrait', title: 'Aves del lago', description: 'Santuario de vida silvestre' },
  { id: 21, seed: 'atitlan-church-21', category: 'Cultura', aspect: 'landscape', title: 'Iglesia colonial', description: 'Fusión de culturas ancestrales' },
  { id: 22, seed: 'atitlan-flower-22', category: 'Naturaleza', aspect: 'square', title: 'Flores silvestres', description: 'Jardín natural del altiplano' },
  { id: 23, seed: 'atitlan-boat-23', category: 'Lanchas', aspect: 'landscape', title: 'Travesía al atardecer', description: 'Navegando hacia el horizonte' },
  { id: 24, seed: 'atitlan-night-24', category: 'Atardeceres', aspect: 'portrait', title: 'Cielo nocturno', description: 'Estrellas sobre el lago' },
];

const CATEGORIES = ['Todos', ...new Set(GALLERY_IMAGES.map((img) => img.category))];

const getImageUrl = (seed: string, width: number, height: number) =>
  `https://picsum.photos/seed/${seed}/${width}/${height}`;

const GaleriaPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'immersive'>('grid');
  const [showThumbnails, setShowThumbnails] = useState(true);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  const filteredImages =
    selectedCategory === 'Todos'
      ? GALLERY_IMAGES
      : GALLERY_IMAGES.filter((img) => img.category === selectedCategory);

  const currentImage = currentImageIndex !== null ? filteredImages[currentImageIndex] : null;

  const handleImageLoad = useCallback((id: number) => {
    setLoadedImages((prev) => new Set([...prev, id]));
  }, []);

  const openImmersive = (index: number) => {
    setCurrentImageIndex(index);
    setViewMode('immersive');
    document.body.style.overflow = 'hidden';
  };

  const closeImmersive = () => {
    setViewMode('grid');
    setCurrentImageIndex(null);
    document.body.style.overflow = '';
  };

  const navigateTo = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentImageIndex(index);
      setIsTransitioning(false);
    }, 150);
  }, [isTransitioning]);

  const navigateNext = useCallback(() => {
    if (currentImageIndex === null) return;
    const nextIndex = (currentImageIndex + 1) % filteredImages.length;
    navigateTo(nextIndex);
  }, [currentImageIndex, filteredImages.length, navigateTo]);

  const navigatePrev = useCallback(() => {
    if (currentImageIndex === null) return;
    const prevIndex = (currentImageIndex - 1 + filteredImages.length) % filteredImages.length;
    navigateTo(prevIndex);
  }, [currentImageIndex, filteredImages.length, navigateTo]);

  // Scroll thumbnail into view
  useEffect(() => {
    if (currentImageIndex !== null && thumbnailsRef.current) {
      const thumbnail = thumbnailsRef.current.children[currentImageIndex] as HTMLElement;
      if (thumbnail) {
        thumbnail.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [currentImageIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'immersive') return;
      if (e.key === 'Escape') closeImmersive();
      if (e.key === 'ArrowLeft') navigatePrev();
      if (e.key === 'ArrowRight') navigateNext();
      if (e.key === 't' || e.key === 'T') setShowThumbnails(prev => !prev);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, navigateNext, navigatePrev]);

  // Touch/swipe support
  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) navigatePrev();
      else navigateNext();
    }
    touchStartX.current = null;
  };

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title="Galería | Atitlán Experiences - Fotos del Lago de Atitlán"
        description="Explora nuestra galería de fotos del Lago de Atitlán, Guatemala. Paisajes, cultura, gastronomía y aventuras en el lago más hermoso del mundo."
        canonicalPath="/galeria"
        structuredData={[buildOrganizationSchema(), buildWebSiteSchema()]}
      />

      {viewMode === 'grid' && <GlassNav />}

      {/* Immersive Museum Mode */}
      {viewMode === 'immersive' && currentImage && (
        <div
          className="fixed inset-0 z-[100] bg-black flex flex-col"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Bar */}
          <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-4">
              <button
                onClick={closeImmersive}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                <span className="text-sm font-medium hidden sm:inline">Cerrar</span>
              </button>
              <div className="hidden sm:block">
                <span className="text-white/60 text-sm font-mono">
                  {String(currentImageIndex! + 1).padStart(2, '0')} / {String(filteredImages.length).padStart(2, '0')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowThumbnails(!showThumbnails)}
                className={`p-2.5 rounded-xl backdrop-blur-sm transition-all ${showThumbnails ? 'bg-white/20 text-white' : 'bg-white/10 text-white/60 hover:text-white'}`}
                title="Mostrar/ocultar miniaturas (T)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Main Image Area */}
          <div className="flex-1 flex items-center justify-center relative px-4 sm:px-20">
            {/* Navigation Arrows */}
            <button
              onClick={navigatePrev}
              className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all active:scale-95"
              aria-label="Anterior"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <button
              onClick={navigateNext}
              className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all active:scale-95"
              aria-label="Siguiente"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>

            {/* Image Container */}
            <div className={`relative max-w-6xl w-full transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              <img
                src={getImageUrl(currentImage.seed, 1400, 900)}
                alt={currentImage.title}
                className="w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl"
              />

              {/* Image Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent rounded-b-2xl">
                <div className="max-w-2xl">
                  <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider text-white/90 mb-3">
                    {currentImage.category}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{currentImage.title}</h2>
                  <p className="text-white/70 text-sm sm:text-base">{currentImage.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Thumbnails Strip */}
          <div className={`transition-all duration-500 ${showThumbnails ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <div className="bg-gradient-to-t from-black to-black/80 px-4 py-4">
              <div
                ref={thumbnailsRef}
                className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 px-2"
              >
                {filteredImages.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => navigateTo(index)}
                    className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden transition-all duration-300 ${
                      index === currentImageIndex
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-105'
                        : 'opacity-50 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <img
                      src={getImageUrl(image.seed, 160, 160)}
                      alt={image.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Counter */}
          <div className="sm:hidden absolute bottom-32 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-full">
            <span className="text-white/80 text-sm font-mono">
              {currentImageIndex! + 1} / {filteredImages.length}
            </span>
          </div>

          {/* Keyboard Hints */}
          <div className="hidden sm:flex absolute bottom-4 right-4 items-center gap-4 text-white/40 text-xs">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white/10 rounded">←</kbd>
              <kbd className="px-2 py-1 bg-white/10 rounded">→</kbd>
              Navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white/10 rounded">T</kbd>
              Miniaturas
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white/10 rounded">ESC</kbd>
              Cerrar
            </span>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          {/* Header */}
          <div className="mb-10 sm:mb-16 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-4">
              <span className="h-px w-8 bg-red-500" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-red-500">
                Museo digital
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-[0.95] tracking-tight mb-6">
              Galería
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
                de Atitlán
              </span>
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mb-6">
              Explora nuestra colección de momentos capturados en el Lago de Atitlán.
              Haz clic en cualquier imagen para una experiencia inmersiva.
            </p>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Usa las flechas del teclado para navegar entre imágenes</span>
            </div>
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
                    onClick={() => openImmersive(index)}
                    className="group relative w-full overflow-hidden rounded-2xl glass-card hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
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
                        alt={image.title}
                        className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                          isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                        loading="lazy"
                        onLoad={() => handleImageLoad(image.id)}
                      />

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

                      {/* Content on Hover */}
                      <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <span className="inline-block self-start px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[9px] font-bold uppercase tracking-wider text-white mb-2">
                          {image.category}
                        </span>
                        <h3 className="text-white font-bold text-sm mb-1 line-clamp-1">{image.title}</h3>
                        <p className="text-white/70 text-xs line-clamp-2">{image.description}</p>

                        {/* View Button */}
                        <div className="mt-3 flex items-center gap-2 text-white text-xs font-medium">
                          <span className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                            </svg>
                          </span>
                          Ver en museo
                        </div>
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
      )}

      {viewMode === 'grid' && <GlassFooter />}
    </div>
  );
};

export default GaleriaPage;
