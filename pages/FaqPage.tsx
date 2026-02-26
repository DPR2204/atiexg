import React, { useState } from 'react';
import Seo from '../components/Seo';
import { GlassNav, GlassFooter } from '../components/shared';
import { SITE_URL } from '../seo';
import { useLanguage } from '../contexts/LanguageContext';
import { L } from '../lib/localize';

interface FaqItem {
  question: string;
  question_en: string;
  answer: string;
  answer_en: string;
}

interface FaqCategory {
  title: string;
  title_en: string;
  icon: React.ReactNode;
  items: FaqItem[];
}

const FAQ_CATEGORIES: FaqCategory[] = [
  {
    title: 'Reservas y Pagos',
    title_en: 'Reservations & Payments',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    items: [
      {
        question: 'Como puedo reservar un tour con Atitlan Experiences?',
        question_en: 'How can I book a tour with Atitlan Experiences?',
        answer:
          'Puedes reservar directamente por WhatsApp al +502 2268 1264, a traves de nuestro formulario de contacto en la web, o pagando un anticipo de $50 USD en linea. Nuestro equipo te confirmara disponibilidad y detalles en menos de 2 horas.',
        answer_en:
          'You can book directly via WhatsApp at +502 2268 1264, through our website contact form, or by paying a $50 USD deposit online. Our team will confirm availability and details within 2 hours.',
      },
      {
        question: 'Que metodos de pago aceptan?',
        question_en: 'What payment methods do you accept?',
        answer:
          'Aceptamos efectivo (dolares o quetzales), tarjetas de credito y debito (Visa, Mastercard, American Express) a traves de nuestra pasarela segura Recurrente, y transferencias bancarias locales. El pago completo puede realizarse el dia del tour o anticipadamente en linea.',
        answer_en:
          'We accept cash (dollars or quetzales), credit and debit cards (Visa, Mastercard, American Express) through our secure payment gateway Recurrente, and local bank transfers. Full payment can be made on the day of the tour or in advance online.',
      },
      {
        question: 'Necesito pagar un deposito para reservar?',
        question_en: 'Do I need to pay a deposit to book?',
        answer:
          'Para garantizar tu reserva, recomendamos un anticipo de $50 USD que se descuenta del precio total del tour. Sin embargo, tambien puedes reservar por WhatsApp sin anticipo sujeto a disponibilidad. En temporada alta (noviembre-enero, Semana Santa), el anticipo es altamente recomendado.',
        answer_en:
          'To guarantee your reservation, we recommend a $50 USD deposit which is deducted from the total tour price. However, you can also book via WhatsApp without a deposit, subject to availability. During peak season (November-January, Easter), the deposit is highly recommended.',
      },
      {
        question: 'Puedo cancelar o cambiar la fecha de mi reserva?',
        question_en: 'Can I cancel or change the date of my reservation?',
        answer:
          'Si, ofrecemos cancelacion gratuita con mas de 48 horas de anticipacion. Entre 24 y 48 horas antes, reembolsamos el 50%. Con menos de 24 horas no hay reembolso. Cambios de fecha estan sujetos a disponibilidad y se pueden hacer sin costo con 48+ horas de anticipacion.',
        answer_en:
          'Yes, we offer free cancellation with more than 48 hours notice. Between 24 and 48 hours before, we refund 50%. With less than 24 hours notice, no refund is available. Date changes are subject to availability and can be made at no cost with 48+ hours notice.',
      },
      {
        question: 'Los precios incluyen impuestos?',
        question_en: 'Are taxes included in the prices?',
        answer:
          'Si, todos nuestros precios publicados incluyen impuestos. No hay cargos ocultos ni sorpresas. Las propinas para capitanes y guias son opcionales pero apreciadas.',
        answer_en:
          'Yes, all our listed prices include taxes. There are no hidden charges or surprises. Tips for captains and guides are optional but appreciated.',
      },
      {
        question: 'Ofrecen descuentos para grupos grandes?',
        question_en: 'Do you offer discounts for large groups?',
        answer:
          'Si, ofrecemos tarifas especiales para grupos de 8 o mas personas. Contactanos por WhatsApp para recibir una cotizacion personalizada segun el tamano de tu grupo y las actividades de interes.',
        answer_en:
          'Yes, we offer special rates for groups of 8 or more. Contact us on WhatsApp to receive a personalized quote based on your group size and activities of interest.',
      },
    ],
  },
  {
    title: 'Logistica y Transporte',
    title_en: 'Logistics & Transportation',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    items: [
      {
        question: 'Donde es el punto de encuentro para los tours?',
        question_en: 'Where is the meeting point for the tours?',
        answer:
          'La mayoria de nuestros tours parten del muelle principal de Panajachel (Embarcadero Tzanjuyu). Te enviaremos la ubicacion exacta por WhatsApp con un pin de Google Maps al confirmar tu reserva. Si te hospedas en Panajachel, podemos coordinar recogida en tu hotel.',
        answer_en:
          'Most of our tours depart from the main dock in Panajachel (Embarcadero Tzanjuyu). We will send you the exact location via WhatsApp with a Google Maps pin when confirming your reservation. If you are staying in Panajachel, we can arrange hotel pickup.',
      },
      {
        question: 'Las lanchas son seguras?',
        question_en: 'Are the boats safe?',
        answer:
          'Absolutamente. Trabajamos exclusivamente con capitanes certificados con 15+ anos de experiencia en el lago. Todas nuestras lanchas cuentan con chalecos salvavidas para todos los pasajeros, equipo de seguridad completo y mantenimiento regular. La seguridad es nuestra prioridad numero uno.',
        answer_en:
          'Absolutely. We work exclusively with certified captains with 15+ years of experience on the lake. All our boats are equipped with life jackets for all passengers, full safety equipment, and undergo regular maintenance. Safety is our number one priority.',
      },
      {
        question: 'Ofrecen transporte desde Antigua Guatemala o Ciudad de Guatemala?',
        question_en: 'Do you offer transportation from Antigua Guatemala or Guatemala City?',
        answer:
          'Si, coordinamos servicio de transporte privado o shuttle desde Antigua Guatemala (2.5 horas) y Ciudad de Guatemala (3 horas). El costo es adicional al tour. Contactanos para cotizar segun tu ubicacion y numero de pasajeros.',
        answer_en:
          'Yes, we coordinate private transportation or shuttle service from Antigua Guatemala (2.5 hours) and Guatemala City (3 hours). The cost is in addition to the tour. Contact us for a quote based on your location and number of passengers.',
      },
      {
        question: 'Cuanto tiempo dura el viaje en lancha entre pueblos?',
        question_en: 'How long is the boat ride between villages?',
        answer:
          'Los tiempos aproximados desde Panajachel son: Santa Catarina Palopo (10 min), San Antonio Palopo (15 min), San Pedro La Laguna (20-25 min), San Juan La Laguna (25-30 min), Santiago Atitlan (30-35 min). Los tiempos pueden variar segun condiciones del lago.',
        answer_en:
          'Approximate travel times from Panajachel are: Santa Catarina Palopo (10 min), San Antonio Palopo (15 min), San Pedro La Laguna (20-25 min), San Juan La Laguna (25-30 min), Santiago Atitlan (30-35 min). Times may vary depending on lake conditions.',
      },
      {
        question: 'Que pasa si el lago esta muy agitado para navegar?',
        question_en: 'What happens if the lake is too rough to navigate?',
        answer:
          'La seguridad es lo primero. Si las condiciones del lago no permiten navegar de forma segura (generalmente por el viento Xocomil en las tardes), reprogramamos el tour sin costo adicional o ajustamos el itinerario. Te mantenemos informado por WhatsApp en todo momento.',
        answer_en:
          'Safety comes first. If lake conditions do not allow safe navigation (usually due to the Xocomil wind in the afternoons), we reschedule the tour at no additional cost or adjust the itinerary. We keep you informed via WhatsApp at all times.',
      },
    ],
  },
  {
    title: 'Experiencias',
    title_en: 'Experiences',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    items: [
      {
        question: 'Que incluyen los tours?',
        question_en: 'What do the tours include?',
        answer:
          'Cada tour especifica lo que incluye en su pagina de detalle. En general, los tours en lancha incluyen: capitan certificado, lancha privada, chalecos salvavidas, cooler con agua y bebidas, y guia local en los pueblos. Algunos tours premium incluyen almuerzo, degustaciones y actividades adicionales.',
        answer_en:
          'Each tour specifies what is included on its detail page. In general, boat tours include: certified captain, private boat, life jackets, cooler with water and beverages, and a local guide in the villages. Some premium tours include lunch, tastings, and additional activities.',
      },
      {
        question: 'Cuanto duran los tours?',
        question_en: 'How long do the tours last?',
        answer:
          'La duracion varia segun la experiencia. Los tours de atardecer duran aproximadamente 2 horas, los recorridos de pueblos entre 4-6 horas, y las experiencias de dia completo hasta 8 horas. Cada tour tiene su duracion indicada en el catalogo.',
        answer_en:
          'Duration varies depending on the experience. Sunset tours last approximately 2 hours, village tours between 4-6 hours, and full-day experiences up to 8 hours. Each tour has its duration listed in the catalog.',
      },
      {
        question: 'Los tours son en espanol o ingles?',
        question_en: 'Are the tours in Spanish or English?',
        answer:
          'Nuestro equipo es bilingue. Los tours se realizan en espanol e ingles segun la preferencia del grupo. Si necesitas otro idioma, contactanos con anticipacion y haremos lo posible por coordinar un guia adecuado.',
        answer_en:
          'Our team is bilingual. Tours are conducted in Spanish and English according to the group\'s preference. If you need another language, contact us in advance and we will do our best to arrange a suitable guide.',
      },
      {
        question: 'Puedo personalizar un tour?',
        question_en: 'Can I customize a tour?',
        answer:
          'Por supuesto. Uno de nuestros diferenciadores es la flexibilidad total. Podemos ajustar itinerarios, horarios, actividades y menus segun tus preferencias. Escribenos por WhatsApp con tus ideas y disenaremos una experiencia a tu medida.',
        answer_en:
          'Absolutely. One of our key differentiators is total flexibility. We can adjust itineraries, schedules, activities, and menus according to your preferences. Write to us on WhatsApp with your ideas and we will design a tailor-made experience.',
      },
      {
        question: 'Los tours son aptos para ninos y personas mayores?',
        question_en: 'Are the tours suitable for children and elderly people?',
        answer:
          'La mayoria de nuestros tours son aptos para todas las edades. Los paseos en lancha son seguros para ninos (con chaleco salvavidas) y adultos mayores. Para actividades como el ascenso al Volcan San Pedro o kayak, se recomienda una condicion fisica moderada. Indicamos el nivel de exigencia en cada tour.',
        answer_en:
          'Most of our tours are suitable for all ages. Boat rides are safe for children (with life jackets) and elderly adults. For activities such as climbing Volcan San Pedro or kayaking, moderate physical fitness is recommended. We indicate the difficulty level for each tour.',
      },
    ],
  },
  {
    title: 'Sobre Nosotros',
    title_en: 'About Us',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    items: [
      {
        question: 'Quien esta detras de Atitlan Experiences?',
        question_en: 'Who is behind Atitlan Experiences?',
        answer:
          'Somos un equipo local con mas de 5 anos de experiencia operando tours en el Lago de Atitlan. Nuestro equipo incluye guias locales, capitanes certificados y un equipo de atencion al cliente bilingue. Tambien somos parte de la red de AtitlanRestaurantes.com, lo que nos permite ofrecer experiencias gastronomicas unicas.',
        answer_en:
          'We are a local team with over 5 years of experience operating tours on Lake Atitlan. Our team includes local guides, certified captains, and a bilingual customer service team. We are also part of the AtitlanRestaurantes.com network, which allows us to offer unique gastronomic experiences.',
      },
      {
        question: 'Como garantizan la seguridad en sus tours?',
        question_en: 'How do you ensure safety on your tours?',
        answer:
          'La seguridad es nuestra prioridad absoluta. Todos nuestros capitanes estan certificados y tienen 15+ anos de experiencia navegando el lago. Las lanchas pasan revision mecanica regular, todos los pasajeros usan chaleco salvavidas, y monitoreamos las condiciones del lago constantemente. Ademas, contamos con seguro de responsabilidad civil.',
        answer_en:
          'Safety is our absolute priority. All our captains are certified and have 15+ years of experience navigating the lake. Boats undergo regular mechanical inspections, all passengers wear life jackets, and we constantly monitor lake conditions. Additionally, we carry liability insurance.',
      },
      {
        question: 'Trabajan con turismo responsable?',
        question_en: 'Do you practice responsible tourism?',
        answer:
          'Si, el turismo responsable es parte fundamental de nuestra filosofia. Priorizamos aliados locales que cuidan la comunidad y el medio ambiente. Apoyamos cooperativas de artesanos, utilizamos productos locales y promovemos practicas que beneficien directamente a las comunidades del lago. No visitamos sitios que exploten la cultura local.',
        answer_en:
          'Yes, responsible tourism is a fundamental part of our philosophy. We prioritize local partners who care for the community and the environment. We support artisan cooperatives, use local products, and promote practices that directly benefit the lake\'s communities. We do not visit sites that exploit local culture.',
      },
    ],
  },
];

