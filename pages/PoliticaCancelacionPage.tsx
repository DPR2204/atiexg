import React from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { GlassNav, GlassFooter } from '../components/shared';

const PoliticaCancelacionPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Seo
        title="Politica de Cancelacion | Atitlan Experiences"
        description="Conoce nuestra politica de cancelacion para tours en el Lago de Atitlan. Cancelacion gratuita 48+ horas antes. Flexibilidad y transparencia en cada reserva."
        canonicalPath="/politica-cancelacion"
      />
      <GlassNav />

      <main id="main-content">
        {/* Hero */}
        <section className="relative py-20 lg:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-red-50/30" />
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-red-100/30 rounded-full blur-3xl" />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center animate-fade-in-up">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="h-px w-8 bg-red-500" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-red-500">
                Transparencia
              </span>
              <span className="h-px w-8 bg-red-500" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-[0.95] tracking-tight mb-6">
              Politica de
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
                Cancelacion
              </span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mx-auto">
              Queremos que reserves con total confianza. Nuestra politica es clara,
              justa y pensada para tu tranquilidad.
            </p>
          </div>
        </section>

        {/* Policy Content */}
        <section className="py-12 lg:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            {/* Timeline cards */}
            <div className="space-y-6 mb-16 animate-fade-in-up">
              {/* 48+ hours */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 border-l-4 border-green-500">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center shrink-0">
                    <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">
                      Mas de 48 horas antes
                    </h3>
                    <p className="text-3xl font-black text-green-600 mb-2">Reembolso completo</p>
                    <p className="text-gray-600 leading-relaxed">
                      Cancela o reprograma sin ningun costo. Te devolvemos el 100% de tu anticipo
                      o pago. Sin preguntas, sin complicaciones.
                    </p>
                  </div>
                </div>
              </div>

              {/* 24-48 hours */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 border-l-4 border-yellow-500">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center shrink-0">
                    <svg className="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">
                      Entre 24 y 48 horas antes
                    </h3>
                    <p className="text-3xl font-black text-yellow-600 mb-2">Reembolso del 50%</p>
                    <p className="text-gray-600 leading-relaxed">
                      Te devolvemos la mitad de tu pago. Alternativamente, puedes reprogramar
                      tu tour a otra fecha disponible sin cargo adicional.
                    </p>
                  </div>
                </div>
              </div>

              {/* Less than 24 hours */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 border-l-4 border-red-500">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center shrink-0">
                    <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">
                      Menos de 24 horas antes
                    </h3>
                    <p className="text-3xl font-black text-red-600 mb-2">Sin reembolso</p>
                    <p className="text-gray-600 leading-relaxed">
                      Lamentablemente no podemos ofrecer reembolso con menos de 24 horas de anticipacion,
                      ya que los recursos (lancha, capitan, guia) ya han sido asignados para tu experiencia.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Weather Policy */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 mb-8 animate-fade-in-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <h2 className="text-xl font-black text-gray-900">Politica de Clima</h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                La seguridad de nuestros pasajeros es siempre la prioridad. Si las condiciones climaticas
                no permiten realizar el tour de forma segura (vientos fuertes, tormentas, lago agitado),
                nosotros tomaremos la decision de reprogramar.
              </p>
              <ul className="space-y-3">
                {[
                  'Si cancelamos por clima, se reprograma sin costo a la fecha que prefieras.',
                  'Si el clima permite ajustar el itinerario (ruta alternativa), te lo proponemos.',
                  'El reembolso completo esta disponible si no puedes reprogramar.',
                  'Te notificamos lo antes posible por WhatsApp sobre cualquier cambio.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-gray-600">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* How to Cancel */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 mb-8 animate-fade-in-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-xl font-black text-gray-900">Como Cancelar o Hacer Cambios</h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                Para cancelar o modificar tu reserva, simplemente contactanos por cualquiera de estos canales:
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <a
                  href="https://wa.me/50222681264"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl hover:bg-green-100 transition-colors"
                >
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">WhatsApp</p>
                    <p className="text-xs text-gray-500">+502 2268 1264</p>
                  </div>
                </a>
                <a
                  href="mailto:hola@atitlanexperience.com"
                  className="flex items-center gap-3 p-4 bg-red-50 rounded-2xl hover:bg-red-100 transition-colors"
                >
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Email</p>
                    <p className="text-xs text-gray-500">hola@atitlanexperience.com</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Note */}
            <div className="text-center text-sm text-gray-400 animate-fade-in">
              <p>Ultima actualizacion: Febrero 2026</p>
              <p className="mt-2">
                <Link to="/terminos" className="text-red-500 hover:text-red-600 font-medium transition-colors">
                  Ver Terminos y Condiciones completos
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      <GlassFooter />
    </div>
  );
};

export default PoliticaCancelacionPage;
