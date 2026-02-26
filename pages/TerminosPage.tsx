import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { GlassNav, GlassFooter } from '../components/shared';

const SECTIONS = [
  {
    id: 'descripcion',
    title: '1. Descripcion del Servicio',
    content: `Atitlan Experiences es un operador de tours y experiencias turisticas con sede en Panajachel, Solola, Guatemala. Ofrecemos tours en lancha privada, excursiones culturales a pueblos del Lago de Atitlan, actividades de aventura, experiencias gastronomicas y servicios de logistica turistica.

Nuestros servicios se describen detalladamente en cada pagina de experiencia dentro de nuestro sitio web. Las descripciones, imagenes y precios publicados son de caracter informativo y pueden estar sujetos a cambios sin previo aviso, aunque siempre te notificaremos antes de confirmar tu reserva.`,
  },
  {
    id: 'reservas',
    title: '2. Reservas y Pagos',
    content: `Al realizar una reserva con Atitlan Experiences, el cliente acepta estos terminos y condiciones en su totalidad.

Las reservas pueden realizarse a traves de WhatsApp, correo electronico o el formulario de contacto en nuestra web. La reserva se considera confirmada una vez que recibas una confirmacion por escrito (WhatsApp o email) de nuestro equipo.

El anticipo de $50 USD asegura tu lugar y se descuenta del precio total. El saldo restante puede pagarse el dia del tour en efectivo (dolares o quetzales) o con tarjeta.

Los precios publicados estan en dolares estadounidenses (USD) e incluyen impuestos. No hay cargos adicionales ocultos. Las propinas para capitanes y guias son opcionales.

Los pagos con tarjeta se procesan a traves de Recurrente, una pasarela de pago certificada. No almacenamos datos de tarjetas de credito en nuestros servidores.`,
  },
  {
    id: 'cancelaciones',
    title: '3. Cancelaciones y Reembolsos',
    content: `Nuestra politica de cancelacion es la siguiente:

- Cancelacion con mas de 48 horas de anticipacion: reembolso completo del 100%.
- Cancelacion entre 24 y 48 horas antes: reembolso del 50% o reprogramacion sin costo.
- Cancelacion con menos de 24 horas: sin reembolso, ya que los recursos han sido asignados.

Los cambios de fecha estan sujetos a disponibilidad y pueden solicitarse sin costo con mas de 48 horas de anticipacion.

Para mas detalles, consulta nuestra Politica de Cancelacion completa.`,
  },
  {
    id: 'responsabilidades-cliente',
    title: '4. Responsabilidades del Cliente',
    content: `El cliente se compromete a:

- Presentarse en el punto de encuentro a la hora acordada. Toleramos un maximo de 15 minutos de espera.
- Informar sobre condiciones medicas, alergias alimentarias o necesidades especiales al momento de reservar.
- Seguir las instrucciones del capitan y los guias durante el tour, especialmente en materia de seguridad.
- Usar chaleco salvavidas en todo momento durante los traslados en lancha.
- Comportarse de manera respetuosa con las comunidades locales, sus tradiciones y el medio ambiente.
- No llevar sustancias ilegales ni presentarse bajo los efectos de alcohol o drogas a los tours.

Atitlan Experiences se reserva el derecho de suspender o cancelar un tour sin reembolso si el comportamiento de un cliente pone en riesgo su seguridad, la de otros pasajeros, la tripulacion o las comunidades visitadas.`,
  },
  {
    id: 'responsabilidades-empresa',
    title: '5. Responsabilidades de Atitlan Experiences',
    content: `Nos comprometemos a:

- Operar todos los tours con capitanes certificados y embarcaciones en condiciones optimas.
- Proporcionar chalecos salvavidas y equipo de seguridad para todos los pasajeros.
- Cumplir con el itinerario acordado, salvo que condiciones climaticas o de seguridad no lo permitan.
- Brindar atencion al cliente bilingue (espanol e ingles) antes, durante y despues del tour.
- Mantener canales de comunicacion abiertos y responder en un plazo maximo de 2 horas en horario de atencion.
- Proteger los datos personales de nuestros clientes conforme a nuestra Politica de Privacidad.`,
  },
  {
    id: 'limitacion-responsabilidad',
    title: '6. Limitacion de Responsabilidad',
    content: `Atitlan Experiences actua como operador y coordinador de experiencias turisticas. Si bien tomamos todas las precauciones para garantizar la seguridad y calidad de cada tour:

- No somos responsables por lesiones, perdidas o danos causados por negligencia del cliente o incumplimiento de instrucciones de seguridad.
- No somos responsables por pertenencias personales olvidadas, perdidas o danadas durante los tours.
- No garantizamos condiciones climaticas especificas ni vistas particulares (atardeceres, visibilidad de volcanes, etc.).
- Nuestra responsabilidad maxima se limita al monto pagado por el tour contratado.

Recomendamos a todos nuestros clientes contratar un seguro de viaje que cubra actividades acuaticas y al aire libre.`,
  },
  {
    id: 'fuerza-mayor',
    title: '7. Fuerza Mayor',
    content: `Atitlan Experiences no sera responsable por el incumplimiento de sus obligaciones cuando este sea causado por eventos de fuerza mayor, incluyendo pero no limitado a:

- Condiciones climaticas adversas (tormentas, vientos fuertes, nivel inusual del lago).
- Desastres naturales (terremotos, erupciones volcanicas, inundaciones).
- Emergencias sanitarias o restricciones gubernamentales.
- Bloqueos de carreteras, protestas o situaciones de orden publico.
- Fallas de infraestructura publica (puertos, muelles, carreteras).

En caso de fuerza mayor, ofreceremos reprogramacion sin costo o reembolso completo a eleccion del cliente.`,
  },
  {
    id: 'propiedad-intelectual',
    title: '8. Propiedad Intelectual',
    content: `Todo el contenido del sitio web de Atitlan Experiences, incluyendo textos, fotografias, videos, disenos, logotipos y marcas, esta protegido por derechos de propiedad intelectual.

Las fotografias tomadas durante los tours pueden ser utilizadas por Atitlan Experiences con fines promocionales en redes sociales y sitio web. Si prefiere que sus imagenes no sean utilizadas, notifiquelo a nuestro equipo.

El cliente autoriza el uso de testimonios y resenas publicas para fines promocionales, a menos que solicite explicitamente lo contrario.`,
  },
  {
    id: 'legislacion',
    title: '9. Legislacion Aplicable',
    content: `Estos terminos y condiciones se rigen por las leyes de la Republica de Guatemala. Cualquier disputa relacionada con estos terminos sera sometida a la jurisdiccion de los tribunales competentes del departamento de Solola, Guatemala.

Para disputas menores, ambas partes acuerdan intentar resolver el conflicto de manera amigable por un periodo de 30 dias antes de recurrir a la via legal.`,
  },
  {
    id: 'modificaciones',
    title: '10. Modificaciones',
    content: `Atitlan Experiences se reserva el derecho de modificar estos terminos y condiciones en cualquier momento. Los cambios seran publicados en esta pagina con la fecha de actualizacion. El uso continuo de nuestros servicios despues de las modificaciones constituye la aceptacion de los nuevos terminos.`,
  },
];

