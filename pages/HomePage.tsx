import React from 'react';
import Seo from '../components/Seo';
import { GlassNav, GlassFooter } from '../components/shared';
import {
  HeroSection,
  FeaturesSection,
  FeaturedTours,
  SocialProofGallery,
  CTASection,
} from '../components/home';
import {
  PAGE_META,
  buildOrganizationSchema,
  buildWebSiteSchema,
} from '../seo';

const InicioPage = () => {
  const meta = PAGE_META.home;

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title={meta.title}
        description={meta.description}
        canonicalPath={meta.path}
        structuredData={[buildOrganizationSchema(), buildWebSiteSchema()]}
      />
      <GlassNav />

      <main id="main-content">
        <HeroSection />
        <FeaturesSection />
        <FeaturedTours />
        <SocialProofGallery />
        <CTASection />
      </main>

      <GlassFooter />
    </div>
  );
};

export default InicioPage;
