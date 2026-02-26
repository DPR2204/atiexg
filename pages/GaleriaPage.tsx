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
import { useLanguage, type Language } from '../contexts/LanguageContext';
import { L } from '../lib/localize';
import cloudinaryAssets from '../src/data/cloudinary-assets.json';

gsap.registerPlugin(ScrollTrigger);

// ============================================================
// Gallery data — configurable array
// ============================================================

interface GalleryItem {
  id: number;
  src: string;
  alt: string;
  alt_en?: string;
  title: string;
  title_en?: string;
  location: string;
  location_en?: string;
  tourLink: string;
  color: string;
  size: 'large' | 'medium' | 'small';
  orientation: 'landscape' | 'portrait';
  resourceType?: 'image' | 'video';
}

const galleryItems: GalleryItem[] = [
  {
    id: 1,
    src: 'DSC04496_noiz4x',
    alt: 'Vista panorámica del Lago de Atitlán desde el mirador de San Antonio Palopó',
    alt_en: 'Panoramic view of Lake Atitlán from San Antonio Palopó viewpoint',
    title: 'Mirador San Antonio Palopó',
    title_en: 'San Antonio Palopó Viewpoint',
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
    alt_en: 'Colorful street in downtown San Juan la Laguna',
    title: 'Calles de San Juan la Laguna',
    title_en: 'Streets of San Juan la Laguna',
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
    alt_en: 'Lake and volcano views on the boat route from San Pedro to Santiago Atitlán',
    title: 'Ruta en Lancha por el Lago',
    title_en: 'Boat Route Across the Lake',
    location: 'Lago de Atitlán',
    location_en: 'Lake Atitlán',
    tourLink: '/experiencias/atitlan-signature',
    color: '#1a2d3e',
    size: 'large',
    orientation: 'landscape',
  },
  {
    id: 4,
    src: 'DSC04374_rdep9d',
    alt: 'Playa con aguas cristalinas en Santa Catarina Palopó',
    alt_en: 'Beach with crystal-clear waters in Santa Catarina Palopó',
    title: 'Playa Santa Catarina Palopó',
    title_en: 'Santa Catarina Palopó Beach',
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
    alt_en: 'Local food dishes at Santiago Atitlán market',
    title: 'Gastronomía Local',
    title_en: 'Local Gastronomy',
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
    alt_en: 'Traditional hand-woven Mayan huipiles in San Juan la Laguna',
    title: 'Textiles Mayas',
    title_en: 'Mayan Textiles',
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
    alt_en: 'Sandy beach by the lake in San Lucas Tolimán with volcanoes in the background',
    title: 'Playa San Lucas Tolimán',
    title_en: 'San Lucas Tolimán Beach',
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
    alt_en: 'Colorfully painted alleyways in San Antonio Palopó',
    title: 'Callejones de San Antonio',
    title_en: 'San Antonio Alleyways',
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
    alt_en: 'Gourmet wine and cheese board by Lake Atitlán',
    title: 'Experiencia Gourmet',
    title_en: 'Gourmet Experience',
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
    alt_en: 'Lake view from the public viewpoint in Santa Catarina Palopó',
    title: 'Mirador Santa Catarina',
    title_en: 'Santa Catarina Viewpoint',
    location: 'Santa Catarina Palopó',
    tourLink: '/experiencias/palopo-art-route',
    color: '#1a3525',
    size: 'medium',
    orientation: 'portrait',
  },
];

// ============================================================
// Build full gallery from Cloudinary assets
// ============================================================