const TerminosPage = () => {
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
                Legal
              </span>
              <span className="h-px w-8 bg-red-500" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-[0.95] tracking-tight mb-6">
              Terminos y
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
                Condiciones
              </span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
              Al utilizar nuestros servicios, aceptas los siguientes terminos y condiciones.
              Te invitamos a leerlos con atencion.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 lg:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            {/* Table of Contents */}
            <nav className="glass-card rounded-3xl p-6 sm:p-8 mb-12 animate-fade-in-up">
              <h2 className="text-lg font-black text-gray-900 mb-4">Contenido</h2>
              <ul className="grid sm:grid-cols-2 gap-2">
                {SECTIONS.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-sm text-gray-600 hover:text-red-500 transition-colors font-medium"
                    >
                      {section.title}
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
                    {section.title}
                  </h2>
                  <div className="text-gray-600 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                    {section.content}
                  </div>
                </article>
              ))}
            </div>

            {/* Footer note */}
            <div className="mt-16 pt-8 border-t border-gray-100 text-center text-sm text-gray-400 animate-fade-in">
              <p>Ultima actualizacion: Febrero 2026</p>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                <Link to="/politica-cancelacion" className="text-red-500 hover:text-red-600 font-medium transition-colors">
                  Politica de Cancelacion
                </Link>
                <span className="text-gray-300">|</span>
                <Link to="/privacidad" className="text-red-500 hover:text-red-600 font-medium transition-colors">
                  Politica de Privacidad
                </Link>
                <span className="text-gray-300">|</span>
                <Link to="/faq" className="text-red-500 hover:text-red-600 font-medium transition-colors">
                  Preguntas Frecuentes
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
