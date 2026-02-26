import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { GlassNav, GlassFooter } from '../components/shared';
import {
  PAGE_META,
  buildOrganizationSchema,
  buildWebSiteSchema,
} from '../seo';
import { useLanguage } from '../contexts/LanguageContext';
import { L } from '../lib/localize';

const CONTACT_METHODS = [
  {
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
    title: 'WhatsApp',
    title_en: 'WhatsApp',
    descKey: 'contact.methodWhatsapp' as const,
    actionKey: 'contact.actionWhatsapp' as const,
    href: 'https://wa.me/50222681264',
    color: 'bg-green-500 hover:bg-green-400',
    shadowColor: 'shadow-green-500/30',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Email',
    title_en: 'Email',
    descKey: 'contact.methodEmail' as const,
    actionKey: 'contact.actionEmail' as const,
    href: 'mailto:hola@atitlanexperience.com',
    color: 'bg-gray-900 hover:bg-gray-800',
    shadowColor: 'shadow-gray-900/30',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    title: 'Teléfono',
    title_en: 'Phone',
    descKey: 'contact.methodPhone' as const,
    actionKey: 'contact.actionPhone' as const,
    href: 'tel:+50222681264',
    color: 'bg-red-500 hover:bg-red-400',
    shadowColor: 'shadow-red-500/30',
  },
];

const FAQ_ITEMS = [
  {
    question: '¿Cuánto tiempo de anticipación necesito para reservar?',
    question_en: 'How far in advance do I need to book?',
    answer: 'Recomendamos reservar con al menos 24-48 horas de anticipación para garantizar disponibilidad. Para tours privados y grupos grandes, sugerimos una semana de anticipación.',
    answer_en: 'We recommend booking at least 24-48 hours in advance to ensure availability. For private tours and large groups, we suggest one week in advance.',
  },
  {
    question: '¿Qué incluyen los precios mostrados?',
    question_en: 'What do the listed prices include?',
    answer: 'Los precios incluyen transporte en lancha, guía bilingüe, y los servicios especificados en cada experiencia. Los add-ons y extras se cotizan aparte.',
    answer_en: 'Prices include boat transportation, bilingual guide, and the services specified in each experience. Add-ons and extras are quoted separately.',
  },
  {
    question: '¿Puedo personalizar mi experiencia?',
    question_en: 'Can I customize my experience?',
    answer: '¡Absolutamente! Todos nuestros tours son personalizables. Contáctanos para diseñar una experiencia a tu medida.',
    answer_en: 'Absolutely! All our tours are customizable. Contact us to design an experience tailored to you.',
  },
  {
    question: '¿Qué métodos de pago aceptan?',
    question_en: 'What payment methods do you accept?',
    answer: 'Aceptamos efectivo (USD y GTQ), tarjetas de crédito/débito y transferencias bancarias.',
    answer_en: 'We accept cash (USD and GTQ), credit/debit cards, and bank transfers.',
  },
  {
    question: '¿Ofrecen servicio para grupos corporativos?',
    question_en: 'Do you offer corporate group services?',
    answer: 'Sí, diseñamos experiencias especiales para grupos corporativos, team buildings y eventos. Contáctanos para una cotización personalizada.',
    answer_en: 'Yes, we design special experiences for corporate groups, team buildings, and events. Contact us for a personalized quote.',
  },
];

