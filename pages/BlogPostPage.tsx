import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import { GlassNav, GlassFooter } from '../components/shared';
import { getCloudinaryUrl } from '../src/utils/cloudinary';
import { BLOG_POSTS, getBlogPostBySlug } from '../data/blog-posts';
import { SITE_URL } from '../seo';
import { useLanguage } from '../contexts/LanguageContext';
import { L } from '../lib/localize';

const BlogPostPage = () => {
  const { slug } = useParams();
  const post = getBlogPostBySlug(slug);
  const { t, language } = useLanguage();

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <GlassNav />
        <main className="max-w-5xl mx-auto px-4 py-16 animate-fade-in-up">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-gray-900 mb-4">{language === 'en' ? 'Article not found' : 'Articulo no encontrado'}</h2>
            <p className="text-gray-500 text-sm sm:text-base font-medium mb-8 max-w-md mx-auto">
              {language === 'en' ? 'The article you are looking for is not available. Explore our blog for more content.' : 'El articulo que buscas no esta disponible. Explora nuestro blog para mas contenido.'}
            </p>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-red-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {language === 'en' ? 'Back to blog' : 'Volver al blog'}
            </Link>
          </div>
        </main>
        <GlassFooter />
      </div>
    );
  }

  const otherPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    image: getCloudinaryUrl(post.image, { width: 1200, height: 630 }),
    url: `${SITE_URL}/blog/${post.slug}`,
    author: {
      '@type': 'Organization',
      name: 'Atitlan Experiences',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Atitlan Experiences',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: 'https://static.wixstatic.com/media/acc6a6_923203f0b02b49afadd0f156f6363de3~mv2.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/blog/${post.slug}`,
    },
  };

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title={`${L(post, 'title', language)} | Blog Atitlan Experiences`}
        description={L(post, 'excerpt', language)}
        canonicalPath={`/blog/${post.slug}`}
        ogImage={getCloudinaryUrl(post.image, { width: 1200, height: 630 })}
        structuredData={[articleSchema]}
        keywords={`${post.title.toLowerCase()}, lago Atitlan, Panajachel tours, que hacer en Guatemala`}
      />
      <GlassNav />

      <main id="main-content">
        {/* Hero */}
        <section className="relative h-[50vh] sm:h-[60vh] min-h-[350px] overflow-hidden">
          <img
            src={getCloudinaryUrl(post.image, { width: 1600, height: 900 })}
            alt={L(post, 'title', language)}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 lg:p-16">
            <div className="max-w-4xl mx-auto animate-fade-in-up">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-white/70 mb-4">
                <Link to="/" className="hover:text-white transition-colors">{t('destination.breadcrumbHome')}</Link>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                <Link to="/blog" className="hover:text-white transition-colors">{t('blog.tag')}</Link>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-white font-medium truncate">{L(post, 'title', language)}</span>
              </nav>

              {/* Category & Meta */}
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1.5 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                  {L(post, 'category', language)}
                </span>
                <span className="text-white/70 text-sm">
                  {new Date(post.publishedAt).toLocaleDateString(language === 'en' ? 'en-US' : 'es-GT', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className="text-white/50 text-sm">|</span>
                <span className="text-white/70 text-sm">{post.readTime} {t('blog.reading')}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[0.95] tracking-tight">
                {L(post, 'title', language)}
              </h1>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-[1fr_320px] gap-12 lg:gap-16">
              {/* Article */}
              <article className="animate-fade-in-up">
                <div
                  className="prose prose-lg max-w-none
                    prose-headings:font-black prose-headings:text-gray-900
                    prose-p:text-gray-600 prose-p:leading-relaxed
                    prose-strong:text-gray-900
                    prose-ul:text-gray-600
                    prose-li:text-gray-600
                    prose-a:text-red-500 prose-a:font-bold prose-a:no-underline hover:prose-a:text-red-600"
                  dangerouslySetInnerHTML={{ __html: L(post, 'content', language) }}
                />

                {/* Share / Back */}
                <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
                  <Link
                    to="/blog"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-red-500 font-bold text-sm transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    {language === 'en' ? 'Back to blog' : 'Volver al blog'}
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>{language === 'en' ? 'Share:' : 'Compartir:'}</span>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`${L(post, 'title', language)} - ${SITE_URL}/blog/${post.slug}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600 hover:bg-green-100 transition-colors"
                      aria-label={language === 'en' ? 'Share on WhatsApp' : 'Compartir por WhatsApp'}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </article>

              {/* Sidebar */}
              <aside className="space-y-8">
                {/* CTA Card */}
                <div className="glass-card rounded-3xl p-6 sticky top-24 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-red-500/25">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-black text-gray-900 mb-2">
                    {language === 'en' ? 'Book your experience' : 'Reserva tu experiencia'}
                  </h3>
                  <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                    {language === 'en'
                      ? 'Stop planning and start living. Our team will help you design your perfect tour at Lake Atitlan.'
                      : 'Deja de planificar y empieza a vivir. Nuestro equipo te ayuda a disenar tu tour perfecto en el Lago de Atitlan.'}
                  </p>
                  <a
                    href="https://wa.me/50222681264"
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full text-center bg-green-500 text-white py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-green-400 transition-all shadow-lg shadow-green-500/30"
                  >
                    WhatsApp
                  </a>
                  <Link
                    to="/catalogo"
                    className="block w-full text-center mt-3 py-3 rounded-xl font-bold text-sm uppercase tracking-wider glass-card hover:bg-white/80 transition-all text-gray-900"
                  >
                    {language === 'en' ? 'View catalog' : 'Ver catalogo'}
                  </Link>
                </div>

                {/* Other Posts */}
                {otherPosts.length > 0 && (
                  <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-4">
                      {language === 'en' ? 'More articles' : 'Mas articulos'}
                    </h3>
                    <div className="space-y-4">
                      {otherPosts.map((otherPost) => (
                        <Link
                          key={otherPost.slug}
                          to={`/blog/${otherPost.slug}`}
                          className="group flex gap-4 items-start"
                        >
                          <div className="w-20 h-14 rounded-xl overflow-hidden shrink-0">
                            <img
                              src={getCloudinaryUrl(otherPost.image, { width: 160, height: 112 })}
                              alt={L(otherPost, 'title', language)}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors leading-tight line-clamp-2">
                              {L(otherPost, 'title', language)}
                            </h4>
                            <p className="text-xs text-gray-400 mt-1">{otherPost.readTime} {t('blog.reading')}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </section>
      </main>

      <GlassFooter />
    </div>
  );
};

export default BlogPostPage;
