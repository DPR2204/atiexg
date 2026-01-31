import React, { useState, useEffect, useRef, useCallback } from 'react';
import Seo from './Seo';
import { GlassNav, GlassFooter } from './shared';
import { buildOrganizationSchema, buildWebSiteSchema } from '../seo';

// Gallery images with archive metadata
const GALLERY_IMAGES = [
  {
    id: 1,
    seed: 'atitlan-lake-1',
    archiveCode: 'ATI-01',
    focalLength: '35MM',
    aperture: 'F1.4',
    iso: 'ISO 100',
    category: 'Paisajes',
    title: 'Vista panorámica del lago',
  },
  {
    id: 2,
    seed: 'atitlan-boat-2',
    archiveCode: 'ATI-02',
    focalLength: '50MM',
    aperture: 'F1.8',
    iso: 'ISO 200',
    category: 'Lanchas',
    title: 'Lancha tradicional',
  },
  {
    id: 3,
    seed: 'atitlan-sunset-3',
    archiveCode: 'ATI-03',
    focalLength: '85MM',
    aperture: 'F1.4',
    iso: 'ISO 100',
    category: 'Atardeceres',
    title: 'Atardecer dorado',
  },
  {
    id: 4,
    seed: 'atitlan-culture-4',
    archiveCode: 'ATI-04',
    focalLength: '50MM',
    aperture: 'F2.8',
    iso: 'ISO 400',
    category: 'Cultura',
    title: 'Tradiciones mayas',
  },
  {
    id: 5,
    seed: 'atitlan-food-5',
    archiveCode: 'ATI-05',
    focalLength: '35MM',
    aperture: 'F1.4',
    iso: 'ISO 100',
    category: 'Gastronomía',
    title: 'Sabores locales',
  },
  {
    id: 6,
    seed: 'atitlan-volcano-6',
    archiveCode: 'ATI-06',
    focalLength: '24MM',
    aperture: 'F8',
    iso: 'ISO 100',
    category: 'Volcanes',
    title: 'Volcán San Pedro',
  },
  {
    id: 7,
    seed: 'atitlan-artisan-7',
    archiveCode: 'ATI-07',
    focalLength: '50MM',
    aperture: 'F1.8',
    iso: 'ISO 200',
    category: 'Artesanías',
    title: 'Textiles tradicionales',
  },
  {
    id: 8,
    seed: 'atitlan-kayak-8',
    archiveCode: 'ATI-08',
    focalLength: '70MM',
    aperture: 'F4',
    iso: 'ISO 100',
    category: 'Aventura',
    title: 'Kayak al amanecer',
  },
  {
    id: 9,
    seed: 'atitlan-village-9',
    archiveCode: 'ATI-09',
    focalLength: '35MM',
    aperture: 'F2',
    iso: 'ISO 100',
    category: 'Pueblos',
    title: 'San Juan La Laguna',
  },
  {
    id: 10,
    seed: 'atitlan-sunrise-10',
    archiveCode: 'ATI-10',
    focalLength: '85MM',
    aperture: 'F1.4',
    iso: 'ISO 100',
    category: 'Amaneceres',
    title: 'Primer luz del día',
  },
  {
    id: 11,
    seed: 'atitlan-market-11',
    archiveCode: 'ATI-11',
    focalLength: '24MM',
    aperture: 'F2.8',
    iso: 'ISO 400',
    category: 'Mercados',
    title: 'Mercado de Chichicastenango',
  },
  {
    id: 12,
    seed: 'atitlan-coffee-12',
    archiveCode: 'ATI-12',
    focalLength: '50MM',
    aperture: 'F1.8',
    iso: 'ISO 100',
    category: 'Café',
    title: 'Café de altura',
  },
];

const getImageUrl = (seed: string, width: number, height: number) =>
  `https://picsum.photos/seed/${seed}/${width}/${height}`;

