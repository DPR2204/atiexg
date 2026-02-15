import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import Seo from '../components/Seo';
import GalleryViewer from '../components/GalleryViewer';
import { GlassFooter } from '../components/shared';
import { buildOrganizationSchema, buildWebSiteSchema } from '../seo';
import { getCloudinaryUrl } from '../src/utils/cloudinary';

gsap.registerPlugin(ScrollTrigger);

// ============================================================
// Gallery data — configurable array
// ============================================================

interface GalleryItem {
  id: number;
  src: string;
  alt: string;
  title: string;
  location: string;
  tourLink: string;
  color: string;
  size: 'large' | 'medium' | 'small';
  orientation: 'landscape' | 'portrait';
}

const galleryItems: GalleryItem[] = [
  {
    id: 1,
    src: 'DSC04496_noiz4x',
    alt: 'Vista panorámica del Lago de Atitlán desde el mirador de San Antonio Palopó',
    title: 'Mirador San Antonio Palopó',
    location: 'San Antonio Palopó',
    tourLink: '/experiencias/palopo-art-route',
    color: '#1a3a50',
    size: 'large',
    orientation: 'landscape',
  },
  {
    id: 2,
    src: 'DSC04042_ktnwye',
    alt: 'Calle colorida en el centro de San Juan la Laguna',
    title: 'Calles de San Juan la Laguna',
    location: 'San Juan la Laguna',
    tourLink: '/experiencias/atitlan-artisan-day',
    color: '#4a3d2e',
    size: 'medium',
    orientation: 'portrait',
  },
  {
    id: 3,
    src: 'DSC04094_vht4pi',
    alt: 'Vista del lago y volcanes en la ruta de lancha San Pedro a Santiago Atitlán',
    title: 'Ruta en Lancha por el Lago',
    location: 'Lago de Atitlán',
    tourLink: '/experiencias/atitlan-signature',
    color: '#1a2d3e',
    size: 'large',
    orientation: 'landscape',
  },
  {
    id: 4,
    src: 'DSC04374_rdep9d',
    alt: 'Playa con aguas cristalinas en Santa Catarina Palopó',
    title: 'Playa Santa Catarina Palopó',
    location: 'Santa Catarina Palopó',
    tourLink: '/experiencias/palopo-art-route',
    color: '#1a4050',
    size: 'medium',
    orientation: 'landscape',
  },
  {
    id: 5,
    src: 'DSC04185_rgqgug',
    alt: 'Platillos de comida local en el mercado de Santiago Atitlán',
    title: 'Gastronomía Local',
    location: 'Santiago Atitlán',
    tourLink: '/experiencias/san-pedro-foodies',
    color: '#5a3a20',
    size: 'small',
    orientation: 'landscape',
  },
  {
    id: 6,
    src: 'DSC04045_etlucg',
    alt: 'Güipiles tradicionales mayas tejidos a mano en San Juan la Laguna',
    title: 'Textiles Mayas',
    location: 'San Juan la Laguna',
    tourLink: '/experiencias/atitlan-artisan-day',
    color: '#3a2535',
    size: 'small',
    orientation: 'portrait',
  },
  {
    id: 7,
    src: 'DSC04361_iuucat',
    alt: 'Playa de arena junto al lago en San Lucas Tolimán con volcanes de fondo',
    title: 'Playa San Lucas Tolimán',
    location: 'San Lucas Tolimán',
    tourLink: '/experiencias/hidden-south-shore',
    color: '#2d3a2e',
    size: 'large',
    orientation: 'landscape',
  },
  {
    id: 8,
    src: 'DSC04466_mxfzds',
    alt: 'Callejones pintados de colores en San Antonio Palopó',
    title: 'Callejones de San Antonio',
    location: 'San Antonio Palopó',
    tourLink: '/experiencias/palopo-art-route',
    color: '#2a3540',
    size: 'medium',
    orientation: 'landscape',
  },
  {
    id: 9,
    src: 'DSC04238_swyart',
    alt: 'Tabla de vino y queso gourmet junto al Lago de Atitlán',
    title: 'Experiencia Gourmet',
    location: 'San Lucas Tolimán',
    tourLink: '/experiencias/coffee-lab',
    color: '#2a2218',
    size: 'small',
    orientation: 'landscape',
  },
  {
    id: 10,
    src: 'DSC04381_ro3yne',
    alt: 'Vista del lago desde el mirador público de Santa Catarina Palopó',
    title: 'Mirador Santa Catarina',
    location: 'Santa Catarina Palopó',
    tourLink: '/experiencias/palopo-art-route',
    color: '#1a3525',
    size: 'medium',
    orientation: 'portrait',
  },
];

