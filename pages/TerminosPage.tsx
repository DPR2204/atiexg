import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { GlassNav, GlassFooter } from '../components/shared';
import { useLanguage } from '../contexts/LanguageContext';
import { L } from '../lib/localize';

const SECTIONS = [
  {
    id: 'descripcion',
    title: '1. Descripcion del Servicio',
    title_en: '1. Service Description',
    content: `Atitlan Experiences es un operador de tours y experiencias turisticas con sede en Panajachel, Solola, Guatemala. Ofrecemos tours en lancha privada, excursiones culturales a pueblos del Lago de Atitlan, actividades de aventura, experiencias gastronomicas y servicios de logistica turistica.

Nuestros servicios se describen detalladamente en cada pagina de experiencia dentro de nuestro sitio web. Las descripciones, imagenes y precios publicados son de caracter informativo y pueden estar sujetos a cambios sin previo aviso, aunque siempre te notificaremos antes de confirmar tu reserva.`,
    content_en: `Atitlan Experiences is a tour and tourist experience operator based in Panajachel, Solola, Guatemala. We offer private boat tours, cultural excursions to Lake Atitlan villages, adventure activities, gastronomic experiences, and tourist logistics services.

Our services are described in detail on each experience page within our website. Published descriptions, images, and prices are informational in nature and may be subject to change without prior notice, although we will always notify you before confirming your reservation.`,
  },
  {
    id: 'reservas',
    title: '2. Reservas y Pagos',
    title_en: '2. Reservations and Payments',
    content: `Al realizar una reserva con Atitlan Experiences, el cliente acepta estos terminos y condiciones en su totalidad.

Las reservas pueden realizarse a traves de WhatsApp, correo electronico o el formulario de contacto en nuestra web. La reserva se considera confirmada una vez que recibas una confirmacion por escrito (WhatsApp o email) de nuestro equipo.

El anticipo de $50 USD asegura tu lugar y se descuenta del precio total. El saldo restante puede pagarse el dia del tour en efectivo (dolares o quetzales) o con tarjeta.

Los precios publicados estan en dolares estadounidenses (USD) e incluyen impuestos. No hay cargos adicionales ocultos. Las propinas para capitanes y guias son opcionales.

Los pagos con tarjeta se procesan a traves de Recurrente, una pasarela de pago certificada. No almacenamos datos de tarjetas de credito en nuestros servidores.`,
    content_en: `By making a reservation with Atitlan Experiences, the client accepts these terms and conditions in their entirety.

Reservations can be made via WhatsApp, email, or the contact form on our website. The reservation is considered confirmed once you receive a written confirmation (WhatsApp or email) from our team.

The $50 USD deposit secures your spot and is deducted from the total price. The remaining balance can be paid on the day of the tour in cash (dollars or quetzales) or by card.

Published prices are in US dollars (USD) and include taxes. There are no hidden additional charges. Tips for captains and guides are optional.

Card payments are processed through Recurrente, a certified payment gateway. We do not store credit card data on our servers.`,
  },
  {
    id: 'cancelaciones',
    title: '3. Cancelaciones y Reembolsos',
    title_en: '3. Cancellations and Refunds',
    content: `Nuestra politica de cancelacion es la siguiente:

- Cancelacion con mas de 48 horas de anticipacion: reembolso completo del 100%.
- Cancelacion entre 24 y 48 horas antes: reembolso del 50% o reprogramacion sin costo.
- Cancelacion con menos de 24 horas: sin reembolso, ya que los recursos han sido asignados.

Los cambios de fecha estan sujetos a disponibilidad y pueden solicitarse sin costo con mas de 48 horas de anticipacion.

Para mas detalles, consulta nuestra Politica de Cancelacion completa.`,
    content_en: `Our cancellation policy is as follows:

- Cancellation with more than 48 hours notice: full 100% refund.
- Cancellation between 24 and 48 hours before: 50% refund or free rescheduling.
- Cancellation with less than 24 hours notice: no refund, as resources have already been assigned.

Date changes are subject to availability and can be requested at no cost with more than 48 hours notice.

For more details, please consult our full Cancellation Policy.`,
  },
  {
    id: 'responsabilidades-cliente',
    title: '4. Responsabilidades del Cliente',
    title_en: '4. Client Responsibilities',
    content: `El cliente se compromete a:

- Presentarse en el punto de encuentro a la hora acordada. Toleramos un maximo de 15 minutos de espera.
- Informar sobre condiciones medicas, alergias alimentarias o necesidades especiales al momento de reservar.
- Seguir las instrucciones del capitan y los guias durante el tour, especialmente en materia de seguridad.
- Usar chaleco salvavidas en todo momento durante los traslados en lancha.
- Comportarse de manera respetuosa con las comunidades locales, sus tradiciones y el medio ambiente.
- No llevar sustancias ilegales ni presentarse bajo los efectos de alcohol o drogas a los tours.

Atitlan Experiences se reserva el derecho de suspender o cancelar un tour sin reembolso si el comportamiento de un cliente pone en riesgo su seguridad, la de otros pasajeros, la tripulacion o las comunidades visitadas.`,
    content_en: `The client agrees to:

- Arrive at the meeting point at the agreed time. We allow a maximum of 15 minutes of waiting time.
- Inform about medical conditions, food allergies, or special needs at the time of booking.
- Follow the instructions of the captain and guides during the tour, especially regarding safety.
- Wear a life jacket at all times during boat transfers.
- Behave respectfully toward local communities, their traditions, and the environment.
- Not carry illegal substances or show up under the influence of alcohol or drugs for tours.

Atitlan Experiences reserves the right to suspend or cancel a tour without a refund if a client's behavior puts their safety, the safety of other passengers, the crew, or the visited communities at risk.`,
  },
  {
    id: 'responsabilidades-empresa',
    title: '5. Responsabilidades de Atitlan Experiences',
    title_en: '5. Responsibilities of Atitlan Experiences',
    content: `Nos comprometemos a:

- Operar todos los tours con capitanes certificados y embarcaciones en condiciones optimas.
- Proporcionar chalecos salvavidas y equipo de seguridad para todos los pasajeros.
- Cumplir con el itinerario acordado, salvo que condiciones climaticas o de seguridad no lo permitan.
- Brindar atencion al cliente bilingue (espanol e ingles) antes, durante y despues del tour.
- Mantener canales de comunicacion abiertos y responder en un plazo maximo de 2 horas en horario de atencion.
- Proteger los datos personales de nuestros clientes conforme a nuestra Politica de Privacidad.`,
    content_en: `We are committed to:

- Operating all tours with certified captains and boats in optimal conditions.
- Providing life jackets and safety equipment for all passengers.
- Following the agreed itinerary, unless weather or safety conditions do not permit it.
- Providing bilingual customer service (Spanish and English) before, during, and after the tour.
- Maintaining open communication channels and responding within a maximum of 2 hours during business hours.
- Protecting our clients' personal data in accordance with our Privacy Policy.`,
  },
  {
    id: 'limitacion-responsabilidad',
    title: '6. Limitacion de Responsabilidad',
    title_en: '6. Limitation of Liability',
    content: `Atitlan Experiences actua como operador y coordinador de experiencias turisticas. Si bien tomamos todas las precauciones para garantizar la seguridad y calidad de cada tour:

- No somos responsables por lesiones, perdidas o danos causados por negligencia del cliente o incumplimiento de instrucciones de seguridad.
- No somos responsables por pertenencias personales olvidadas, perdidas o danadas durante los tours.
- No garantizamos condiciones climaticas especificas ni vistas particulares (atardeceres, visibilidad de volcanes, etc.).
- Nuestra responsabilidad maxima se limita al monto pagado por el tour contratado.

Recomendamos a todos nuestros clientes contratar un seguro de viaje que cubra actividades acuaticas y al aire libre.`,
    content_en: `Atitlan Experiences acts as an operator and coordinator of tourist experiences. While we take all precautions to ensure the safety and quality of each tour:

- We are not responsible for injuries, losses, or damages caused by client negligence or failure to follow safety instructions.
- We are not responsible for personal belongings forgotten, lost, or damaged during tours.
- We do not guarantee specific weather conditions or particular views (sunsets, volcano visibility, etc.).
- Our maximum liability is limited to the amount paid for the contracted tour.

We recommend that all our clients purchase travel insurance that covers water activities and outdoor experiences.`,
  },
  {
    id: 'fuerza-mayor',
    title: '7. Fuerza Mayor',
    title_en: '7. Force Majeure',
    content: `Atitlan Experiences no sera responsable por el incumplimiento de sus obligaciones cuando este sea causado por eventos de fuerza mayor, incluyendo pero no limitado a:

- Condiciones climaticas adversas (tormentas, vientos fuertes, nivel inusual del lago).
- Desastres naturales (terremotos, erupciones volcanicas, inundaciones).
- Emergencias sanitarias o restricciones gubernamentales.
- Bloqueos de carreteras, protestas o situaciones de orden publico.
- Fallas de infraestructura publica (puertos, muelles, carreteras).

En caso de fuerza mayor, ofreceremos reprogramacion sin costo o reembolso completo a eleccion del cliente.`,
    content_en: `Atitlan Experiences shall not be liable for failure to fulfill its obligations when caused by force majeure events, including but not limited to:

- Adverse weather conditions (storms, strong winds, unusual lake levels).
- Natural disasters (earthquakes, volcanic eruptions, flooding).
- Health emergencies or government restrictions.
- Road blockages, protests, or public order situations.
- Public infrastructure failures (ports, docks, roads).

In case of force majeure, we will offer free rescheduling or a full refund at the client's choice.`,
  },
  {
    id: 'propiedad-intelectual',
    title: '8. Propiedad Intelectual',
    title_en: '8. Intellectual Property',
    content: `Todo el contenido del sitio web de Atitlan Experiences, incluyendo textos, fotografias, videos, disenos, logotipos y marcas, esta protegido por derechos de propiedad intelectual.

Las fotografias tomadas durante los tours pueden ser utilizadas por Atitlan Experiences con fines promocionales en redes sociales y sitio web. Si prefiere que sus imagenes no sean utilizadas, notifiquelo a nuestro equipo.

El cliente autoriza el uso de testimonios y resenas publicas para fines promocionales, a menos que solicite explicitamente lo contrario.`,
    content_en: `All content on the Atitlan Experiences website, including texts, photographs, videos, designs, logos, and trademarks, is protected by intellectual property rights.

Photographs taken during tours may be used by Atitlan Experiences for promotional purposes on social media and website. If you prefer that your images not be used, please notify our team.

The client authorizes the use of public testimonials and reviews for promotional purposes, unless they explicitly request otherwise.`,
  },
  {
    id: 'legislacion',
    title: '9. Legislacion Aplicable',
    title_en: '9. Applicable Legislation',
    content: `Estos terminos y condiciones se rigen por las leyes de la Republica de Guatemala. Cualquier disputa relacionada con estos terminos sera sometida a la jurisdiccion de los tribunales competentes del departamento de Solola, Guatemala.

Para disputas menores, ambas partes acuerdan intentar resolver el conflicto de manera amigable por un periodo de 30 dias antes de recurrir a la via legal.`,
    content_en: `These terms and conditions are governed by the laws of the Republic of Guatemala. Any dispute related to these terms shall be submitted to the jurisdiction of the competent courts of the department of Solola, Guatemala.

For minor disputes, both parties agree to attempt to resolve the conflict amicably for a period of 30 days before resorting to legal action.`,
  },
  {
    id: 'modificaciones',
    title: '10. Modificaciones',
    title_en: '10. Modifications',
    content: `Atitlan Experiences se reserva el derecho de modificar estos terminos y condiciones en cualquier momento. Los cambios seran publicados en esta pagina con la fecha de actualizacion. El uso continuo de nuestros servicios despues de las modificaciones constituye la aceptacion de los nuevos terminos.`,
    content_en: `Atitlan Experiences reserves the right to modify these terms and conditions at any time. Changes will be published on this page with the update date. Continued use of our services after modifications constitutes acceptance of the new terms.`,
  },
];