function extractLocation(displayName: string): string {
  const patterns: [RegExp, string][] = [
    [/San Antonio Palopó/i, 'San Antonio Palopó'],
    [/Santa Catarina Palopó/i, 'Santa Catarina Palopó'],
    [/Santa Catarina/i, 'Santa Catarina Palopó'],
    [/San Juan la Laguna/i, 'San Juan la Laguna'],
    [/San Juan/i, 'San Juan la Laguna'],
    [/San Pedro la Laguna/i, 'San Pedro la Laguna'],
    [/San Pedro/i, 'San Pedro la Laguna'],
    [/Santiago Atitlán/i, 'Santiago Atitlán'],
    [/Santiago/i, 'Santiago Atitlán'],
    [/San Lucas Tolimán/i, 'San Lucas Tolimán'],
    [/San Lucas/i, 'San Lucas Tolimán'],
    [/San Marcos la Laguna/i, 'San Marcos la Laguna'],
    [/San Marcos/i, 'San Marcos la Laguna'],
    [/Panajachel/i, 'Panajachel'],
    [/San Antonio/i, 'San Antonio Palopó'],
  ];
  for (const [re, loc] of patterns) {
    if (re.test(displayName)) return loc;
  }
  return 'Lago de Atitlán';
}

const TOUR_LINKS: Record<string, string> = {
  'San Antonio Palopó': '/experiencias/palopo-art-route',
  'Santa Catarina Palopó': '/experiencias/palopo-art-route',
  'San Juan la Laguna': '/experiencias/atitlan-artisan-day',
  'Santiago Atitlán': '/experiencias/atitlan-signature',
  'San Lucas Tolimán': '/experiencias/hidden-south-shore',
  'San Pedro la Laguna': '/experiencias/san-pedro-foodies',
  'San Marcos la Laguna': '/experiencias/atitlan-signature',
  'Panajachel': '/experiencias/atitlan-signature',
};

const COLORS = ['#1a3a50', '#4a3d2e', '#1a2d3e', '#1a4050', '#5a3a20', '#3a2535', '#2d3a2e', '#2a3540', '#2a2218', '#1a3525'];

const curatedIds = new Set(galleryItems.map((item) => item.src));

// Repeating size pattern for visual variety in the gallery
const SIZE_PATTERN: Array<'large' | 'medium' | 'small'> = [
  'large', 'small', 'medium', 'small',
  'medium', 'large', 'small', 'medium',
  'large', 'medium', 'small', 'large',
  'small', 'medium', 'medium', 'small',
];

const remainingItems: GalleryItem[] = cloudinaryAssets
  .filter((asset) => !curatedIds.has(asset.public_id))
  .map((asset, index) => {
    const location = extractLocation(asset.display_name);
    const isVideo = (asset as any).resource_type === 'video' || ['mp4', 'mov', 'webm', 'avi', 'mkv'].includes((asset as any).format);
    return {
      id: galleryItems.length + index + 1,
      src: isVideo && !(asset.public_id).includes('.') ? `${asset.public_id}.${(asset as any).format}` : asset.public_id,
      alt: asset.display_name,
      title: asset.display_name,
      location,
      tourLink: TOUR_LINKS[location] || '/catalogo',
      color: COLORS[index % COLORS.length],
      size: SIZE_PATTERN[index % SIZE_PATTERN.length],
      orientation: asset.width > asset.height ? 'landscape' : 'portrait',
      resourceType: isVideo ? 'video' : 'image',
    };
  });

const allGalleryItems: GalleryItem[] = [...galleryItems, ...remainingItems];

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

  // Stricter thresholds on mobile devices
  const ua = navigator.userAgent;
  const isMobileUA = /iPhone|iPad|Android/i.test(ua);
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as any).deviceMemory || 4;

  if (isMobileUA) {
    // Disable shader reveal on mobile — the simpler opacity+y animation is
    // more reliable across browsers and avoids mask-image / @property issues
    return false;
  }

  // Desktop: keep existing thresholds (>2 cores, >2GB)
  return cores > 2 && memory > 2;
}

// ============================================================
// Responsive image helper — Cloudinary srcSet
// ============================================================

function buildCloudinarySrcSet(
  publicId: string,
  widths = [480, 800, 1200, 1800],
): { srcSet: string; sizes: string } {
  const srcSet = widths
    .map((w) => {
      const url = getCloudinaryUrl(publicId, { width: w });
      return `${url} ${w}w`;
    })
    .join(', ');

  return {
    srcSet,
    sizes: '(max-width: 480px) 95vw, (max-width: 768px) 50vw, (max-width: 1024px) 50vw, 33vw',
  };
}

