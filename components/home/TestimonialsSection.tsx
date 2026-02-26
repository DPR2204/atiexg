import React from 'react';
import { Link } from 'react-router-dom';
import TourImage from '../TourImage';

const EXPERIENCE_PREVIEWS = [
    {
        image: 'DSC04033_kq63ay',
        title: 'Bienvenida en San Juan La Laguna',
        description:
            'Descubre el pueblo de artistas y artesanos más vibrante del lago. Pinturas naturales, cooperativas de mujeres tejedoras y café orgánico.',
    },
    {
        image: 'DSC04238_swyart',
        title: 'Momentos gastronómicos premium',
        description:
            'Degustaciones privadas de vino y queso frente al lago, con productos locales seleccionados y maridajes sorprendentes.',
    },
    {
        image: 'DSC04291_k4ew5f',
        title: 'Días de campo en el lago',
        description:
            'Picnic en playas escondidas con vistas a los volcanes. Una experiencia relajada que combina naturaleza y buena comida.',
    },
];

const TestimonialsSection: React.FC = () => {
    return (
        <section className="py-20 lg:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-block text-xs font-bold uppercase tracking-[0.3em] text-red-500 mb-4">
                        Nuevo en 2026
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                        Próximamente: Historias de Viajeros
                    </h2>
                    <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                        Somos el equipo detrás de{' '}
                        <a
                            href="https://atitlanrestaurantes.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-500 font-semibold hover:text-red-600 transition-colors underline underline-offset-2"
                        >
                            AtitlánRestaurantes.com
                        </a>
                        , la guía gastronómica más completa del Lago de Atitlán. Ahora llevamos esa misma
                        dedicación a las experiencias turísticas.
                    </p>
                </div>

                {/* Experience Preview Cards */}
                <div className="grid md:grid-cols-3 gap-8">
                    {EXPERIENCE_PREVIEWS.map((preview, index) => (
                        <div
                            key={preview.title}
                            className="group glass-card rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <TourImage
                                    src={preview.image}
                                    alt={preview.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    {preview.title}
                                </h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    {preview.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-12">
                    <Link
                        to="/contacto"
                        className="group inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-red-600 transition-all duration-300 shadow-xl shadow-gray-900/20 hover:shadow-red-600/30"
                    >
                        <span>Sé de los primeros en vivir la experiencia</span>
                        <svg
                            className="w-4 h-4 transition-transform group-hover:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.5"
                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