const TerminosPage = () => {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title="Terminos y Condiciones | Atitlan Experiences"
        description="Terminos y condiciones de servicio de Atitlan Experiences. Informacion sobre reservas, pagos, cancelaciones, responsabilidades y legislacion aplicable en Guatemala."
        canonicalPath="/terminos"
      />
      <GlassNav />

      <main id="main-content">
        {/* Hero */}
        <section className="relative py-20 lg:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-red-50/30" />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center animate-fade-in-up">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="h-px w-8 bg-red-500" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-red-500">
                {t('legal.tag')}
              </span>
              <span className="h-px w-8 bg-red-500" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-[0.95] tracking-tight mb-6">
              {t('legal.termsTitle')}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
                {t('legal.termsAccent')}
              </span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
              {t('legal.termsDesc')}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 lg:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            {/* Table of Contents */}
            <nav className="glass-card rounded-3xl p-6 sm:p-8 mb-12 animate-fade-in-up">
              <h2 className="text-lg font-black text-gray-900 mb-4">{t('common.tableOfContents')}</h2>
              <ul className="grid sm:grid-cols-2 gap-2">
                {SECTIONS.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-sm text-gray-600 hover:text-red-500 transition-colors font-medium"
                    >
                      {L(section, 'title', language)}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Sections */}
            <div className="space-y-12">
              {SECTIONS.map((section) => (
                <article
                  key={section.id}
                  id={section.id}
                  className="animate-fade-in-up scroll-mt-24"
                >
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-4">
                    {L(section, 'title', language)}
                  </h2>
                  <div className="text-gray-600 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                    {L(section, 'content', language)}
                  </div>
                </article>
              ))}
            </div>

            {/* Footer note */}
            <div className="mt-16 pt-8 border-t border-gray-100 text-center text-sm text-gray-400 animate-fade-in">
              <p>{t('legal.lastUpdated')}</p>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                <Link to="/politica-cancelacion" className="text-red-500 hover:text-red-600 font-medium transition-colors">
                  {t('legal.linkCancellation')}
                </Link>
                <span className="text-gray-300">|</span>
                <Link to="/privacidad" className="text-red-500 hover:text-red-600 font-medium transition-colors">
                  {t('legal.linkPrivacy')}
                </Link>
                <span className="text-gray-300">|</span>
                <Link to="/faq" className="text-red-500 hover:text-red-600 font-medium transition-colors">
                  {t('legal.linkFaq')}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <GlassFooter />
    </div>
  );
};

export default TerminosPage;
