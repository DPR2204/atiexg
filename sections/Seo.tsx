import React from 'react';
import { Helmet } from 'react-helmet-async';
import { DEFAULT_OG_IMAGE, DEFAULT_KEYWORDS, LOCALE, SITE_URL } from '../seo';

type SeoProps = {
  title: string;
  description: string;
  canonicalPath: string;
  ogImage?: string;
  keywords?: string;
  structuredData?: Record<string, unknown>[];
};

const Seo = ({
  title,
  description,
  canonicalPath,
  ogImage = DEFAULT_OG_IMAGE,
  keywords = DEFAULT_KEYWORDS,
  structuredData = [],
}: SeoProps) => {
  const canonicalUrl = `${SITE_URL}${canonicalPath === '/' ? '' : canonicalPath}`;
  return (
    <Helmet>
      <html lang="es-419" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index,follow" />
      <meta name="geo.region" content="GT-SO" />
      <meta name="geo.placename" content="Panajachel, Sololá, Guatemala" />
      <meta name="geo.position" content="14.7412;-91.1597" />
      <meta name="ICBM" content="14.7412, -91.1597" />
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang={LOCALE} href={canonicalUrl} />
      <link rel="alternate" hrefLang="es" href={canonicalUrl} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Atitlán Experiences - Tours en Panajachel" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:locale" content="es_419" />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={title} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {structuredData.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default Seo;