const ContactoPage = () => {
  const { t, language } = useLanguage();
  const meta = PAGE_META.contacto;
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '', email: '', phone: '', tourInterest: 'Consulta general', travelDate: '', pax: 1, message: ''
  });
  const [contactStatus, setContactStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [contactError, setContactError] = useState('');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus('loading');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      if (!res.ok) throw new Error(language === 'en' ? 'Error sending' : 'Error al enviar');
      setContactStatus('success');
      setContactForm({ name: '', email: '', phone: '', tourInterest: 'Consulta general', travelDate: '', pax: 1, message: '' });
    } catch {
      setContactStatus('error');
      setContactError(language === 'en' ? 'There was an error sending your message. Please try again or contact us via WhatsApp.' : 'Hubo un error al enviar tu mensaje. Intenta de nuevo o contáctanos por WhatsApp.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title={meta.title}
        description={meta.description}
        canonicalPath={meta.path}
        structuredData={[buildOrganizationSchema(), buildWebSiteSchema()]}
      />
      <GlassNav />

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-gray-600">{t('contact.tag')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-[0.95] tracking-tight mb-6">
            {t('contact.title')}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
              {t('contact.titleAccent')}
            </span>
          </h1>
          <p className="text-lg text-gray-500">
            {t('contact.description')}
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {CONTACT_METHODS.map((method, index) => (
            <a
              key={method.title}
              href={method.href}
              target={method.href.startsWith('http') ? '_blank' : undefined}
              rel={method.href.startsWith('http') ? 'noreferrer' : undefined}
              className="group glass-card rounded-3xl p-6 sm:p-8 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-14 h-14 ${method.color} rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg ${method.shadowColor} group-hover:scale-110 transition-transform duration-300`}>
                {method.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{L(method, 'title', language)}</h3>
              <p className="text-sm text-gray-500 mb-4">{t(method.descKey)}</p>
              <span className="inline-flex items-center gap-2 text-sm font-bold text-red-600 group-hover:text-red-500 transition-colors">
                {t(method.actionKey)}
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </a>
          ))}
        </div>

        {/* Contact Form */}
        <section className="mb-20 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.3em] text-red-500 mb-4">
              {t('contact.formTitle')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
              {t('contact.formTitle')}
            </h2>
          </div>
          <div className="max-w-3xl mx-auto glass-card rounded-3xl p-6 sm:p-8">
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-semibold text-gray-700 mb-2">{t('contact.fieldName')}</label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder={t('contact.placeholderName')}
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-semibold text-gray-700 mb-2">{t('contact.fieldEmail')}</label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contact-phone" className="block text-sm font-semibold text-gray-700 mb-2">{language === 'en' ? 'Phone' : 'Teléfono'}</label>
                  <input
                    id="contact-phone"
                    type="tel"
                    required
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="+502 1234 5678"
                  />
                </div>
                <div>
                  <label htmlFor="contact-tour" className="block text-sm font-semibold text-gray-700 mb-2">{t('contact.fieldInterest')}</label>
                  <select
                    id="contact-tour"
                    required
                    value={contactForm.tourInterest}
                    onChange={(e) => setContactForm({ ...contactForm, tourInterest: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="Consulta general">{language === 'en' ? 'General inquiry' : 'Consulta general'}</option>
                    <option value="Atitlán Signature">Atitlán Signature</option>
                    <option value="Día Privado en el Lago">{language === 'en' ? 'Private Lake Day' : 'Día Privado en el Lago'}</option>
                    <option value="Crucero al Atardecer">{language === 'en' ? 'Sunset Cruise' : 'Crucero al Atardecer'}</option>
                    <option value="Amanecer en el Lago">{language === 'en' ? 'Sunrise on the Lake' : 'Amanecer en el Lago'}</option>
                    <option value="Escapada Bienestar">{language === 'en' ? 'Wellness Getaway' : 'Escapada Bienestar'}</option>
                    <option value="Ruta Artesanal">{language === 'en' ? 'Artisan Route' : 'Ruta Artesanal'}</option>
                    <option value="Santiago Cultural">{language === 'en' ? 'Santiago Cultural' : 'Santiago Cultural'}</option>
                    <option value="Laboratorio de Café">{language === 'en' ? 'Coffee Lab' : 'Laboratorio de Café'}</option>
                    <option value="Café y Lago Combo">{language === 'en' ? 'Coffee & Lake Combo' : 'Café y Lago Combo'}</option>
                    <option value="Día de Campo Esencial">{language === 'en' ? 'Essential Picnic Day' : 'Día de Campo Esencial'}</option>
                    <option value="Día de Campo Premium">{language === 'en' ? 'Premium Picnic Day' : 'Día de Campo Premium'}</option>
                    <option value="Canasta Celebración">{language === 'en' ? 'Celebration Basket' : 'Canasta Celebración'}</option>
                  </select>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contact-date" className="block text-sm font-semibold text-gray-700 mb-2">{language === 'en' ? 'Travel Date' : 'Fecha de viaje'}</label>
                  <input
                    id="contact-date"
                    type="date"
                    required
                    value={contactForm.travelDate}
                    onChange={(e) => setContactForm({ ...contactForm, travelDate: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="contact-pax" className="block text-sm font-semibold text-gray-700 mb-2">{language === 'en' ? 'Number of people' : 'Número de personas'}</label>
                  <input
                    id="contact-pax"
                    type="number"
                    required
                    min={1}
                    value={contactForm.pax}
                    onChange={(e) => setContactForm({ ...contactForm, pax: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-sm font-semibold text-gray-700 mb-2">{t('contact.fieldMessage')}</label>
                <textarea
                  id="contact-message"
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  placeholder={t('contact.placeholderMessage')}
                />
              </div>
              {contactStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-800 text-sm font-medium">
                  {language === 'en' ? 'Message sent successfully! We will get back to you as soon as possible.' : '¡Mensaje enviado con éxito! Te responderemos lo antes posible.'}
                </div>
              )}
              {contactStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-800 text-sm font-medium">
                  {contactError}
                </div>
              )}
              <button
                type="submit"
                disabled={contactStatus === 'loading'}
                className="w-full bg-red-600 text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-red-500 transition-all duration-300 shadow-xl shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {contactStatus === 'loading' ? (language === 'en' ? 'Sending...' : 'Enviando...') : t('contact.submit')}
              </button>
            </form>
          </div>
        </section>

        {/* Info Cards */}
        <div className="grid lg:grid-cols-2 gap-8 mb-20">
          {/* Location Card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{t('contact.locationTitle')}</h3>
                <p className="text-gray-500">{t('contact.locationDesc')}</p>
              </div>
            </div>
            <div className="space-y-4 pl-16">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-gray-700 font-medium">Panajachel, Sololá</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-gray-700 font-medium">San Juan La Laguna</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-gray-700 font-medium">Santiago Atitlán</span>
              </div>
            </div>
          </div>

          {/* Hours Card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{t('contact.hoursTitle')}</h3>
                <p className="text-gray-500">{t('contact.hoursDesc')}</p>
              </div>
            </div>
            <div className="space-y-4 pl-16">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{language === 'en' ? 'Monday - Friday' : 'Lunes - Viernes'}</span>
                <span className="text-gray-900 font-bold">8:00 AM - 8:00 PM</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">{language === 'en' ? 'Saturday - Sunday' : 'Sábado - Domingo'}</span>
                <span className="text-gray-900 font-bold">8:00 AM - 6:00 PM</span>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400">{language === 'en' ? '* Tours may start earlier depending on the experience' : '* Tours pueden comenzar más temprano según la experiencia'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mb-20">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.3em] text-red-500 mb-4">
              {t('contact.faqTag')}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
              {t('contact.faqTitle')}
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <div
                key={index}
                className="glass-card rounded-2xl overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  aria-expanded={openFaq === index}
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-left"
                >
                  <span className="text-base font-bold text-gray-900 pr-4">{L(item, 'question', language)}</span>
                  <span className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 transition-transform duration-300 ${openFaq === index ? 'rotate-180 bg-red-100' : ''}`}>
                    <svg className={`w-4 h-4 ${openFaq === index ? 'text-red-600' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-48' : 'max-h-0'}`}>
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                    <p className="text-gray-500 leading-relaxed">{L(item, 'answer', language)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="glass-card rounded-[2.5rem] p-8 sm:p-12 lg:p-16 text-center bg-gradient-to-br from-red-50 to-orange-50 animate-fade-in-up">
          <div className="max-w-2xl mx-auto">
            <div className="w-20 h-20 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white shadow-xl shadow-red-500/30">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4">
              {t('contact.ctaTitle')}
            </h3>
            <p className="text-gray-500 mb-8">
              {t('contact.ctaDesc')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href={language === 'en' ? 'https://wa.me/50222681264?text=Hello! I need help finding the perfect experience in Atitlán.' : 'https://wa.me/50222681264?text=¡Hola! Necesito ayuda para encontrar la experiencia perfecta en Atitlán.'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 bg-green-500 text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-green-400 transition-all duration-300 shadow-xl shadow-green-500/30"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>{t('contact.ctaButton')}</span>
              </a>
              <Link
                to="/catalogo"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider bg-white text-gray-900 hover:bg-gray-50 transition-all duration-300 shadow-lg"
              >
                {t('nav.catalog')}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <GlassFooter />
    </div>
  );
};

export default ContactoPage;
