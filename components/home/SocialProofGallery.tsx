import React from 'react';

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

const PhotoCard: React.FC<{ src: string; alt: string }> = ({ src, alt }) => (
    <div className="marquee-card">
        <img
            src={src}
            alt={alt}
            loading="lazy"
            draggable={false}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        />
    </div>
);

const MarqueeRow: React.FC<{ reverse?: boolean }> = ({ reverse }) => (
    <div className="marquee-wrapper">
        {/* Fade edges */}
        <div className="marquee-fade-left" />
        <div className="marquee-fade-right" />

        <div className={`marquee-track ${reverse ? 'marquee-track--reverse' : ''}`}>
            {/* First set */}
            {TOUR_PHOTOS.map((photo, i) => (
                <PhotoCard key={`a-${i}`} src={photo.src} alt={photo.alt} />
            ))}
            {/* Duplicate for seamless loop */}
            {TOUR_PHOTOS.map((photo, i) => (
                <PhotoCard key={`b-${i}`} src={photo.src} alt={photo.alt} />
            ))}
        </div>
    </div>
);

const SocialProofGallery: React.FC = () => {
    return (
        <section className="py-20 lg:py-28 overflow-hidden bg-gray-50/50">
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
            <MarqueeRow />

            {/* Spacer */}
            <div className="h-4" />

            {/* Row 2 – scrolls right */}
            <MarqueeRow reverse />
        </section>
    );
};

export default SocialProofGallery;
