import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { GlassNav, GlassFooter } from '../components/shared';

const SECTIONS = [
  {
    id: 'datos-recopilados',
    title: '1. Datos que Recopilamos',
    content: `Recopilamos informacion personal limitada y necesaria para brindarte un servicio de calidad:

**Datos proporcionados directamente por ti:**
- Nombre completo
- Numero de telefono y WhatsApp
- Direccion de correo electronico
- Pais de origen
- Preferencias de tour (fechas, numero de personas, requerimientos especiales)
- Alergias alimentarias o condiciones medicas relevantes para el tour

**Datos recopilados automaticamente:**
- Direccion IP
- Tipo de navegador y dispositivo
- Paginas visitadas en nuestro sitio web
- Fecha y hora de acceso
- Fuente de referencia (como llegaste a nuestro sitio)

**Datos de pago:**
- Los datos de tarjetas de credito son procesados exclusivamente por Recurrente (nuestra pasarela de pago) y NO se almacenan en nuestros servidores.`,
  },
  {
    id: 'uso-datos',
    title: '2. Como Utilizamos tus Datos',
    content: `Tus datos personales son utilizados exclusivamente para:

- Procesar y confirmar tus reservas de tours
- Comunicarnos contigo sobre tu reserva (confirmaciones, cambios, recordatorios)
- Enviarte informacion relevante sobre tu experiencia (punto de encuentro, que llevar, clima)
- Procesar pagos y reembolsos
- Mejorar nuestros servicios basandonos en patrones de uso anonimizados
- Responder a tus consultas y solicitudes de soporte
- Cumplir con obligaciones legales y fiscales en Guatemala

**No vendemos, alquilamos ni compartimos tus datos personales con terceros para fines de marketing.** No te enviaremos comunicaciones promocionales sin tu consentimiento previo.`,
  },
  {
    id: 'terceros',
    title: '3. Servicios de Terceros',
    content: `Para operar nuestro sitio web y servicios, utilizamos los siguientes proveedores de confianza:

**Supabase** (base de datos y autenticacion): Almacena datos de reservas y cuentas de usuario con encriptacion en reposo y en transito. Servidores ubicados en EE.UU. con cumplimiento SOC 2 Type II.

**Recurrente** (pasarela de pago): Procesa pagos con tarjeta de credito de forma segura. Certificacion PCI DSS. No compartimos ni almacenamos datos de tarjetas.

**Cloudinary** (gestion de imagenes): Almacena y optimiza las imagenes de nuestro sitio web. No procesa datos personales de clientes.

**Vercel** (hosting): Aloja nuestro sitio web. Cumple con GDPR y cuenta con certificacion SOC 2.

**WhatsApp (Meta)**: Utilizamos WhatsApp Business para comunicacion con clientes. Los mensajes estan cifrados de extremo a extremo. Consulta la politica de privacidad de Meta para mas detalles.

Cada proveedor esta sujeto a sus propios terminos de privacidad y cumple con estandares internacionales de proteccion de datos.`,
  },
  {
    id: 'cookies',
    title: '4. Cookies y Tecnologias de Rastreo',
    content: `Nuestro sitio web utiliza cookies esenciales para su funcionamiento correcto:

- **Cookies de sesion**: Necesarias para mantener tu sesion activa mientras navegas el sitio. Se eliminan al cerrar el navegador.
- **Cookies de preferencias**: Recuerdan tus preferencias de idioma y configuracion. Duran 30 dias.
- **Cookies analiticas**: Nos ayudan a entender como los visitantes usan nuestro sitio para mejorar la experiencia. Los datos son anonimizados.

No utilizamos cookies de publicidad ni de rastreo de terceros para fines de marketing.`,
  },
  {
    id: 'derechos',
    title: '5. Tus Derechos',
    content: `Como usuario de nuestros servicios, tienes los siguientes derechos sobre tus datos personales:

- **Derecho de acceso**: Puedes solicitar una copia de los datos personales que tenemos sobre ti.
- **Derecho de rectificacion**: Puedes solicitar la correccion de datos inexactos o incompletos.
- **Derecho de eliminacion**: Puedes solicitar que eliminemos tus datos personales, salvo aquellos que debamos conservar por obligaciones legales o fiscales.
- **Derecho de portabilidad**: Puedes solicitar tus datos en un formato estructurado y de uso comun.
- **Derecho de oposicion**: Puedes oponerte al procesamiento de tus datos para fines especificos.

Para ejercer cualquiera de estos derechos, contactanos a traves de los canales indicados al final de esta pagina. Responderemos a tu solicitud en un plazo maximo de 30 dias.`,
  },
  {
    id: 'retencion',
    title: '6. Retencion de Datos',
    content: `Conservamos tus datos personales unicamente durante el tiempo necesario para cumplir con los fines para los que fueron recopilados:

- **Datos de reservas**: Se conservan por 5 anos para cumplir con obligaciones fiscales guatemaltecas.
- **Datos de contacto**: Se conservan mientras mantengas una relacion activa con nosotros. Si no hay actividad por 24 meses, eliminamos tus datos de contacto.
- **Datos de navegacion**: Se eliminan automaticamente cada 90 dias.
- **Datos de pago**: Procesados y eliminados por Recurrente segun sus politicas de retencion PCI DSS.`,
  },
  {
    id: 'seguridad',
    title: '7. Seguridad de los Datos',
    content: `Implementamos medidas tecnicas y organizativas para proteger tus datos personales:

- Encriptacion SSL/TLS en todas las comunicaciones del sitio web
- Encriptacion en reposo y en transito para datos almacenados en Supabase
- Acceso restringido a datos personales (solo personal autorizado)
- Autenticacion de dos factores para accesos administrativos
- Monitoreo continuo de seguridad y actualizaciones regulares

Si bien tomamos todas las precauciones razonables, ningun sistema de almacenamiento o transmision de datos es 100% seguro. Te notificaremos de inmediato en caso de cualquier brecha de seguridad que pueda afectar tus datos.`,
  },
  {
    id: 'menores',
    title: '8. Menores de Edad',
    content: `Nuestros servicios no estan dirigidos a menores de 18 anos de forma independiente. Los menores pueden participar en nuestros tours bajo la supervision y responsabilidad de un adulto que actue como tutor legal.

No recopilamos intencionalmente datos personales de menores de 18 anos. Si descubrimos que hemos recopilado datos de un menor sin el consentimiento de un tutor, eliminaremos esa informacion inmediatamente.`,
  },
  {
    id: 'contacto',
    title: '9. Contacto para Asuntos de Privacidad',
    content: `Para cualquier consulta, solicitud o reclamo relacionado con tu privacidad y datos personales, puedes contactarnos a traves de:

- **Email**: hola@atitlanexperience.com (asunto: Privacidad)
- **WhatsApp**: +502 2268 1264
- **Direccion**: Calle Principal, Panajachel, Solola, Guatemala, 07010

Nos comprometemos a responder a todas las solicitudes de privacidad en un plazo maximo de 30 dias habiles.`,
  },
  {
    id: 'cambios',
    title: '10. Cambios a esta Politica',
    content: `Podemos actualizar esta politica de privacidad periodicamente para reflejar cambios en nuestras practicas o en la legislacion aplicable. Publicaremos cualquier cambio en esta pagina con la fecha de actualizacion. Te recomendamos revisarla periodicamente.

Para cambios significativos que afecten el tratamiento de tus datos, te notificaremos por email o WhatsApp antes de implementar los cambios.`,
  },
];

const PrivacidadPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Seo
        title="Politica de Privacidad | Atitlan Experiences"
        description="Conoce como Atitlan Experiences recopila, utiliza y protege tus datos personales. Transparencia total sobre privacidad, cookies y derechos del usuario."
        canonicalPath="/privacidad"
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
                Privacidad
              </span>
              <span className="h-px w-8 bg-red-500" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-[0.95] tracking-tight mb-6">
              Politica de
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
                Privacidad
              </span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
              Tu privacidad es importante para nosotros. Aqui explicamos como recopilamos,
              utilizamos y protegemos tus datos personales.
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
                <Link to="/terminos" className="text-red-500 hover:text-red-600 font-medium transition-colors">
                  Terminos y Condiciones
                </Link>
                <span className="text-gray-300">|</span>
                <Link to="/politica-cancelacion" className="text-red-500 hover:text-red-600 font-medium transition-colors">
                  Politica de Cancelacion
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

export default PrivacidadPage;
