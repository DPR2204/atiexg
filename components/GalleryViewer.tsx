import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';

// ============================================================
// Types (matches GaleriaPage GalleryItem)
// ============================================================

export interface GalleryItem {
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

interface GalleryViewerProps {
  items: GalleryItem[];
  initialIndex: number;
  sourceEl: HTMLElement | null;
  onClose: () => void;
}

// ============================================================
// GalleryViewer — Fullscreen lightbox
// ============================================================

const GalleryViewer: React.FC<GalleryViewerProps> = ({
  items,
  initialIndex,
  sourceEl,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [hasNavigated, setHasNavigated] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isAnimating = useRef(false);
  const sourceElRef = useRef(sourceEl);
  const previousFocusRef = useRef<HTMLElement | null>(document.activeElement as HTMLElement);
  const touchStart = useRef({ x: 0, y: 0 });
  const touchDelta = useRef({ x: 0, y: 0 });
  const isDraggingDown = useRef(false);

  const item = items[currentIndex];

  // ---------- Body scroll lock ----------
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // ---------- Focus management ----------
  useEffect(() => {
    const timer = setTimeout(() => closeButtonRef.current?.focus(), 100);
    return () => {
      clearTimeout(timer);
      previousFocusRef.current?.focus();
    };
  }, []);

  // ---------- Focus trap ----------
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusable = Array.from(
        overlay.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => {
        const style = getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });

      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleTab);
    return () => window.removeEventListener('keydown', handleTab);
  }, [currentIndex]);

  // ---------- Opening animation ----------
  useEffect(() => {
    const overlay = overlayRef.current;
    const imgContainer = imageContainerRef.current;
    const content = contentRef.current;
    if (!overlay || !imgContainer || !content) return;

    isAnimating.current = true;

    const rect = sourceElRef.current?.getBoundingClientRect();
    if (rect) {
      const top = rect.top;
      const right = window.innerWidth - rect.right;
      const bottom = window.innerHeight - rect.bottom;
      const left = rect.left;

      gsap.set(imgContainer, {
        clipPath: `inset(${top}px ${right}px ${bottom}px ${left}px round 16px)`,
      });
      gsap.set(overlay, { opacity: 1 });
      gsap.set(content, { opacity: 0, y: 20 });

      const tl = gsap.timeline({
        onComplete: () => {
          isAnimating.current = false;
        },
      });

      tl.to(
        imgContainer,
        {
          clipPath: 'inset(0px 0px 0px 0px round 0px)',
          duration: 0.6,
          ease: 'power3.inOut',
        },
        0,
      );
      tl.to(content, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.35);
    } else {
      // Fallback: simple fade
      gsap.set(overlay, { opacity: 0 });
      gsap.to(overlay, {
        opacity: 1,
        duration: 0.3,
        onComplete: () => {
          isAnimating.current = false;
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Close ----------
  const handleClose = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const overlay = overlayRef.current;
    const imgContainer = imageContainerRef.current;
    const content = contentRef.current;
    if (!overlay) {
      onClose();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating.current = false;
        onClose();
      },
    });

    // Fade out content first
    if (content) {
      tl.to(content, { opacity: 0, y: 20, duration: 0.2 }, 0);
    }

    // Clip-path back to source (only if same image as opened)
    const freshRect =
      !hasNavigated && sourceElRef.current
        ? sourceElRef.current.getBoundingClientRect()
        : null;

    if (freshRect && imgContainer) {
      const top = freshRect.top;
      const right = window.innerWidth - freshRect.right;
      const bottom = window.innerHeight - freshRect.bottom;
      const left = freshRect.left;

      tl.to(
        imgContainer,
        {
          clipPath: `inset(${top}px ${right}px ${bottom}px ${left}px round 16px)`,
          duration: 0.5,
          ease: 'power3.inOut',
        },
        0.05,
      );
      tl.to(overlay, { opacity: 0, duration: 0.25 }, 0.4);
    } else {
      // Fade out everything
      tl.to(overlay, { opacity: 0, duration: 0.35 }, 0.15);
    }
  }, [hasNavigated, onClose]);

  // ---------- Navigate ----------
  const navigateTo = useCallback(
    (newIndex: number) => {
      if (isAnimating.current) return;
      isAnimating.current = true;
      setHasNavigated(true);

      const imgContainer = imageContainerRef.current;
      const content = contentRef.current;

      // Fade out
      const tl = gsap.timeline();
      if (imgContainer) tl.to(imgContainer, { opacity: 0, duration: 0.2 }, 0);
      if (content) tl.to(content, { opacity: 0, y: 10, duration: 0.2 }, 0);

      tl.call(() => {
        setCurrentIndex(newIndex);
        requestAnimationFrame(() => {
          if (imgContainer) gsap.set(imgContainer, { opacity: 1 });
          if (content) gsap.set(content, { opacity: 0, y: 15 });
          gsap.to(content, {
            opacity: 1,
            y: 0,
            duration: 0.3,
            delay: 0.05,
            ease: 'power2.out',
          });
          isAnimating.current = false;
        });
      });
    },
    [],
  );

  const goNext = useCallback(() => {
    navigateTo((currentIndex + 1) % items.length);
  }, [currentIndex, items.length, navigateTo]);

  const goPrev = useCallback(() => {
    navigateTo((currentIndex - 1 + items.length) % items.length);
  }, [currentIndex, items.length, navigateTo]);

  // ---------- Keyboard ----------
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          handleClose();
          break;
        case 'ArrowRight':
          goNext();
          break;
        case 'ArrowLeft':
          goPrev();
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleClose, goNext, goPrev]);

  // ---------- Touch / swipe ----------
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    touchDelta.current = { x: 0, y: 0 };
    isDraggingDown.current = false;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStart.current.x;
    const dy = e.touches[0].clientY - touchStart.current.y;
    touchDelta.current = { x: dx, y: dy };

    // Visual feedback for downward drag (dismiss gesture)
    if (dy > 20 && dy > Math.abs(dx) * 1.2) {
      isDraggingDown.current = true;
      const progress = Math.min(dy / 300, 1);
      gsap.set(imageContainerRef.current, {
        y: dy * 0.4,
        scale: 1 - progress * 0.06,
      });
      gsap.set(overlayRef.current, {
        background: `rgba(10,10,10,${1 - progress * 0.6})`,
      });
      gsap.set(contentRef.current, { opacity: 1 - progress });
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    const { x: dx, y: dy } = touchDelta.current;

    // Reset drag transforms first
    if (isDraggingDown.current) {
      if (dy > 120) {
        handleClose();
        return;
      }
      // Snap back
      gsap.to(imageContainerRef.current, { y: 0, scale: 1, duration: 0.3, ease: 'power2.out' });
      gsap.to(overlayRef.current, { background: 'rgba(10,10,10,1)', duration: 0.3 });
      gsap.to(contentRef.current, { opacity: 1, duration: 0.3 });
      isDraggingDown.current = false;
      return;
    }

    // Horizontal swipe
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) goPrev();
      else goNext();
    }
  }, [handleClose, goNext, goPrev]);

  // ---------- WhatsApp URL ----------
  const whatsappUrl = `https://wa.me/50222681264?text=${encodeURIComponent(
    `Hola! Me interesa el tour "${item.title}" en ${item.location}`,
  )}`;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] bg-[#0a0a0a]"
      role="dialog"
      aria-modal="true"
      aria-label={`${item.title} — visor de galería`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* ---- Image ---- */}
      <div
        ref={imageContainerRef}
        className="absolute inset-0 will-change-[clip-path,transform]"
      >
        <img
          src={item.src}
          alt={item.alt}
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>

      {/* ---- Bottom gradient ---- */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/80 via-[#0a0a0a]/25 to-transparent pointer-events-none" />

      {/* ---- Close button ---- */}
      <button
        ref={closeButtonRef}
        onClick={handleClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-[#0a0a0a]/40 backdrop-blur-md text-[#f5f0e8]/80 hover:text-[#f5f0e8] hover:bg-[#0a0a0a]/60 transition-colors duration-200"
        aria-label="Cerrar visor de galería"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* ---- Counter ---- */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 sm:top-6 z-10">
        <span className="font-dm-sans text-xs sm:text-sm text-[#f5f0e8]/40 bg-[#0a0a0a]/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
          {currentIndex + 1} / {items.length}
        </span>
      </div>

      {/* ---- Navigation arrows (hidden on mobile, visible md+) ---- */}
      <button
        onClick={goPrev}
        className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 lg:w-14 lg:h-14 items-center justify-center rounded-full bg-[#0a0a0a]/30 backdrop-blur-md text-[#f5f0e8]/70 hover:text-[#f5f0e8] hover:bg-[#0a0a0a]/50 transition-colors duration-200"
        aria-label="Imagen anterior"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={goNext}
        className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 lg:w-14 lg:h-14 items-center justify-center rounded-full bg-[#0a0a0a]/30 backdrop-blur-md text-[#f5f0e8]/70 hover:text-[#f5f0e8] hover:bg-[#0a0a0a]/50 transition-colors duration-200"
        aria-label="Imagen siguiente"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* ---- Content overlay ---- */}
      <div
        ref={contentRef}
        className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-6 pt-16 sm:px-8 sm:pb-10 lg:px-12 lg:pb-12"
      >
        <div className="max-w-4xl">
          {/* Info */}
          <h2 className="font-playfair text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-[#f5f0e8] leading-tight mb-2">
            {item.title}
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-1.5">
            <p className="font-dm-sans text-sm sm:text-base text-[#f5f0e8]/60 flex items-center gap-1.5">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {item.location}
            </p>
            <span className="font-dm-sans text-sm sm:text-base font-medium text-[#f5f0e8]/80">
              {item.price}
            </span>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 mt-5 sm:mt-6">
            <Link
              to={item.tourLink}
              className="inline-flex items-center justify-center gap-2 bg-[#f5f0e8] text-[#0a0a0a] min-h-[48px] px-7 py-3 rounded-full font-dm-sans font-semibold text-sm sm:text-base hover:bg-white transition-colors duration-200"
              aria-label={`Reservar ${item.title}`}
            >
              Reservar esta experiencia
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-[#f5f0e8]/20 text-[#f5f0e8] min-h-[48px] px-7 py-3 rounded-full font-dm-sans text-sm sm:text-base hover:bg-[#f5f0e8]/10 transition-colors duration-200"
              aria-label={`Consultar sobre ${item.title} por WhatsApp`}
            >
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Consultar por WhatsApp
            </a>
          </div>
        </div>

        {/* Mobile nav hint */}
        <p className="mt-4 font-dm-sans text-[10px] uppercase tracking-[0.2em] text-[#f5f0e8]/25 text-center sm:hidden">
          Desliza para navegar
        </p>
      </div>
    </div>
  );
};

export default GalleryViewer;
