import React from 'react';
import { Helmet } from 'react-helmet-async';
import {
  DEFAULT_OG_IMAGE,
  SITE_URL,
  getLocale,
  getKeywords,
  getAlternateUrls,
} from '../seo';
import { useLanguage } from '../contexts/LanguageContext';

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
  keywords,
  structuredData = [],
}: SeoProps) => {
  const { language } = useLanguage();
  const locale = getLocale(language);
  const resolvedKeywords = keywords ?? getKeywords(language);
  const canonicalUrl = `${SITE_URL}${canonicalPath === '/' ? '' : canonicalPath}`;
  const alternateUrls = getAlternateUrls(canonicalPath === '/' ? '' : canonicalPath);
  const ogLocale = language === 'en' ? 'en_US' : 'es_419';

  return (
    <Helmet>
      <html lang={locale} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={resolvedKeywords} />
      <meta name="robots" content="index,follow" />
      <meta name="geo.region" content="GT-SO" />
      <meta name="geo.placename" content="Panajachel, Solola, Guatemala" />
      <meta name="geo.position" content="14.7412;-91.1597" />
      <meta name="ICBM" content="14.7412, -91.1597" />
      <link rel="canonical" href={canonicalUrl} />
      {alternateUrls.map(({ hreflang, href }) => (
        <link key={hreflang} rel="alternate" hrefLang={hreflang} href={href} />
      ))}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Atitlan Experiences - Tours en Panajachel" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:locale" content={ogLocale} />
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
