import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { GlassFooter } from '../components/shared';
import { buildOrganizationSchema, buildWebSiteSchema } from '../seo';

// ============================================================
// Gallery data — configurable array
// ============================================================

interface GalleryItem {
  id: number;
  src: string;
  alt: string;
  title: string;
  location: string;
  price: string;
  tourLink: string;
  size: 'large' | 'medium' | 'small';
  orientation: 'landscape' | 'portrait';
}

const galleryItems: GalleryItem[] = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80',
    alt: 'Vista panorámica de un lago rodeado de montañas al amanecer',
    title: 'Sunrise Kayak Tour',
    location: 'Panajachel',
    price: 'Desde $45 USD',
    tourLink: '/tours/sunrise-kayak',
    size: 'large',
    orientation: 'landscape',
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80',
    alt: 'Calle colorida de un pueblo guatemalteco',
    title: 'Village Walking Tour',
    location: 'San Juan la Laguna',
    price: 'Desde $35 USD',
    tourLink: '/tours/village-walk',
    size: 'medium',
    orientation: 'portrait',
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=80',
    alt: 'Volcanes cubiertos de niebla al atardecer',
    title: 'Volcano Sunset Experience',
    location: 'Indian Nose',
    price: 'Desde $55 USD',
    tourLink: '/tours/volcano-sunset',
    size: 'large',
    orientation: 'landscape',
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1543039625-14cbd3802e7d?auto=format&fit=crop&w=1200&q=80',
    alt: 'Kayak navegando en aguas cristalinas',
    title: 'Lake Kayak Adventure',
    location: 'Santa Cruz la Laguna',
    price: 'Desde $40 USD',
    tourLink: '/tours/lake-kayak',
    size: 'medium',
    orientation: 'landscape',
  },
  {
    id: 5,
    src: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    alt: 'Platillos de comida local guatemalteca',
    title: 'Foodie Tour',
    location: 'Santiago Atitlán',
    price: 'Desde $60 USD',
    tourLink: '/tours/foodie-tour',
    size: 'small',
    orientation: 'landscape',
  },
  {
    id: 6,
    src: 'https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=800&q=80',
    alt: 'Textiles tradicionales mayas tejidos a mano',
    title: 'Weaving Workshop',
    location: 'San Juan la Laguna',
    price: 'Desde $30 USD',
    tourLink: '/tours/weaving-workshop',
    size: 'small',
    orientation: 'portrait',
  },
  {
    id: 7,
    src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
    alt: 'Atardecer dorado sobre el lago con silueta de volcanes',
    title: 'Sunset Cruise',
    location: 'Lago de Atitlán',
    price: 'Desde $75 USD',
    tourLink: '/tours/sunset-cruise',
    size: 'large',
    orientation: 'landscape',
  },
  {
    id: 8,
    src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    alt: 'Sendero de montaña con vista al lago',
    title: 'Highland Trek',
    location: 'Cerro de Oro',
    price: 'Desde $50 USD',
    tourLink: '/tours/highland-trek',
    size: 'medium',
    orientation: 'landscape',
  },
  {
    id: 9,
    src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80',
    alt: 'Plato gourmet con ingredientes locales',
    title: 'Farm to Table',
    location: 'San Marcos la Laguna',
    price: 'Desde $65 USD',
    tourLink: '/tours/farm-to-table',
    size: 'small',
    orientation: 'landscape',
  },
  {
    id: 10,
    src: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80',
    alt: 'Vista aérea de cascada tropical rodeada de vegetación',
    title: 'Waterfall Adventure',
    location: 'Santa Catarina Palopó',
    price: 'Desde $45 USD',
    tourLink: '/tours/waterfall-adventure',
    size: 'medium',
    orientation: 'portrait',
  },
];

// ============================================================
// Main component
// ============================================================

