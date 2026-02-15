import React, { useEffect, useRef, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Seo from '../components/Seo';
import { GlassNav, GlassFooter } from '../components/shared';
import { buildOrganizationSchema, buildWebSiteSchema } from '../seo';
import { getCloudinaryUrl } from '../src/utils/cloudinary';

gsap.registerPlugin(ScrollTrigger);

// --- Curated gallery sections ---
// Each section tells a visual story of the Atitlán experience.
// Images hand-picked from cloudinary-assets for maximum impact.

interface GalleryImage {
  public_id: string;
  title: string;
  location: string;
  aspect: 'landscape' | 'portrait' | 'square';
}

interface GallerySection {
  id: string;
  title: string;
  subtitle: string;
  images: GalleryImage[];
}

const HERO_IMAGE: GalleryImage = {
  public_id: 'DSC04387_zcq91s',
  title: 'Mirador Santa Catarina Palopó',
  location: 'Santa Catarina Palopó',
  aspect: 'landscape',
};

const GALLERY_SECTIONS: GallerySection[] = [
  {
    id: 'pueblos',
    title: 'Pueblos del Lago',
    subtitle: 'Cada pueblo guarda una historia, un color, un sabor diferente',
    images: [
      { public_id: 'DSC04019_ox7ytu', title: 'Calle de las Sombrillas', location: 'San Juan la Laguna', aspect: 'landscape' },
      { public_id: 'DSC04042_ktnwye', title: 'Calle Central', location: 'San Juan la Laguna', aspect: 'portrait' },
      { public_id: 'DSC04063_bompv3', title: 'Muelle San Pedro', location: 'San Pedro la Laguna', aspect: 'landscape' },
      { public_id: 'DSC04414_ziuyjw', title: 'Casas Pintadas', location: 'Santa Catarina Palopó', aspect: 'landscape' },
      { public_id: 'DSC04466_mxfzds', title: 'Callejones', location: 'San Antonio Palopó', aspect: 'landscape' },
    ],
  },
  {
    id: 'cultura',
    title: 'Cultura Viva',
    subtitle: 'Tradiciones milenarias que siguen latiendo en cada rincón',
    images: [
      { public_id: 'DSC04054_skmjsn', title: 'Mural en Relieve', location: 'San Juan la Laguna', aspect: 'landscape' },
      { public_id: 'DSC04177_tcgwam', title: 'Iglesia Santiago Apóstol', location: 'Santiago Atitlán', aspect: 'landscape' },
      { public_id: 'DSC04401_isltck', title: 'Artesanas Tejedoras', location: 'Santa Catarina Palopó', aspect: 'landscape' },
      { public_id: 'DSC04037_hi3wgr', title: 'Marimbistas San Juaneros', location: 'San Juan la Laguna', aspect: 'landscape' },
      { public_id: 'DSC04194_panqpm', title: 'Honorable Agricultor', location: 'Santiago Atitlán', aspect: 'landscape' },
    ],
  },
  {
    id: 'sabores',
    title: 'Sabores del Lago',
    subtitle: 'Gastronomía local que despierta todos los sentidos',
    images: [
      { public_id: 'DSC04238_swyart', title: 'Vino y Queso', location: 'San Lucas Tolimán', aspect: 'landscape' },
      { public_id: 'DSC04185_rgqgug', title: 'Comida Local', location: 'Santiago Atitlán', aspect: 'landscape' },
      { public_id: 'DSC04135-HDR_gyllyu', title: 'Restaurante con Vista', location: 'Santiago Atitlán', aspect: 'landscape' },
    ],
  },
  {
    id: 'aventura',
    title: 'Tu Aventura',
    subtitle: 'Playas secretas, miradores y momentos que no olvidarás',
    images: [
      { public_id: 'DSC04291_k4ew5f', title: 'Playa Piedra el Capitán', location: 'San Lucas Tolimán', aspect: 'landscape' },
      { public_id: 'DSC04094_vht4pi', title: 'Navegando el Lago', location: 'Ruta San Pedro – Santiago', aspect: 'landscape' },
      { public_id: 'DSC04374_rdep9d', title: 'Playa Santa Catarina', location: 'Santa Catarina Palopó', aspect: 'landscape' },
      { public_id: 'DSC04503_mb5wi7', title: 'Mirador Volcánico', location: 'San Antonio Palopó', aspect: 'portrait' },
    ],
  },
];

const CLOSING_IMAGE: GalleryImage = {
  public_id: 'DSC04496_noiz4x',
  title: 'Mirador San Antonio Palopó',
  location: 'San Antonio Palopó',
  aspect: 'landscape',
};

// Responsive Cloudinary image URL helper
const imgUrl = (publicId: string, w: number, h?: number) =>
  getCloudinaryUrl(publicId, { width: w, height: h, crop: 'fill' });

const GaleriaPage: React.FC = () => {
  const mainRef = useRef<HTMLDivElement>(null);

  // GSAP ScrollTrigger animations
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Hero parallax — image moves slower than scroll
      gsap.to('.gallery-hero-img', {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: '.gallery-hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      // Hero text fade out on scroll
      gsap.to('.gallery-hero-content', {
        opacity: 0,
        y: -60,
        ease: 'none',
        scrollTrigger: {
          trigger: '.gallery-hero',
          start: '30% top',
          end: 'bottom top',
          scrub: true,
        },
      });

      // Section titles reveal
      gsap.utils.toArray<HTMLElement>('.gsection-title').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 60,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });
      });

      // Images scroll-reveal with stagger
      gsap.utils.toArray<HTMLElement>('.gimg-reveal').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 80,
          scale: 0.95,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        });
      });

      // CTA sections reveal
      gsap.utils.toArray<HTMLElement>('.gcta-reveal').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 40,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });
      });

      // Closing parallax
      gsap.to('.gallery-closing-img', {
        yPercent: 15,
        ease: 'none',
        scrollTrigger: {
          trigger: '.gallery-closing',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, mainRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={mainRef} className="galeria-page bg-[#0a0a0a] text-[#f5f0e8]">
      <Seo
        title="Galería | Atitlán Experiences — Fotos del Lago de Atitlán"
        description="Explora nuestra galería inmersiva de fotos del Lago de Atitlán, Guatemala. Paisajes, cultura, gastronomía y aventuras premium en el lago más hermoso del mundo."
        canonicalPath="/galeria"
        structuredData={[buildOrganizationSchema(), buildWebSiteSchema()]}
      />

      {/* Nav - transparent over hero */}
      <GlassNav />

      {/* ============================
          HERO — Full viewport opening
          ============================ */}
      <section className="gallery-hero relative h-[100svh] min-h-[600px] overflow-hidden">
        {/* Background image with parallax */}
        <div className="gallery-hero-img absolute inset-0 -top-[10%] -bottom-[10%]">
          <img
            src={imgUrl(HERO_IMAGE.public_id, 2400, 1350)}
            alt={HERO_IMAGE.title}
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
          {/* Dark overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 via-[#0a0a0a]/30 to-[#0a0a0a]" />
        </div>

        {/* Hero content */}
        <div className="gallery-hero-content relative z-10 h-full flex flex-col justify-end pb-16 sm:pb-20 px-5 sm:px-8 lg:px-16">
          <div className="max-w-5xl">
            <p className="font-dm-sans text-xs sm:text-sm uppercase tracking-[0.3em] text-[#f5f0e8]/60 mb-3 sm:mb-4">
              Atitlán Experiences
            </p>
            <h1 className="font-playfair text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight mb-4 sm:mb-6">
              El lago más
              <br />
              <span className="italic text-[#f5f0e8]/80">hermoso del mundo</span>
            </h1>
            <p className="font-dm-sans text-base sm:text-lg md:text-xl text-[#f5f0e8]/60 max-w-xl leading-relaxed">
              Una experiencia visual de los pueblos, sabores y aventuras que te esperan en el Lago de Atitlán.
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-scroll-bounce">
          <span className="font-dm-sans text-[10px] uppercase tracking-[0.25em] text-[#f5f0e8]/40">
            Desliza
          </span>
          <svg className="w-5 h-5 text-[#f5f0e8]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ============================
          GALLERY SECTIONS
          ============================ */}
      {GALLERY_SECTIONS.map((section, sectionIdx) => (
        <React.Fragment key={section.id}>
          {/* Section */}
          <section
            className="relative px-4 sm:px-6 lg:px-12 py-16 sm:py-24 lg:py-32"
            id={section.id}
          >
            {/* Section header */}
            <div className="gsection-title max-w-6xl mx-auto mb-10 sm:mb-14 lg:mb-20">
              <span className="font-dm-sans text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#1a3a5c] block mb-3">
                {String(sectionIdx + 1).padStart(2, '0')} / {String(GALLERY_SECTIONS.length).padStart(2, '0')}
              </span>
              <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-3 sm:mb-4">
                {section.title}
              </h2>
              <p className="font-dm-sans text-base sm:text-lg text-[#f5f0e8]/50 max-w-lg">
                {section.subtitle}
              </p>
            </div>

            {/* Images grid — varies by section to create visual rhythm */}
            <div className="max-w-7xl mx-auto">
              {section.images.length === 5 ? (
                <FiveImageLayout images={section.images} />
              ) : section.images.length === 4 ? (
                <FourImageLayout images={section.images} />
              ) : (
                <ThreeImageLayout images={section.images} />
              )}
            </div>
          </section>

          {/* CTA after sections 1 and 3 */}
          {sectionIdx === 0 && (
            <InlineCTA
              heading="Vive la experiencia completa"
              text="Nuestros tours te llevan a los lugares más auténticos del lago con guía bilingüe, lancha privada y consumos incluidos."
              primaryLabel="Ver Tours"
              primaryTo="/catalogo"
              secondaryLabel="Reservar por WhatsApp"
              secondaryHref="https://wa.me/50222681264?text=Hola!%20Me%20interesa%20reservar%20un%20tour%20en%20Atitlán"
            />
          )}
          {sectionIdx === 2 && (
            <InlineCTA
              heading="Degusta el lago"
              text="Experiencias gastronómicas con reservaciones incluidas en los mejores restaurantes de cada pueblo."
              primaryLabel="Tour Gastronómico"
              primaryTo="/catalogo"
              secondaryLabel="Consultar disponibilidad"
              secondaryHref="https://wa.me/50222681264?text=Hola!%20Me%20interesa%20el%20tour%20gastronómico"
            />
          )}
        </React.Fragment>
      ))}

      {/* ============================
          CLOSING SECTION — Final CTA
          ============================ */}
      <section className="gallery-closing relative overflow-hidden py-0">
        {/* Full-width dramatic closing image */}
        <div className="relative h-[70svh] sm:h-[80svh] min-h-[500px] overflow-hidden">
          <div className="gallery-closing-img absolute inset-0 -top-[15%] -bottom-[15%]">
            <img
              src={imgUrl(CLOSING_IMAGE.public_id, 2400, 1350)}
              alt={CLOSING_IMAGE.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />

          {/* Closing CTA overlay */}
          <div className="gcta-reveal absolute inset-0 flex items-end z-10 px-5 sm:px-8 lg:px-16 pb-16 sm:pb-20">
            <div className="max-w-3xl">
              <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6">
                Tu aventura en Atitlán
                <br />
                <span className="italic text-[#f5f0e8]/70">empieza aquí</span>
              </h2>
              <p className="font-dm-sans text-base sm:text-lg text-[#f5f0e8]/60 mb-6 sm:mb-8 max-w-lg">
                Reserva tu experiencia premium y vive el lago como nunca antes. Lancha privada, guía bilingüe y todos los detalles cuidados.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  to="/catalogo"
                  className="inline-flex items-center justify-center gap-2 bg-[#f5f0e8] text-[#0a0a0a] px-7 py-3.5 rounded-full font-dm-sans font-semibold text-sm tracking-wide hover:bg-white transition-colors duration-300"
                >
                  Explorar Tours
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <a
                  href="https://wa.me/50222681264?text=Hola!%20Quiero%20reservar%20un%20tour%20en%20Atitlán"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-[#f5f0e8]/30 text-[#f5f0e8] px-7 py-3.5 rounded-full font-dm-sans font-medium text-sm hover:bg-[#f5f0e8]/10 transition-colors duration-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Share your photos section */}
      <section className="px-5 sm:px-8 lg:px-16 py-16 sm:py-24">
        <div className="gcta-reveal max-w-3xl mx-auto text-center">
          <p className="font-dm-sans text-xs uppercase tracking-[0.3em] text-[#2d4a3e] mb-4">
            Comparte tu experiencia
          </p>
          <h3 className="font-playfair text-2xl sm:text-3xl font-bold mb-4">
            ¿Tienes fotos increíbles del lago?
          </h3>
          <p className="font-dm-sans text-[#f5f0e8]/50 mb-8 max-w-md mx-auto">
            Envíanos tus mejores momentos y podrían aparecer en nuestra galería.
          </p>
          <a
            href="https://wa.me/50222681264?text=¡Hola! Quiero compartir mis fotos de Atitlán"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 border border-[#f5f0e8]/20 text-[#f5f0e8]/70 px-6 py-3 rounded-full font-dm-sans text-sm hover:bg-[#f5f0e8]/5 hover:text-[#f5f0e8] transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Enviar fotos
          </a>
        </div>
      </section>

      <GlassFooter />
    </div>
  );
};

// ============================================================
// Sub-components for image layouts
// ============================================================

/** Inline CTA banner between gallery sections */
const InlineCTA: React.FC<{
  heading: string;
  text: string;
  primaryLabel: string;
  primaryTo: string;
  secondaryLabel: string;
  secondaryHref: string;
}> = ({ heading, text, primaryLabel, primaryTo, secondaryLabel, secondaryHref }) => (
  <div className="gcta-reveal px-5 sm:px-8 lg:px-16 py-12 sm:py-16">
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-10 border-t border-b border-[#f5f0e8]/10 py-10 sm:py-14">
      <div className="flex-1">
        <h3 className="font-playfair text-2xl sm:text-3xl font-bold mb-2">
          {heading}
        </h3>
        <p className="font-dm-sans text-sm sm:text-base text-[#f5f0e8]/50 max-w-md">
          {text}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 sm:flex-shrink-0">
        <Link
          to={primaryTo}
          className="inline-flex items-center justify-center gap-2 bg-[#1a3a5c] text-[#f5f0e8] px-6 py-3 rounded-full font-dm-sans font-semibold text-sm tracking-wide hover:bg-[#1a3a5c]/80 transition-colors duration-300"
        >
          {primaryLabel}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
        <a
          href={secondaryHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 border border-[#2d4a3e] text-[#f5f0e8]/70 px-6 py-3 rounded-full font-dm-sans text-sm hover:bg-[#2d4a3e]/20 transition-colors duration-300"
        >
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          {secondaryLabel}
        </a>
      </div>
    </div>
  </div>
);

/** 5-image layout: hero full-width + 2x2 grid below */
const FiveImageLayout: React.FC<{ images: GalleryImage[] }> = ({ images }) => (
  <div className="space-y-4 sm:space-y-5">
    {/* First image — full width hero */}
    <div className="gimg-reveal">
      <GalleryImg image={images[0]} sizes="100vw" priority />
    </div>
    {/* 2x2 grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
      {images.slice(1, 3).map((img) => (
        <div key={img.public_id} className="gimg-reveal">
          <GalleryImg image={img} sizes="(min-width:640px) 50vw, 100vw" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
      {images.slice(3, 5).map((img) => (
        <div key={img.public_id} className="gimg-reveal">
          <GalleryImg image={img} sizes="(min-width:640px) 50vw, 100vw" />
        </div>
      ))}
    </div>
  </div>
);

/** 4-image layout: 2 full-width + 2 side by side */
const FourImageLayout: React.FC<{ images: GalleryImage[] }> = ({ images }) => (
  <div className="space-y-4 sm:space-y-5">
    <div className="gimg-reveal">
      <GalleryImg image={images[0]} sizes="100vw" priority />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
      {images.slice(1, 3).map((img) => (
        <div key={img.public_id} className="gimg-reveal">
          <GalleryImg image={img} sizes="(min-width:640px) 50vw, 100vw" />
        </div>
      ))}
    </div>
    <div className="gimg-reveal">
      <GalleryImg image={images[3]} sizes="100vw" />
    </div>
  </div>
);

/** 3-image layout: full-width + 2 side by side */
const ThreeImageLayout: React.FC<{ images: GalleryImage[] }> = ({ images }) => (
  <div className="space-y-4 sm:space-y-5">
    <div className="gimg-reveal">
      <GalleryImg image={images[0]} sizes="100vw" priority />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
      {images.slice(1).map((img) => (
        <div key={img.public_id} className="gimg-reveal">
          <GalleryImg image={img} sizes="(min-width:640px) 50vw, 100vw" />
        </div>
      ))}
    </div>
  </div>
);

/** Single gallery image with caption overlay */
const GalleryImg: React.FC<{
  image: GalleryImage;
  sizes?: string;
  priority?: boolean;
}> = ({ image, priority }) => {
  const isPortrait = image.aspect === 'portrait';
  const w = isPortrait ? 900 : 1600;
  const h = isPortrait ? 1200 : 1000;

  return (
    <figure className="group relative overflow-hidden rounded-xl sm:rounded-2xl bg-[#141414]">
      <div className={`relative ${isPortrait ? 'aspect-[3/4]' : 'aspect-[16/10]'}`}>
        <img
          src={imgUrl(image.public_id, w, h)}
          alt={image.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading={priority ? 'eager' : 'lazy'}
        />
        {/* Hover overlay with caption */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
          <h4 className="font-playfair text-lg sm:text-xl font-semibold text-[#f5f0e8] mb-0.5">
            {image.title}
          </h4>
          <p className="font-dm-sans text-xs sm:text-sm text-[#f5f0e8]/50 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {image.location}
          </p>
        </div>
      </div>
    </figure>
  );
};

export default GaleriaPage;
