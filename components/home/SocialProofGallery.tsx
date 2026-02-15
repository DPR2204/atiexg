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

// Duplicate photos for seamless infinite scroll
const MARQUEE_PHOTOS = [...TOUR_PHOTOS, ...TOUR_PHOTOS];

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

            {/* Marquee row 1 – scrolls left */}
            <div className="relative mb-4">
                {/* Fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-gray-50/90 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-gray-50/90 to-transparent z-10 pointer-events-none" />

                <div className="flex gap-4 social-marquee">
                    {MARQUEE_PHOTOS.map((photo, i) => (
                        <div
                            key={`row1-${i}`}
                            className="flex-shrink-0 w-64 sm:w-72 lg:w-80 aspect-[4/3] rounded-2xl overflow-hidden group"
                        >
                            <img
                                src={photo.src}
                                alt={photo.alt}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter saturate-[1.1]"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Marquee row 2 – scrolls right (reverse) */}
            <div className="relative">
                {/* Fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-gray-50/90 to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-gray-50/90 to-transparent z-10 pointer-events-none" />

                <div className="flex gap-4 social-marquee social-marquee--reverse">
                    {MARQUEE_PHOTOS.map((photo, i) => (
                        <div
                            key={`row2-${i}`}
                            className="flex-shrink-0 w-64 sm:w-72 lg:w-80 aspect-[4/3] rounded-2xl overflow-hidden group"
                        >
                            <img
                                src={photo.src}
                                alt={photo.alt}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter saturate-[1.1]"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SocialProofGallery;