const GaleriaPage: React.FC = () => {
  // --- Scroll-hiding header ---
  const [headerVisible, setHeaderVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setHeaderVisible(y < lastScrollY.current || y < 80);
      setScrolled(y > 50);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f0e8]">
      <Seo
        title="Galería | Atitlán Experiences — Fotos del Lago de Atitlán"
        description="Explora nuestra galería de fotos del Lago de Atitlán, Guatemala. Paisajes, cultura, gastronomía y aventuras premium en el lago más hermoso del mundo."
        canonicalPath="/galeria"
        structuredData={[buildOrganizationSchema(), buildWebSiteSchema()]}
      />

      {/* ================================
          HEADER — Minimal, hides on scroll
          ================================ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
          headerVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div
          className={`flex items-center justify-between px-5 sm:px-8 lg:px-12 py-4 transition-colors duration-300 ${
            scrolled
              ? 'bg-[#0a0a0a]/80 backdrop-blur-xl'
              : 'bg-transparent'
          }`}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-dm-sans text-sm font-semibold tracking-wide text-[#f5f0e8]">
              ATITLÁN
            </span>
          </Link>

          {/* Reservar button */}
          <a
            href="https://wa.me/50222681264?text=Hola!%20Quiero%20reservar%20un%20tour%20en%20Atitlán"
            target="_blank"
            rel="noreferrer"
            className="bg-[#f5f0e8] text-[#0a0a0a] px-5 py-2 rounded-full font-dm-sans text-sm font-semibold hover:bg-white transition-colors duration-200"
          >
            Reservar
          </a>
        </div>
      </header>

      {/* ================================
          HERO — Fullscreen opening image
          ================================ */}
      <section className="relative h-[100svh] min-h-[600px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=2000&q=80"
          alt="Vista panorámica del Lago de Atitlán al amanecer"
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/50 via-transparent to-[#0a0a0a]" />

        {/* Title */}
        <div className="relative z-10 h-full flex flex-col justify-end px-5 sm:px-8 lg:px-16 pb-20 sm:pb-24">
          <p className="font-dm-sans text-xs sm:text-sm uppercase tracking-[0.35em] text-[#f5f0e8]/50 mb-3">
            Atitlán Experiences
          </p>
          <h1 className="font-playfair text-[2.75rem] sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight">
            Galería de
            <br />
            <span className="italic">Experiencias</span>
          </h1>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
          <span className="font-dm-sans text-[10px] uppercase tracking-[0.3em] text-[#f5f0e8]/40">
            Scroll
          </span>
          <div className="w-px h-10 bg-gradient-to-b from-[#f5f0e8]/40 to-transparent" />
        </div>
      </section>

      {/* ================================
          GALLERY GRID — Asymmetric layout
          ================================ */}
      <main className="px-3 sm:px-5 lg:px-10 xl:px-16 pt-[8vh] pb-[10vh]">

        {/* ---- Group 1: Large landscape + Medium portrait ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-5">
          <div className="lg:col-span-8">
            <GalleryCard item={galleryItems[0]} heightClass="h-[55vh] sm:h-[60vh] lg:h-[70vh]" />
          </div>
          <div className="lg:col-span-4">
            <GalleryCard item={galleryItems[1]} heightClass="h-[55vh] sm:h-[50vh] lg:h-[70vh]" />
          </div>
        </div>

        {/* ---- Group 2: Full-width large landscape ---- */}
        <div className="mt-[6vh] sm:mt-[7vh] lg:mt-[8vh]">
          <GalleryCard item={galleryItems[2]} heightClass="h-[55vh] sm:h-[60vh] lg:h-[75vh]" />
        </div>

        {/* ---- Group 3: Medium landscape + Small + Small ---- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-5 mt-[6vh] sm:mt-[7vh] lg:mt-[8vh]">
          <div className="md:col-span-2 lg:col-span-7">
            <GalleryCard item={galleryItems[3]} heightClass="h-[55vh] sm:h-[50vh] lg:h-[55vh]" />
          </div>
          <div className="lg:col-span-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 lg:gap-5 h-full">
              <GalleryCard item={galleryItems[4]} heightClass="h-[40vh] sm:h-[35vh] lg:h-auto lg:flex-1" />
              <GalleryCard item={galleryItems[5]} heightClass="h-[55vh] sm:h-[35vh] lg:h-auto lg:flex-1" />
            </div>
          </div>
        </div>

        {/* ---- Inline CTA ---- */}
        <div className="my-[8vh] sm:my-[10vh] max-w-3xl mx-auto text-center">
          <p className="font-dm-sans text-xs uppercase tracking-[0.3em] text-[#1a3a5c] mb-4">
            Experiencias Premium
          </p>
          <h2 className="font-playfair text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-4">
            Cada foto es una experiencia
            <br className="hidden sm:block" />
            <span className="italic"> que puedes vivir</span>
          </h2>
          <p className="font-dm-sans text-sm sm:text-base text-[#f5f0e8]/50 mb-8 max-w-lg mx-auto">
            Tours con lancha privada, guía bilingüe y todos los detalles cuidados para que solo te preocupes por disfrutar.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/catalogo"
              className="inline-flex items-center justify-center gap-2 bg-[#f5f0e8] text-[#0a0a0a] px-7 py-3 rounded-full font-dm-sans font-semibold text-sm hover:bg-white transition-colors duration-200"
            >
              Ver todos los tours
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <a
              href="https://wa.me/50222681264?text=Hola!%20Me%20interesa%20reservar%20un%20tour"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-[#f5f0e8]/20 text-[#f5f0e8]/70 px-7 py-3 rounded-full font-dm-sans text-sm hover:bg-[#f5f0e8]/5 hover:text-[#f5f0e8] transition-colors duration-200"
            >
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>

        {/* ---- Group 4: Large landscape (full) ---- */}
        <div>
          <GalleryCard item={galleryItems[6]} heightClass="h-[55vh] sm:h-[65vh] lg:h-[80vh]" />
        </div>

        {/* ---- Group 5: Medium landscape + Medium portrait ---- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-5 mt-[6vh] sm:mt-[7vh] lg:mt-[8vh]">
          <div className="lg:col-span-5">
            <GalleryCard item={galleryItems[9]} heightClass="h-[55vh] sm:h-[50vh] lg:h-[65vh]" />
          </div>
          <div className="lg:col-span-7">
            <GalleryCard item={galleryItems[7]} heightClass="h-[55vh] sm:h-[50vh] lg:h-[65vh]" />
          </div>
        </div>

        {/* ---- Group 6: Small + Small (closing pair) ---- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-5 mt-[6vh] sm:mt-[7vh] lg:mt-[8vh]">
          <GalleryCard item={galleryItems[8]} heightClass="h-[40vh] sm:h-[45vh] lg:h-[50vh]" />
          <GalleryCard item={galleryItems[4]} heightClass="h-[40vh] sm:h-[45vh] lg:h-[50vh]" />
        </div>
      </main>

      {/* ================================
          CLOSING CTA
          ================================ */}
      <section className="px-5 sm:px-8 lg:px-16 py-16 sm:py-24 lg:py-32 border-t border-[#f5f0e8]/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4 sm:mb-6">
            ¿Listo para tu
            <span className="italic"> aventura?</span>
          </h2>
          <p className="font-dm-sans text-base sm:text-lg text-[#f5f0e8]/50 mb-8 sm:mb-10 max-w-lg mx-auto">
            Reserva hoy y vive el Lago de Atitlán como nunca antes. Lancha privada, guía bilingüe y experiencias exclusivas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/catalogo"
              className="inline-flex items-center justify-center gap-2 bg-[#1a3a5c] text-[#f5f0e8] px-8 py-4 rounded-full font-dm-sans font-semibold text-base hover:bg-[#1a3a5c]/80 transition-colors duration-200"
            >
              Explorar Tours
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <a
              href="https://wa.me/50222681264?text=Hola!%20Quiero%20información%20sobre%20tours%20en%20Atitlán"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-[#2d4a3e] text-[#f5f0e8] px-8 py-4 rounded-full font-dm-sans font-semibold text-base hover:bg-[#2d4a3e]/20 transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Reservar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      <GlassFooter />
    </div>
  );
};

// ============================================================
// Gallery Card — Single image with overlay
// ============================================================

const GalleryCard: React.FC<{
  item: GalleryItem;
  heightClass: string;
}> = ({ item, heightClass }) => (
  <Link
    to={item.tourLink}
    className={`group relative block w-full overflow-hidden rounded-xl sm:rounded-2xl bg-[#141414] ${heightClass}`}
  >
    <img
      src={item.src}
      alt={item.alt}
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
      loading="lazy"
    />

    {/* Permanent subtle bottom gradient */}
    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/60 via-[#0a0a0a]/0 to-transparent" />

    {/* Hover overlay — darker */}
    <div className="absolute inset-0 bg-[#0a0a0a]/0 group-hover:bg-[#0a0a0a]/30 transition-colors duration-300" />

    {/* Info overlay — always visible on mobile, hover on desktop */}
    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 lg:p-6 lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 transition-all duration-300">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="font-playfair text-lg sm:text-xl lg:text-2xl font-semibold text-[#f5f0e8] mb-1 leading-tight">
            {item.title}
          </h3>
          <p className="font-dm-sans text-xs sm:text-sm text-[#f5f0e8]/60 flex items-center gap-1">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {item.location}
          </p>
        </div>
        <span className="font-dm-sans text-xs sm:text-sm font-medium text-[#f5f0e8]/80 whitespace-nowrap bg-[#0a0a0a]/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
          {item.price}
        </span>
      </div>
    </div>
  </Link>
);

export default GaleriaPage;
