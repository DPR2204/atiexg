import React, { useRef, useEffect, useCallback, useState } from 'react';

const TOUR_PHOTOS = [
    {
        src: 'https://static.wixstatic.com/media/acc6a6_dd9e0482bcd74a918226999ef8cf61fd~mv2.jpeg',
        alt: 'Viajeros disfrutando un tour en Atitlán',
    },
    {
        src: 'https://static.wixstatic.com/media/acc6a6_29b9bc651b9049a28f1af774dd1a8712~mv2.jpeg',
        alt: 'Grupo de turistas en experiencia local',
    },
    {
        src: 'https://static.wixstatic.com/media/acc6a6_3c3f7e6149894cb9a2edd66b99bdfdb8~mv2.jpeg',
        alt: 'Momento especial durante un tour',
    },
    {
        src: 'https://static.wixstatic.com/media/acc6a6_87e23154d3ba4c7ca5f43756c95a297b~mv2.jpeg',
        alt: 'Aventura en el Lago de Atitlán',
    },
    {
        src: 'https://static.wixstatic.com/media/acc6a6_3a41d00ca5554fac9751f1a216164e2e~mv2.jpeg',
        alt: 'Explorando la naturaleza guatemalteca',
    },
    {
        src: 'https://static.wixstatic.com/media/acc6a6_5cd99fc3b5ff4fa9b258f27e234ee309~mv2.jpeg',
        alt: 'Recuerdos de un tour inolvidable',
    },
];

/* ── Infinite Marquee Row (JS-driven) ─────────────────────── */

interface MarqueeRowProps {
    speed?: number;   // px per second
    reverse?: boolean;
    isVisibleRef: React.RefObject<boolean>;
}

const MarqueeRow: React.FC<MarqueeRowProps> = ({ speed = 40, reverse = false, isVisibleRef }) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const offsetRef = useRef(0);
    const rafRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);

    const animate = useCallback(
        (timestamp: number) => {
            if (!trackRef.current) return;
            if (!isVisibleRef.current) {
                rafRef.current = requestAnimationFrame(animate);
                return;
            }

            if (!lastTimeRef.current) lastTimeRef.current = timestamp;
            const delta = (timestamp - lastTimeRef.current) / 1000; // seconds
            lastTimeRef.current = timestamp;

            const direction = reverse ? 1 : -1;
            offsetRef.current += speed * delta * direction;

            // Get the width of exactly one set of photos (half the track)
            const halfWidth = trackRef.current.scrollWidth / 2;

            // Reset seamlessly when we've scrolled one full set
            if (!reverse && offsetRef.current <= -halfWidth) {
                offsetRef.current += halfWidth;
            } else if (reverse && offsetRef.current >= 0) {
                offsetRef.current -= halfWidth;
            }

            trackRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
            rafRef.current = requestAnimationFrame(animate);
        },
        [speed, reverse],
    );

    useEffect(() => {
        // Start reverse rows offset by half so they look different
        if (reverse && trackRef.current) {
            offsetRef.current = -(trackRef.current.scrollWidth / 2);
        }
        rafRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafRef.current);
    }, [animate, reverse]);

    return (
        <div className="marquee-wrapper">
            {/* Fade edges */}
            <div className="marquee-fade-left" />
            <div className="marquee-fade-right" />

            <div ref={trackRef} className="marquee-track">
                {/* First set */}
                {TOUR_PHOTOS.map((photo, i) => (
                    <div key={`a-${i}`} className="marquee-card">
                        <img
                            src={photo.src}
                            alt={photo.alt}
                            loading="lazy"
                            draggable={false}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
                {/* Duplicate for seamless loop */}
                {TOUR_PHOTOS.map((photo, i) => (
                    <div key={`b-${i}`} className="marquee-card">
                        <img
                            src={photo.src}
                            alt={photo.alt}
                            loading="lazy"
                            draggable={false}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ── Main Section ─────────────────────────────────────────── */

const SocialProofGallery: React.FC = () => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const isVisibleRef = useRef(true);

    useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { isVisibleRef.current = entry.isIntersecting; },
            { threshold: 0 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <section ref={sectionRef} className="py-20 lg:py-28 overflow-hidden bg-gray-50/50">
            {/* Heading */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12 text-center">
                <span className="inline-block text-xs font-bold uppercase tracking-[0.3em] text-red-500 mb-4">
                    Momentos Reales
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
                    Nuestros viajeros en acción
                </h2>
                <p className="text-gray-500 max-w-xl mx-auto">
                    Cada tour es una historia nueva. Estas son algunas de las experiencias
                    que nuestros clientes han vivido.
                </p>
            </div>

            {/* Row 1 – scrolls left */}
            <MarqueeRow speed={40} isVisibleRef={isVisibleRef} />

            {/* Spacer */}
            <div className="h-4" />

            {/* Row 2 – scrolls right */}
            <MarqueeRow speed={35} reverse isVisibleRef={isVisibleRef} />
        </section>
    );
};

export default SocialProofGallery;