const GaleriaPage = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleImageLoad = useCallback((id: number) => {
    setLoadedImages((prev) => new Set([...prev, id]));
  }, []);

  // Handle scroll for scroll-to-top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection observer for scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '-50px' }
    );

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen museum-bg">
      <Seo
        title="Galería | Atitlán Experiences - Museo Digital del Lago de Atitlán"
        description="Explora nuestra galería inmersiva de fotos del Lago de Atitlán, Guatemala. Una experiencia visual única como caminar por un museo de arte."
        canonicalPath="/galeria"
        structuredData={[buildOrganizationSchema(), buildWebSiteSchema()]}
      />

      <GlassNav />

      {/* Hero Section */}
      <section className="relative h-[60vh] sm:h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-100 to-transparent" />

        <div className="relative z-10 text-center px-4 animate-fade-in-up">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="h-px w-12 bg-gray-400" />
            <span className="property-label text-gray-500">ATITLAN_EXPERIENCES</span>
            <span className="h-px w-12 bg-gray-400" />
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-gray-900 tracking-tight mb-6">
            Galería
          </h1>

          <p className="text-gray-500 text-lg sm:text-xl max-w-md mx-auto mb-12">
            Una experiencia visual inmersiva del Lago de Atitlán
          </p>

          {/* Scroll indicator */}
          <div className="animate-scroll-bounce">
            <svg
              className="w-6 h-6 mx-auto text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Museum Gallery */}
      <main className="relative pb-32">
        {GALLERY_IMAGES.map((image, index) => {
          const isLoaded = loadedImages.has(image.id);

          return (
            <section
              key={image.id}
              className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-8"
              style={{
                marginTop: index === 0 ? 0 : '-15vh',
                zIndex: index + 1,
                position: 'relative'
              }}
            >
              {/* Photo Card */}
              <div
                ref={(el) => { cardRefs.current[index] = el; }}
                className="scroll-reveal museum-card w-full max-w-2xl"
                style={{
                  top: `${10 + (index * 2)}vh`,
                  zIndex: GALLERY_IMAGES.length - index
                }}
              >
                <div className="photo-frame p-3 sm:p-4">
                  {/* Image Container */}
                  <div className="photo-inner relative aspect-[4/5] sm:aspect-[3/4]">
                    {/* Skeleton Loader */}
                    {!isLoaded && (
                      <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-[20px]" />
                    )}

                    <img
                      src={getImageUrl(image.seed, 800, 1000)}
                      alt={image.title}
                      className={`w-full h-full object-cover transition-opacity duration-700 ${
                        isLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      loading="lazy"
                      onLoad={() => handleImageLoad(image.id)}
                    />

                    {/* Archive Label Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
                      <p className="archive-label text-white text-sm sm:text-base mb-1">
                        {image.archiveCode}
                      </p>
                      <p className="camera-settings">
                        {image.focalLength} / {image.aperture} / {image.iso}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Property Footer */}
                <div className="flex items-center justify-between px-2 py-4 mt-2">
                  <span className="property-label text-gray-400">
                    [{image.archiveCode}]
                  </span>
                  <span className="flex-1 h-px bg-gray-300 mx-4" />
                  <span className="property-label text-gray-400">
                    PROPERTY OF ATITLAN_EXP
                  </span>
                </div>
              </div>
            </section>
          );
        })}

        {/* End Section */}
        <section className="min-h-[50vh] flex items-center justify-center px-4">
          <div className="text-center animate-fade-in-up">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="h-px w-12 bg-gray-300" />
              <span className="property-label text-gray-400">FIN DEL ARCHIVO</span>
              <span className="h-px w-12 bg-gray-300" />
            </div>

            <p className="text-gray-500 text-lg max-w-md mx-auto mb-8">
              ¿Quieres vivir estas experiencias en persona?
            </p>

            <a
              href="/catalogo"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-red-600 transition-colors"
            >
              <span>Explorar Tours</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </a>
          </div>
        </section>
      </main>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`scroll-to-top fixed bottom-6 left-6 z-50 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 ${
          showScrollTop
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Volver arriba"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/>
        </svg>
      </button>

      <GlassFooter />
    </div>
  );
};

export default GaleriaPage;