// ============================================================
// Reduced-motion helper
// ============================================================

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// ============================================================
// Shader reveal capability check
// ============================================================

function supportsShaderReveal(): boolean {
  if (prefersReducedMotion()) return false;

  // Requires CSS @property for animating custom properties in gradients
  if (typeof CSS === 'undefined' || !('registerProperty' in CSS)) return false;

  // Check CSS mask-image support
  if (
    !CSS.supports('mask-image', 'linear-gradient(black,transparent)') &&
    !CSS.supports('-webkit-mask-image', 'linear-gradient(black,transparent)')
  ) {
    return false;
  }

  // Skip on low-end devices (≤2 cores or ≤2 GB RAM)
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as any).deviceMemory || 4;
  return cores > 2 && memory > 2;
}

// ============================================================
// Responsive image helper — Cloudinary srcSet
// ============================================================

function buildCloudinarySrcSet(
  publicId: string,
  widths = [800, 1200, 1800],
): { srcSet: string; sizes: string } {
  const srcSet = widths
    .map((w) => {
      const url = getCloudinaryUrl(publicId, { width: w });
      return `${url} ${w}w`;
    })
    .join(', ');

  return {
    srcSet,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  };
}

// ============================================================
// Main component
// ============================================================

const GaleriaPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const heroTitleRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const floatingCtaRef = useRef<HTMLDivElement>(null);

  // ---------- Fullscreen viewer state ----------
  const [viewerState, setViewerState] = useState<{
    index: number;
    sourceEl: HTMLElement;
  } | null>(null);

  const handleOpenViewer = useCallback(
    (itemIndex: number, sourceEl: HTMLElement) => {
      setViewerState({ index: itemIndex, sourceEl });
    },
    [],
  );

  const handleCloseViewer = useCallback(() => {
    setViewerState(null);
  }, []);

  // ---------- Lenis smooth scroll ----------
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.5,
    });

    // Sync Lenis → GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(lenis.raf as any);
      lenis.destroy();
    };
  }, []);

  // ---------- Header hide/show via ScrollTrigger ----------
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    // Show header initially
    gsap.set(header, { yPercent: 0 });

    const showAnim = gsap.from(header, {
      yPercent: -100,
      paused: true,
      duration: 0.3,
      ease: 'power2.out',
    }).progress(1);

    const trigger = ScrollTrigger.create({
      start: 'top top',
      end: 'max',
      onUpdate: (self) => {
        if (self.direction === -1) {
          showAnim.play();
        } else if (self.scroll() > 80) {
          showAnim.reverse();
        }
        // Add backdrop when past hero
        if (self.scroll() > 50) {
          header.classList.add('header-scrolled');
        } else {
          header.classList.remove('header-scrolled');
        }
      },
    });

    return () => {
      trigger.kill();
      showAnim.kill();
    };
  }, []);

  // ---------- Floating CTA — appear after 1 viewport ----------
  useEffect(() => {
    const cta = floatingCtaRef.current;
    if (!cta) return;

    gsap.set(cta, { y: 20, opacity: 0, pointerEvents: 'none' });

    const trigger = ScrollTrigger.create({
      start: `${window.innerHeight}px top`,
      onEnter: () =>
        gsap.to(cta, { y: 0, opacity: 1, pointerEvents: 'auto', duration: 0.5, ease: 'power2.out' }),
      onLeaveBack: () =>
        gsap.to(cta, { y: 20, opacity: 0, pointerEvents: 'none', duration: 0.35, ease: 'power2.in' }),
    });

    return () => trigger.kill();
  }, []);

  // ---------- Hero entrance animation ----------
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Image zoom-out: scale 1.15 → 1
      if (heroImgRef.current) {
        gsap.set(heroImgRef.current, { scale: 1.15 });
        tl.to(heroImgRef.current, { scale: 1, duration: 1.8, ease: 'power2.out' }, 0);
      }

      // Title container fade + rise
      if (heroTitleRef.current) {
        const subtitle = heroTitleRef.current.querySelector('.hero-subtitle');
        const titleLines = heroTitleRef.current.querySelectorAll('.hero-title-line');
        const indicator = scrollIndicatorRef.current;

        gsap.set([subtitle, ...titleLines], { opacity: 0, y: 30 });
        if (indicator) gsap.set(indicator, { opacity: 0 });

        tl.to(subtitle, { opacity: 1, y: 0, duration: 0.8 }, 0.3);
        tl.to(titleLines, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 }, 0.5);
        if (indicator) {
          tl.to(indicator, { opacity: 1, duration: 0.6 }, 1.2);
        }
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // ---------- Gallery scroll reveals + parallax ----------
  const setupGalleryAnimations = useCallback(() => {
    if (prefersReducedMotion()) return;

    const shaderCapable = supportsShaderReveal();

    const ctx = gsap.context(() => {
      // --- Reveal animation for each gallery group ---
      const groups = document.querySelectorAll<HTMLElement>('[data-gallery-group]');
      groups.forEach((group) => {
        const cards = group.querySelectorAll<HTMLElement>('[data-gallery-card]');
        if (!cards.length) return;

        const labels = group.querySelectorAll<HTMLElement>('[data-card-label]');

        // Start invisible
        if (shaderCapable) {
          // Shader path: hidden by mask (opacity stays 0 as safety net until onEnter)
          cards.forEach((c) => {
            c.setAttribute('data-shader-reveal', '');
            c.style.setProperty('--reveal', '0');
          });
          gsap.set(cards, { opacity: 0, y: 15 });
        } else {
          gsap.set(cards, { opacity: 0, y: 40 });
        }
        if (labels.length) gsap.set(labels, { opacity: 0, y: 10 });

        ScrollTrigger.create({
          trigger: group,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            if (shaderCapable) {
              // Shader reveal: gradient mask wipe + subtle lift
              gsap.set(cards, { opacity: 1 }); // Opaque, but hidden by mask
              gsap.to(cards, {
                '--reveal': 1,
                y: 0,
                duration: 1.2,
                stagger: 0.15,
                ease: 'power2.out',
              });
            } else {
              // Fallback: simple fade + rise
              gsap.to(cards, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out',
              });
            }

            // Labels reveal with 0.2s delay after each card
            if (labels.length) {
              gsap.to(labels, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: shaderCapable ? 0.15 : 0.1,
                delay: 0.2,
                ease: 'power2.out',
              });
            }
          },
        });
      });

      // --- Reveal for CTA sections ---
      const ctas = document.querySelectorAll<HTMLElement>('[data-gallery-cta]');
      ctas.forEach((cta) => {
        gsap.set(cta, { opacity: 0, y: 30 });
        ScrollTrigger.create({
          trigger: cta,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            gsap.to(cta, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
          },
        });
      });

      // --- Parallax on gallery images ---
      const parallaxImages = document.querySelectorAll<HTMLElement>('[data-parallax]');
      parallaxImages.forEach((img) => {
        const speed = parseFloat(img.dataset.parallax || '0.15');
        gsap.to(img, {
          yPercent: speed * 100,
          ease: 'none',
          scrollTrigger: {
            trigger: img.closest('[data-gallery-card]') || img,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const cleanup = setupGalleryAnimations();
    return cleanup;
  }, [setupGalleryAnimations]);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-[#f5f0e8]">
      <Seo
        title="Galería | Atitlán Experiences — Fotos del Lago de Atitlán"
        description="Explora nuestra galería de fotos del Lago de Atitlán, Guatemala. Paisajes, cultura, gastronomía y aventuras premium en el lago más hermoso del mundo."
        canonicalPath="/galeria"
        structuredData={[buildOrganizationSchema(), buildWebSiteSchema()]}
      />

      {/* ================================
          HEADER — Minimal, GSAP hide/show
          ================================ */}
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 will-change-transform"
      >
        {/* Inline styles — header + shader reveal */}
        <style>{`
          .header-scrolled .header-inner {
            background: rgba(10, 10, 10, 0.8);
            -webkit-backdrop-filter: blur(24px);
            backdrop-filter: blur(24px);
          }
          @property --reveal {
            syntax: '<number>';
            initial-value: 0;
            inherits: false;
          }
          [data-shader-reveal] {
            --reveal: 0;
            -webkit-mask-image: linear-gradient(
              to top,
              rgba(0,0,0,1) calc(var(--reveal) * 140% - 40%),
              rgba(0,0,0,0) calc(var(--reveal) * 140%)
            );
            mask-image: linear-gradient(
              to top,
              rgba(0,0,0,1) calc(var(--reveal) * 140% - 40%),
              rgba(0,0,0,0) calc(var(--reveal) * 140%)
            );
          }
        `}</style>
        <div className="header-inner flex items-center justify-between px-5 sm:px-8 lg:px-12 py-4 transition-[background,backdrop-filter] duration-300">
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
            aria-label="Reservar tour por WhatsApp"
          >
            Reservar
          </a>
        </div>
      </header>

      {/* ================================
          HERO — Fullscreen with entrance anim
          ================================ */}
      <section ref={heroRef} className="relative h-[100svh] min-h-[600px] overflow-hidden">
        <img
          ref={heroImgRef}
          src={getCloudinaryUrl('DSC04387_zcq91s', { width: 2000 })}
          srcSet={buildCloudinarySrcSet('DSC04387_zcq91s', [800, 1200, 2000]).srcSet}
          sizes="100vw"
          alt="Vista panorámica del Lago de Atitlán desde el mirador de Santa Catarina Palopó"
          className="absolute inset-0 w-full h-full object-cover will-change-transform"
          loading="eager"
          fetchPriority="high"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/50 via-transparent to-[#0a0a0a]" />

        {/* Title */}
        <div ref={heroTitleRef} className="relative z-10 h-full flex flex-col justify-end px-5 sm:px-8 lg:px-16 pb-20 sm:pb-24">
          <p className="hero-subtitle font-dm-sans text-xs sm:text-sm uppercase tracking-[0.35em] text-[#f5f0e8]/50 mb-3">
            Atitlán Experiences
          </p>
          <h1 className="font-playfair text-[2.75rem] sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight">
            <span className="hero-title-line inline-block">Galería de</span>
            <br />
            <span className="hero-title-line inline-block italic">Experiencias</span>
          </h1>
        </div>

        {/* Scroll indicator */}
        <div ref={scrollIndicatorRef} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
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

        {/* ---- Experience counter ---- */}
        <div className="flex justify-end mb-4 sm:mb-6 lg:mb-8 px-1">
          <span className="font-dm-sans text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#f5f0e8]/25">
            {galleryItems.length} experiencias
          </span>
        </div>

        {/* ---- Group 1: Large landscape + Medium portrait ---- */}
        <div data-gallery-group="1" className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-5">
          <div className="lg:col-span-8" data-gallery-card>
            <GalleryCard item={galleryItems[0]} itemIndex={0} heightClass="h-[55vh] sm:h-[60vh] lg:h-[70vh]" parallaxSpeed={0.1} onOpen={handleOpenViewer} />
          </div>
          <div className="lg:col-span-4" data-gallery-card>
            <GalleryCard item={galleryItems[1]} itemIndex={1} heightClass="h-[55vh] sm:h-[50vh] lg:h-[70vh]" parallaxSpeed={0.18} onOpen={handleOpenViewer} />
          </div>
        </div>

        {/* ---- Group 2: Full-width large landscape ---- */}
        <div data-gallery-group="2" className="mt-[6vh] sm:mt-[7vh] lg:mt-[8vh]">
          <div data-gallery-card>
            <GalleryCard item={galleryItems[2]} itemIndex={2} heightClass="h-[55vh] sm:h-[60vh] lg:h-[75vh]" parallaxSpeed={0.12} onOpen={handleOpenViewer} />
          </div>
        </div>

        {/* ---- Group 3: Medium landscape + Small + Small ---- */}
        <div data-gallery-group="3" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-5 mt-[6vh] sm:mt-[7vh] lg:mt-[8vh]">
          <div className="md:col-span-2 lg:col-span-7" data-gallery-card>
            <GalleryCard item={galleryItems[3]} itemIndex={3} heightClass="h-[55vh] sm:h-[50vh] lg:h-[55vh]" parallaxSpeed={0.15} onOpen={handleOpenViewer} />
          </div>
          <div className="lg:col-span-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 lg:gap-5 h-full">
              <div data-gallery-card>
                <GalleryCard item={galleryItems[4]} itemIndex={4} heightClass="h-[40vh] sm:h-[35vh] lg:h-auto lg:min-h-[25vh]" parallaxSpeed={0.08} onOpen={handleOpenViewer} />
              </div>
              <div data-gallery-card>
                <GalleryCard item={galleryItems[5]} itemIndex={5} heightClass="h-[55vh] sm:h-[35vh] lg:h-auto lg:min-h-[25vh]" parallaxSpeed={0.2} onOpen={handleOpenViewer} />
              </div>
            </div>
          </div>
        </div>

        {/* ---- Inline CTA ---- */}
        <div data-gallery-cta className="my-[8vh] sm:my-[10vh] max-w-3xl mx-auto text-center">
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
              aria-label="Consultar disponibilidad por WhatsApp"
            >
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>

        {/* ---- Group 4: Large landscape (full) ---- */}
        <div data-gallery-group="4">
          <div data-gallery-card>
            <GalleryCard item={galleryItems[6]} itemIndex={6} heightClass="h-[55vh] sm:h-[65vh] lg:h-[80vh]" parallaxSpeed={0.1} onOpen={handleOpenViewer} />
          </div>
        </div>

        {/* ---- Group 5: Medium portrait + Medium landscape ---- */}
        <div data-gallery-group="5" className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-5 mt-[6vh] sm:mt-[7vh] lg:mt-[8vh]">
          <div className="lg:col-span-5" data-gallery-card>
            <GalleryCard item={galleryItems[9]} itemIndex={9} heightClass="h-[55vh] sm:h-[50vh] lg:h-[65vh]" parallaxSpeed={0.2} onOpen={handleOpenViewer} />
          </div>
          <div className="lg:col-span-7" data-gallery-card>
            <GalleryCard item={galleryItems[7]} itemIndex={7} heightClass="h-[55vh] sm:h-[50vh] lg:h-[65vh]" parallaxSpeed={0.12} onOpen={handleOpenViewer} />
          </div>
        </div>

        {/* ---- Group 6: Small + Small (closing pair) ---- */}
        <div data-gallery-group="6" className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-5 mt-[6vh] sm:mt-[7vh] lg:mt-[8vh]">
          <div data-gallery-card>
            <GalleryCard item={galleryItems[8]} itemIndex={8} heightClass="h-[40vh] sm:h-[45vh] lg:h-[50vh]" parallaxSpeed={0.15} onOpen={handleOpenViewer} />
          </div>
          <div data-gallery-card>
            <GalleryCard item={galleryItems[4]} itemIndex={4} heightClass="h-[40vh] sm:h-[45vh] lg:h-[50vh]" parallaxSpeed={0.08} onOpen={handleOpenViewer} />
          </div>
        </div>
      </main>

      {/* ================================
          CLOSING CTA — gradient transition
          ================================ */}
      <section data-gallery-cta className="relative px-5 sm:px-8 lg:px-16 py-20 sm:py-28 lg:py-36 overflow-hidden">
        {/* Gradient background: dark → subtle blue-charcoal */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0c1018] to-[#101720]" />

        {/* Decorative gradient orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full bg-[#1a3a5c]/[0.07] blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="font-dm-sans text-[10px] sm:text-xs uppercase tracking-[0.35em] text-[#f5f0e8]/25 mb-5 sm:mb-6">
            Tu próxima aventura
          </p>
          <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-3 sm:mb-4">
            ¿Listo para vivir
            <br />
            <span className="italic">la experiencia?</span>
          </h2>
          <p className="font-dm-sans text-base sm:text-lg lg:text-xl text-[#f5f0e8]/35 mb-10 sm:mb-12 max-w-xl mx-auto">
            El Lago de Atitlán te espera
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/catalogo"
              className="inline-flex items-center justify-center gap-2.5 bg-[#f5f0e8] text-[#0a0a0a] min-h-[52px] px-9 py-3.5 rounded-full font-dm-sans font-semibold text-base hover:bg-white transition-colors duration-200"
            >
              Ver todos los tours
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <a
              href="https://wa.me/50222681264?text=Hola!%20Quiero%20información%20sobre%20tours%20en%20Atitlán"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2.5 border border-[#f5f0e8]/15 text-[#f5f0e8]/80 min-h-[52px] px-9 py-3.5 rounded-full font-dm-sans font-medium text-base hover:bg-[#f5f0e8]/5 hover:text-[#f5f0e8] transition-colors duration-200"
              aria-label="Hablar con nosotros por WhatsApp"
            >
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Hablar con nosotros
            </a>
          </div>
        </div>
      </section>

      <GlassFooter />

      {/* ================================
          FLOATING CTA — glass-morphism
          ================================ */}
      <div
        ref={floatingCtaRef}
        className="fixed z-40 bottom-5 left-1/2 -translate-x-1/2 sm:bottom-8 sm:right-8 sm:left-auto sm:translate-x-0"
      >
        <a
          href="https://wa.me/50222681264?text=Hola!%20Quiero%20reservar%20una%20experiencia%20en%20Atitlán"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2.5 bg-[#f5f0e8]/[0.08] backdrop-blur-2xl border border-[#f5f0e8]/[0.12] text-[#f5f0e8] px-6 py-3.5 sm:px-7 sm:py-3.5 rounded-full font-dm-sans text-sm font-medium shadow-lg shadow-black/25 hover:bg-[#f5f0e8]/[0.14] hover:border-[#f5f0e8]/20 transition-all duration-200"
          aria-label="Reservar experiencia en Lago de Atitlán"
        >
          <svg className="w-4 h-4 text-[#f5f0e8]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Reservar experiencia
        </a>
      </div>

      {/* ================================
          FULLSCREEN VIEWER
          ================================ */}
      {viewerState && (
        <GalleryViewer
          items={galleryItems}
          initialIndex={viewerState.index}
          sourceEl={viewerState.sourceEl}
          onClose={handleCloseViewer}
        />
      )}
    </div>
  );
};

// ============================================================
// Gallery Card — Clickable image with overlay + parallax
// ============================================================

const GalleryCard: React.FC<{
  item: GalleryItem;
  itemIndex: number;
  heightClass: string;
  parallaxSpeed?: number;
  onOpen: (index: number, sourceEl: HTMLElement) => void;
}> = ({ item, itemIndex, heightClass, parallaxSpeed = 0.15, onOpen }) => {
  const [loaded, setLoaded] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onOpen(itemIndex, e.currentTarget);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(itemIndex, e.currentTarget);
    }
  };

  const { srcSet, sizes } = buildCloudinarySrcSet(item.src);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`Ver ${item.title} en pantalla completa`}
      className={`group relative block w-full overflow-hidden rounded-xl sm:rounded-2xl bg-[#141414] cursor-pointer select-none ${heightClass}`}
    >
      {/* Blur placeholder — dominant color */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${loaded ? 'opacity-0' : 'opacity-100'}`}
        style={{ backgroundColor: item.color }}
        aria-hidden="true"
      />

      {/* Image with parallax data attribute — extra height for parallax room */}
      <img
        src={getCloudinaryUrl(item.src, { width: 1600 })}
        srcSet={srcSet}
        sizes={sizes}
        alt={item.alt}
        data-parallax={parallaxSpeed}
        className={`absolute inset-[-15%] w-[130%] h-[130%] object-cover will-change-transform transition-[transform,opacity] duration-500 ease-out group-hover:scale-[1.03] ${loaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        draggable={false}
      />

      {/* Permanent subtle bottom gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/60 via-[#0a0a0a]/0 to-transparent" />

      {/* Hover overlay — darker */}
      <div className="absolute inset-0 bg-[#0a0a0a]/0 group-hover:bg-[#0a0a0a]/20 transition-colors duration-300" />

      {/* Persistent label — DM Sans 500, scroll-animated with delay */}
      <div
        data-card-label
        className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 lg:p-6"
      >
        <p className="font-dm-sans text-[13px] sm:text-sm font-medium text-[#f5f0e8]/90 leading-snug">
          {item.title}
          <span className="text-[#f5f0e8]/25 mx-1.5">·</span>
          <span className="text-[#f5f0e8]/50">{item.location}</span>
        </p>
      </div>
    </div>
  );
};

export default GaleriaPage;