// ============================================================
// Main component
// ============================================================

const GaleriaPage: React.FC = () => {
  const { t, language } = useLanguage();
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

  // ---------- Lenis smooth scroll (desktop only) ----------
  useEffect(() => {
    if (prefersReducedMotion()) return;

    // Skip Lenis on touch devices — native scroll is more reliable
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
      // Prevent ScrollTrigger recalculations on mobile address bar show/hide
      ScrollTrigger.config({ ignoreMobileResize: true });

      // Ensure ScrollTrigger works with native scroll — refresh positions
      // once layout is stable and again after images likely loaded
      const raf1 = requestAnimationFrame(() => ScrollTrigger.refresh());
      const timer = setTimeout(() => ScrollTrigger.refresh(), 1500);

      return () => {
        cancelAnimationFrame(raf1);
        clearTimeout(timer);
      };
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    // Sync Lenis → GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    const rafCallback = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(rafCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(rafCallback);
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
    if (prefersReducedMotion()) {
      // Even with reduced motion, ensure all cards are visible
      const allCards = document.querySelectorAll<HTMLElement>('[data-gallery-card]');
      allCards.forEach((c) => {
        c.style.opacity = '1';
        c.style.transform = 'none';
      });
      return;
    }

    const shaderCapable = supportsShaderReveal();

    // Track which groups have been revealed so we never hide them again
    const revealedGroups = new Set<string>();

    const ctx = gsap.context(() => {
      // Mobile detection for reduced animation complexity
      const isMobile = window.innerWidth < 768;

      // --- Reveal animation for each gallery group ---
      const groups = document.querySelectorAll<HTMLElement>('[data-gallery-group]');
      groups.forEach((group) => {
        const cards = group.querySelectorAll<HTMLElement>('[data-gallery-card]');
        if (!cards.length) return;

        const groupId = group.dataset.galleryGroup || '';
        const labels = group.querySelectorAll<HTMLElement>('[data-card-label]');

        // Start invisible
        if (shaderCapable) {
          cards.forEach((c) => {
            c.setAttribute('data-shader-reveal', '');
            c.style.setProperty('--reveal', '0');
          });
          gsap.set(cards, { opacity: 0, y: 15, force3D: true });
        } else {
          gsap.set(cards, { opacity: 0, y: 40, force3D: true });
        }
        if (labels.length) gsap.set(labels, { opacity: 0, y: 10, force3D: true });

        const revealGroup = () => {
          if (revealedGroups.has(groupId)) return;
          revealedGroups.add(groupId);

          if (shaderCapable) {
            gsap.set(cards, { opacity: 1, force3D: true });
            gsap.to(cards, {
              '--reveal': 1,
              y: 0,
              duration: isMobile ? 0.6 : 1.2,
              stagger: isMobile ? 0.08 : 0.15,
              ease: 'power2.out',
              force3D: true,
            });
          } else {
            gsap.to(cards, {
              opacity: 1,
              y: 0,
              duration: isMobile ? 0.6 : 0.8,
              stagger: isMobile ? 0.08 : 0.1,
              ease: 'power3.out',
              force3D: true,
            });
          }

          if (labels.length) {
            gsap.to(labels, {
              opacity: 1,
              y: 0,
              duration: isMobile ? 0.4 : 0.6,
              stagger: isMobile ? 0.08 : (shaderCapable ? 0.15 : 0.1),
              delay: 0.2,
              ease: 'power2.out',
              force3D: true,
            });
          }
        };

        ScrollTrigger.create({
          trigger: group,
          start: 'top 85%',
          once: true,
          fastScrollEnd: true,
          onEnter: revealGroup,
          // Also reveal if already scrolled past on page load / fast scroll
          onRefresh: (self) => {
            if (self.progress > 0) revealGroup();
          },
        });
      });

      // --- Reveal for CTA sections ---
      const ctas = document.querySelectorAll<HTMLElement>('[data-gallery-cta]');
      ctas.forEach((cta) => {
        gsap.set(cta, { opacity: 0, y: 30, force3D: true });
        ScrollTrigger.create({
          trigger: cta,
          start: 'top 85%',
          once: true,
          fastScrollEnd: true,
          onEnter: () => {
            gsap.to(cta, { opacity: 1, y: 0, duration: isMobile ? 0.5 : 0.8, ease: 'power3.out', force3D: true });
          },
          onRefresh: (self) => {
            if (self.progress > 0) {
              gsap.set(cta, { opacity: 1, y: 0, force3D: true });
            }
          },
        });
      });

      // --- Parallax on gallery images (only on non-touch / desktop) ---
      // Completely skip parallax on touch devices to avoid expensive ScrollTrigger scrub
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      if (!isTouchDevice) {
        const parallaxImages = document.querySelectorAll<HTMLElement>('[data-parallax]');
        parallaxImages.forEach((img) => {
          const speed = parseFloat(img.dataset.parallax || '0.15');
          gsap.to(img, {
            yPercent: speed * 100,
            ease: 'none',
            force3D: true,
            scrollTrigger: {
              trigger: img.closest('[data-gallery-card]') || img,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          });
        });
      }

      // Refresh trigger positions after all triggers are registered
      // Critical on mobile where native scroll is used without Lenis
      ScrollTrigger.refresh();
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const cleanup = setupGalleryAnimations();
    return cleanup;
  }, [setupGalleryAnimations]);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0a0a0a] text-[#f5f0e8] overflow-x-hidden">
      <Seo
        title={t('seo.gallery.title')}
        description={t('seo.gallery.description')}
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
            aria-label={language === 'en' ? 'Book a tour via WhatsApp' : 'Reservar tour por WhatsApp'}
          >
            {t('tour.reserve')}
          </a>
        </div>
      </header>

      {/* ================================
          HERO — Fullscreen with entrance anim
          ================================ */}
      <section ref={heroRef} className="relative h-[100svh] min-h-[600px] overflow-hidden">
        <img
          ref={heroImgRef}
          src={getCloudinaryUrl('DSC04387_zcq91s', { width: 1400 })}
          srcSet={buildCloudinarySrcSet('DSC04387_zcq91s', [600, 1000, 1400]).srcSet}
          sizes="100vw"
          alt={language === 'en' ? 'Panoramic view of Lake Atitlán from Santa Catarina Palopó viewpoint' : 'Vista panorámica del Lago de Atitlán desde el mirador de Santa Catarina Palopó'}
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
          <h1 className="font-playfair text-[2.75rem] sm:text-6xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.95] tracking-tight">
            <span className="hero-title-line inline-block">{t('gallery.title')}</span>
            <br />
            <span className="hero-title-line inline-block italic">{t('gallery.titleAccent')}</span>
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
            {allGalleryItems.length} {language === 'en' ? 'photos' : 'fotos'}
          </span>
        </div>

        {/* ---- Group 1: Large landscape + Medium portrait ---- */}
        <div data-gallery-group="1" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-5">
          <div className="md:col-span-1 lg:col-span-8" data-gallery-card>
            <GalleryCard item={galleryItems[0]} itemIndex={0} heightClass="h-[42vh] sm:h-[55vh] lg:h-[70vh]" parallaxSpeed={0.1} onOpen={handleOpenViewer} lang={language} />
          </div>
          <div className="md:col-span-1 lg:col-span-4" data-gallery-card>
            <GalleryCard item={galleryItems[1]} itemIndex={1} heightClass="h-[42vh] sm:h-[50vh] lg:h-[70vh]" parallaxSpeed={0.18} onOpen={handleOpenViewer} lang={language} />
          </div>
        </div>

        {/* ---- Group 2: Full-width large landscape ---- */}
        <div data-gallery-group="2" className="mt-[6vh] sm:mt-[7vh] lg:mt-[8vh]">
          <div data-gallery-card>
            <GalleryCard item={galleryItems[2]} itemIndex={2} heightClass="h-[42vh] sm:h-[55vh] lg:h-[75vh]" parallaxSpeed={0.12} onOpen={handleOpenViewer} lang={language} />
          </div>
        </div>

        {/* ---- Group 3: Medium landscape + Small + Small ---- */}
        <div data-gallery-group="3" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-5 mt-[6vh] sm:mt-[7vh] lg:mt-[8vh]">
          <div className="md:col-span-2 lg:col-span-7" data-gallery-card>
            <GalleryCard item={galleryItems[3]} itemIndex={3} heightClass="h-[42vh] sm:h-[50vh] lg:h-[55vh]" parallaxSpeed={0.15} onOpen={handleOpenViewer} lang={language} />
          </div>
          <div className="lg:col-span-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 lg:gap-5 h-full">
              <div data-gallery-card>
                <GalleryCard item={galleryItems[4]} itemIndex={4} heightClass="h-[35vh] sm:h-[35vh] lg:h-auto lg:min-h-[25vh]" parallaxSpeed={0.08} onOpen={handleOpenViewer} lang={language} />
              </div>
              <div data-gallery-card>
                <GalleryCard item={galleryItems[5]} itemIndex={5} heightClass="h-[42vh] sm:h-[35vh] lg:h-auto lg:min-h-[25vh]" parallaxSpeed={0.2} onOpen={handleOpenViewer} lang={language} />
              </div>
            </div>
          </div>
        </div>

        {/* ---- Inline CTA ---- */}
        <div data-gallery-cta className="my-[8vh] sm:my-[10vh] max-w-3xl mx-auto text-center">
          <p className="font-dm-sans text-xs uppercase tracking-[0.3em] text-[#1a3a5c] mb-4">
            {t('catalog.titleAccent')}
          </p>
          <h2 className="font-playfair text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-4">
            {language === 'en' ? 'Every photo is an experience' : 'Cada foto es una experiencia'}
            <br className="hidden sm:block" />
            <span className="italic"> {language === 'en' ? 'you can live' : 'que puedes vivir'}</span>
          </h2>
          <p className="font-dm-sans text-sm sm:text-base text-[#f5f0e8]/50 mb-8 max-w-lg mx-auto">
            {language === 'en' ? 'Tours with private boat, bilingual guide, and every detail taken care of so you only have to enjoy.' : 'Tours con lancha privada, guía bilingüe y todos los detalles cuidados para que solo te preocupes por disfrutar.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/catalogo"
              className="inline-flex items-center justify-center gap-2 bg-[#f5f0e8] text-[#0a0a0a] px-7 py-3 rounded-full font-dm-sans font-semibold text-sm hover:bg-white transition-colors duration-200"
            >
              {t('nav.cta')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <a
              href="https://wa.me/50222681264?text=Hola!%20Me%20interesa%20reservar%20un%20tour"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-[#f5f0e8]/20 text-[#f5f0e8]/70 px-7 py-3 rounded-full font-dm-sans text-sm hover:bg-[#f5f0e8]/5 hover:text-[#f5f0e8] transition-colors duration-200"
              aria-label={language === 'en' ? 'Check availability on WhatsApp' : 'Consultar disponibilidad por WhatsApp'}
            >
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {t('cta.whatsapp')}
            </a>
          </div>
        </div>

        {/* ---- Group 4: Large landscape (full) ---- */}
        <div data-gallery-group="4">
          <div data-gallery-card>
            <GalleryCard item={galleryItems[6]} itemIndex={6} heightClass="h-[45vh] sm:h-[55vh] lg:h-[80vh]" parallaxSpeed={0.1} onOpen={handleOpenViewer} lang={language} />
          </div>
        </div>

        {/* ---- Group 5: Medium portrait + Medium landscape ---- */}
        <div data-gallery-group="5" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-5 mt-[6vh] sm:mt-[7vh] lg:mt-[8vh]">
          <div className="md:col-span-1 lg:col-span-5" data-gallery-card>
            <GalleryCard item={galleryItems[9]} itemIndex={9} heightClass="h-[42vh] sm:h-[50vh] lg:h-[65vh]" parallaxSpeed={0.2} onOpen={handleOpenViewer} lang={language} />
          </div>
          <div className="md:col-span-1 lg:col-span-7" data-gallery-card>
            <GalleryCard item={galleryItems[7]} itemIndex={7} heightClass="h-[42vh] sm:h-[50vh] lg:h-[65vh]" parallaxSpeed={0.12} onOpen={handleOpenViewer} lang={language} />
          </div>
        </div>

        {/* ---- Group 6: Small + Small (closing pair) ---- */}
        <div data-gallery-group="6" className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-5 mt-[6vh] sm:mt-[7vh] lg:mt-[8vh]">
          <div data-gallery-card>
            <GalleryCard item={galleryItems[8]} itemIndex={8} heightClass="h-[35vh] sm:h-[40vh] lg:h-[50vh]" parallaxSpeed={0.15} onOpen={handleOpenViewer} lang={language} />
          </div>
          <div data-gallery-card>
            <GalleryCard item={galleryItems[4]} itemIndex={4} heightClass="h-[35vh] sm:h-[40vh] lg:h-[50vh]" parallaxSpeed={0.08} onOpen={handleOpenViewer} lang={language} />
          </div>
        </div>

        {/* ---- Remaining gallery images — asymmetric layout ---- */}
        {remainingItems.length > 0 && (
          <RemainingGalleryGrid
            items={remainingItems}
            startIndex={galleryItems.length}
            onOpen={handleOpenViewer}
            lang={language}
          />
        )}
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
            {language === 'en' ? 'Your next adventure' : 'Tu próxima aventura'}
          </p>
          <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-3 sm:mb-4">
            {language === 'en' ? 'Ready to live' : '¿Listo para vivir'}
            <br />
            <span className="italic">{language === 'en' ? 'the experience?' : 'la experiencia?'}</span>
          </h2>
          <p className="font-dm-sans text-base sm:text-lg lg:text-xl text-[#f5f0e8]/35 mb-10 sm:mb-12 max-w-xl mx-auto">
            {language === 'en' ? 'Lake Atitlán awaits you' : 'El Lago de Atitlán te espera'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/catalogo"
              className="inline-flex items-center justify-center gap-2.5 bg-[#f5f0e8] text-[#0a0a0a] min-h-[52px] px-9 py-3.5 rounded-full font-dm-sans font-semibold text-base hover:bg-white transition-colors duration-200"
            >
              {t('nav.cta')}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <a
              href="https://wa.me/50222681264?text=Hola!%20Quiero%20información%20sobre%20tours%20en%20Atitlán"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2.5 border border-[#f5f0e8]/15 text-[#f5f0e8]/80 min-h-[52px] px-9 py-3.5 rounded-full font-dm-sans font-medium text-base hover:bg-[#f5f0e8]/5 hover:text-[#f5f0e8] transition-colors duration-200"
              aria-label={language === 'en' ? 'Chat with us on WhatsApp' : 'Hablar con nosotros por WhatsApp'}
            >
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {t('cta.whatsapp')}
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
          aria-label={language === 'en' ? 'Book an experience at Lake Atitlán' : 'Reservar experiencia en Lago de Atitlán'}
        >
          <svg className="w-4 h-4 text-[#f5f0e8]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {t('tour.reserve')}
        </a>
      </div>

      {/* ================================
          FULLSCREEN VIEWER
          ================================ */}
      {viewerState && (
        <GalleryViewer
          items={allGalleryItems}
          initialIndex={viewerState.index}
          sourceEl={viewerState.sourceEl}
          onClose={handleCloseViewer}
        />
      )}
    </div>
  );
};

// ============================================================
// Remaining Gallery Grid — asymmetric layout patterns
// ============================================================

/*
 * Layout patterns that repeat every 6 items:
 *  A) 8-col + 4-col  (2 items)
 *  B) full-width      (1 item)
 *  C) 5-col + 7-col  (2 items)
 *  D) 4-col + 4-col + 4-col (3 items — but we count 1 here)
 * Total per cycle: items consumed = 2+1+2+3 = 8
 */

interface LayoutRow {
  type: 'two-asymmetric' | 'full' | 'two-asymmetric-reverse' | 'three';
  count: number; // how many items this row consumes
}

const LAYOUT_CYCLE: LayoutRow[] = [
  { type: 'two-asymmetric', count: 2 },
  { type: 'full', count: 1 },
  { type: 'two-asymmetric-reverse', count: 2 },
  { type: 'three', count: 3 },
];

const HEIGHT_MAP: Record<string, Record<'large' | 'medium' | 'small', string>> = {
  'two-asymmetric': {
    large: 'h-[42vh] sm:h-[50vh] lg:h-[65vh]',
    medium: 'h-[42vh] sm:h-[50vh] lg:h-[65vh]',
    small: 'h-[42vh] sm:h-[50vh] lg:h-[65vh]',
  },
  full: {
    large: 'h-[42vh] sm:h-[55vh] lg:h-[75vh]',
    medium: 'h-[42vh] sm:h-[50vh] lg:h-[65vh]',
    small: 'h-[38vh] sm:h-[45vh] lg:h-[55vh]',
  },
  'two-asymmetric-reverse': {
    large: 'h-[42vh] sm:h-[50vh] lg:h-[65vh]',
    medium: 'h-[42vh] sm:h-[50vh] lg:h-[65vh]',
    small: 'h-[42vh] sm:h-[50vh] lg:h-[65vh]',
  },
  three: {
    large: 'h-[35vh] sm:h-[40vh] lg:h-[50vh]',
    medium: 'h-[35vh] sm:h-[40vh] lg:h-[50vh]',
    small: 'h-[32vh] sm:h-[38vh] lg:h-[45vh]',
  },
};

const RemainingGalleryGrid: React.FC<{
  items: GalleryItem[];
  startIndex: number;
  onOpen: (index: number, sourceEl: HTMLElement) => void;
  lang?: Language;
}> = ({ items, startIndex, onOpen, lang = 'es' as Language }) => {
  const rows: { layout: LayoutRow; items: GalleryItem[]; baseIdx: number }[] = [];
  let cursor = 0;
  let cycleIdx = 0;

  while (cursor < items.length) {
    const layout = LAYOUT_CYCLE[cycleIdx % LAYOUT_CYCLE.length];
    const slice = items.slice(cursor, cursor + layout.count);
    if (slice.length === 0) break;
    rows.push({ layout, items: slice, baseIdx: cursor });
    cursor += slice.length;
    cycleIdx++;
  }

  return (
    <>
      {rows.map((row, rowIdx) => {
        const groupNum = `remaining-${rowIdx}`;
        const mt = 'mt-[6vh] sm:mt-[7vh] lg:mt-[8vh]';

        if (row.layout.type === 'full') {
          const it = row.items[0];
          return (
            <div key={groupNum} data-gallery-group={groupNum} className={mt}>
              <div data-gallery-card>
                <GalleryCard
                  item={it}
                  itemIndex={startIndex + row.baseIdx}
                  heightClass={HEIGHT_MAP.full[it.size]}
                  parallaxSpeed={0.1}
                  onOpen={onOpen}
                  lang={lang}
                />
              </div>
            </div>
          );
        }

        if (row.layout.type === 'two-asymmetric') {
          return (
            <div key={groupNum} data-gallery-group={groupNum} className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-5 ${mt}`}>
              {row.items[0] && (
                <div className="md:col-span-1 lg:col-span-8" data-gallery-card>
                  <GalleryCard
                    item={row.items[0]}
                    itemIndex={startIndex + row.baseIdx}
                    heightClass={HEIGHT_MAP['two-asymmetric'][row.items[0].size]}
                    parallaxSpeed={0.12}
                    onOpen={onOpen}
                    lang={lang}
                  />
                </div>
              )}
              {row.items[1] && (
                <div className="md:col-span-1 lg:col-span-4" data-gallery-card>
                  <GalleryCard
                    item={row.items[1]}
                    itemIndex={startIndex + row.baseIdx + 1}
                    heightClass={HEIGHT_MAP['two-asymmetric'][row.items[1].size]}
                    parallaxSpeed={0.18}
                    onOpen={onOpen}
                    lang={lang}
                  />
                </div>
              )}
            </div>
          );
        }

        if (row.layout.type === 'two-asymmetric-reverse') {
          return (
            <div key={groupNum} data-gallery-group={groupNum} className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-5 ${mt}`}>
              {row.items[0] && (
                <div className="md:col-span-1 lg:col-span-5" data-gallery-card>
                  <GalleryCard
                    item={row.items[0]}
                    itemIndex={startIndex + row.baseIdx}
                    heightClass={HEIGHT_MAP['two-asymmetric-reverse'][row.items[0].size]}
                    parallaxSpeed={0.18}
                    onOpen={onOpen}
                    lang={lang}
                  />
                </div>
              )}
              {row.items[1] && (
                <div className="md:col-span-1 lg:col-span-7" data-gallery-card>
                  <GalleryCard
                    item={row.items[1]}
                    itemIndex={startIndex + row.baseIdx + 1}
                    heightClass={HEIGHT_MAP['two-asymmetric-reverse'][row.items[1].size]}
                    parallaxSpeed={0.1}
                    onOpen={onOpen}
                    lang={lang}
                  />
                </div>
              )}
            </div>
          );
        }

        // three columns
        return (
          <div key={groupNum} data-gallery-group={groupNum} className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 ${mt}`}>
            {row.items.map((it, i) => (
              <div key={it.id} data-gallery-card>
                <GalleryCard
                  item={it}
                  itemIndex={startIndex + row.baseIdx + i}
                  heightClass={HEIGHT_MAP.three[it.size]}
                  parallaxSpeed={[0.08, 0.15, 0.12][i % 3]}
                  onOpen={onOpen}
                  lang={lang}
                />
              </div>
            ))}
          </div>
        );
      })}
    </>
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
  lang?: Language;
}> = ({ item, itemIndex, heightClass, parallaxSpeed = 0.15, onOpen, lang = 'es' as Language }) => {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Check if image is already cached/complete on mount (handles fast scroll past)
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      setLoaded(true);
    }
  }, []);

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
      aria-label={lang === 'en' ? `View ${L(item, 'title', lang)} fullscreen` : `Ver ${L(item, 'title', lang)} en pantalla completa`}
      className={`group relative block w-full overflow-hidden rounded-xl sm:rounded-2xl bg-[#141414] cursor-pointer select-none ${heightClass}`}
    >
      {/* Blur placeholder — dominant color */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${loaded ? 'opacity-0' : 'opacity-100'}`}
        style={{ backgroundColor: item.color }}
        aria-hidden="true"
      />

      {/* Media with parallax data attribute — extra height for parallax room */}
      {item.resourceType === 'video' ? (
        <video
          ref={imgRef as any}
          src={getCloudinaryUrl(item.src, { resourceType: 'video' })}
          data-parallax={parallaxSpeed}
          className={`absolute inset-[-18%] w-[136%] h-[136%] sm:inset-[-15%] sm:w-[130%] sm:h-[130%] max-w-none object-cover will-change-transform transition-[transform,opacity] duration-500 ease-out group-hover:scale-[1.03] ${loaded ? 'opacity-100' : 'opacity-0'}`}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setLoaded(true)}
        />
      ) : (
        <img
          ref={imgRef}
          src={getCloudinaryUrl(item.src, { width: 1600 })}
          srcSet={srcSet}
          sizes={sizes}
          alt={L(item, 'alt', lang)}
          data-parallax={parallaxSpeed}
          className={`absolute inset-[-18%] w-[136%] h-[136%] sm:inset-[-15%] sm:w-[130%] sm:h-[130%] max-w-none object-cover will-change-transform transition-[transform,opacity] duration-500 ease-out group-hover:scale-[1.03] ${loaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          draggable={false}
        />
      )}

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
          {L(item, 'title', lang)}
          <span className="text-[#f5f0e8]/25 mx-1.5">·</span>
          <span className="text-[#f5f0e8]/50">{L(item, 'location', lang)}</span>
        </p>
      </div>
    </div>
  );
};

export default GaleriaPage;
