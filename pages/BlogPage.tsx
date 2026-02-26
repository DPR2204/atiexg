import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { GlassNav, GlassFooter } from '../components/shared';
import { getCloudinaryUrl } from '../src/utils/cloudinary';
import { BLOG_POSTS } from '../data/blog-posts';
import { SITE_URL } from '../seo';

const blogListSchema = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'Blog de Atitlan Experiences',
  description: 'Guias, consejos y articulos sobre que hacer en el Lago de Atitlan, Panajachel y los pueblos mayas de Guatemala.',
  url: `${SITE_URL}/blog`,
  blogPost: BLOG_POSTS.map((post) => ({
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    image: getCloudinaryUrl(post.image, { width: 1200, height: 630 }),
    url: `${SITE_URL}/blog/${post.slug}`,
    author: {
      '@type': 'Organization',
      name: 'Atitlan Experiences',
    },
  })),
};

const BlogPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Seo
        title="Blog | Guias y Consejos para el Lago de Atitlan | Atitlan Experiences"
        description="Lee nuestras guias completas sobre que hacer en Panajachel, los mejores pueblos del Lago de Atitlan, tours recomendados y consejos de viaje para Guatemala."
        canonicalPath="/blog"
        structuredData={[blogListSchema]}
        keywords="blog lago Atitlan, que hacer en Panajachel, guia Atitlan, mejores pueblos lago Atitlan, tours Guatemala"
      />
      <GlassNav />

      <main id="main-content">
        {/* Hero */}
        <section className="relative py-20 lg:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-red-50/30" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-100/40 rounded-full blur-3xl" />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center animate-fade-in-up">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="h-px w-8 bg-red-500" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-red-500">
                Blog
              </span>
              <span className="h-px w-8 bg-red-500" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-[0.95] tracking-tight mb-6">
              Guias y Consejos
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
                del Lago Atitlan
              </span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
              Todo lo que necesitas saber para planificar tu viaje perfecto al Lago de Atitlan.
              Guias, recomendaciones y secretos locales.
            </p>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="py-12 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {BLOG_POSTS.map((post, index) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className="group block glass-card rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={getCloudinaryUrl(post.image, { width: 600, height: 375 })}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1.5 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                      <span>{new Date(post.publishedAt).toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span>{post.readTime} lectura</span>
                    </div>

                    <h2 className="text-lg font-black text-gray-900 mb-2 group-hover:text-red-600 transition-colors leading-tight">
                      {post.title}
                    </h2>

                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="mt-4 flex items-center gap-1 text-red-500 font-bold text-sm group-hover:gap-2 transition-all">
                      Leer articulo
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 lg:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="relative glass-card rounded-[2.5rem] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(239,68,68,0.15),transparent_50%)]" />

              <div className="relative px-8 py-14 sm:px-14 sm:py-20 text-center">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-4">
                  Listo para tu aventura?
                </h2>
                <p className="text-white/70 max-w-xl mx-auto mb-8">
                  Deja de leer y empieza a vivir. Reserva tu tour en el Lago de Atitlan
                  y crea recuerdos inolvidables.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    to="/catalogo"
                    className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-red-50 transition-all duration-300 shadow-xl"
                  >
                    Ver experiencias
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <a
                    href="https://wa.me/50222681264"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-3 bg-green-500 text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-green-400 transition-all duration-300 shadow-xl shadow-green-500/30"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <GlassFooter />
    </div>
  );
};

export default BlogPage;