// Flatten all FAQ items for structured data
const allFaqItems = FAQ_CATEGORIES.flatMap((cat) => cat.items);

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: allFaqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

const FaqPage = () => {
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const { t, language } = useLanguage();

  const toggleItem = (key: string) => {
    setOpenIndex((prev) => (prev === key ? null : key));
  };

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title="Preguntas Frecuentes | Tours en Lago Atitlan | Atitlan Experiences"
        description="Resolvemos tus dudas sobre tours en el Lago de Atitlan: reservas, pagos, transporte, cancellaciones, que incluyen los tours y mas. Contactanos por WhatsApp."
        canonicalPath="/faq"
        structuredData={[faqSchema]}
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
                {t('faq.tag')}
              </span>
              <span className="h-px w-8 bg-red-500" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-[0.95] tracking-tight mb-6">
              {t('faq.title')}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
                {t('faq.titleAccent')}
              </span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
              {t('faq.heroDesc')}
            </p>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-12 lg:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
            {FAQ_CATEGORIES.map((category) => (
              <div key={category.title} className="animate-fade-in-up">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-500/25">
                    {category.icon}
                  </div>
                  <h2 className="text-2xl font-black text-gray-900">{L(category, 'title', language)}</h2>
                </div>

                <div className="space-y-3">
                  {category.items.map((item) => {
                    const key = `${category.title}-${item.question}`;
                    const isOpen = openIndex === key;

                    return (
                      <div
                        key={key}
                        className="glass-card rounded-2xl overflow-hidden transition-all duration-300"
                      >
                        <button
                          type="button"
                          onClick={() => toggleItem(key)}
                          className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-white/80 transition-colors"
                          aria-expanded={isOpen}
                        >
                          <span className="text-gray-900 font-bold text-sm sm:text-base">
                            {L(item, 'question', language)}
                          </span>
                          <svg
                            className={`w-5 h-5 text-red-500 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        {isOpen && (
                          <div className="px-5 pb-5 animate-fade-in">
                            <div className="border-t border-gray-100 pt-4">
                              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                                {L(item, 'answer', language)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
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
                  {t('faq.ctaTitle')}
                </h2>
                <p className="text-white/70 max-w-xl mx-auto mb-8">
                  {t('faq.ctaDesc')}
                </p>
                <a
                  href="https://wa.me/50222681264?text=%C2%A1Hola!%20Tengo%20una%20pregunta%20sobre%20los%20tours."
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-3 bg-green-500 text-white px-8 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider hover:bg-green-400 transition-all duration-300 shadow-xl shadow-green-500/30"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {t('faq.ctaButton')}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <GlassFooter />
    </div>
  );
};

export default FaqPage;
