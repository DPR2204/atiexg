import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const FAQS = [
    {
        question: '¿Cuánto cuesta un tour en el Lago de Atitlán?',
        answer: 'Nuestros tours van desde $35 USD por persona para experiencias de medio día hasta $85 USD para experiencias Signature de día completo. Todos incluyen lancha privada y guía bilingüe.',
    },
    {
        question: '¿Cómo reservo un tour?',
        answer: 'Puedes reservar directamente por WhatsApp, a través de nuestro formulario de contacto, o pagando un anticipo de $50 USD en línea. Respondemos en menos de 60 minutos.',
    },
    {
        question: '¿Los tours son privados o compartidos?',
        answer: 'Todos nuestros tours son privados o en grupos pequeños (máximo 10 personas). No mezclamos grupos para garantizar una experiencia personalizada.',
    },
    {
        question: '¿Qué pasa si llueve el día de mi tour?',
        answer: 'Si las condiciones climáticas no permiten el tour, te ofrecemos reprogramación sin costo o reembolso completo. Tu seguridad es nuestra prioridad.',
    },
];

const FaqItem: React.FC<{ question: string; answer: string; isOpen: boolean; onToggle: () => void }> = ({
    question,
    answer,
    isOpen,
    onToggle,
}) => {
    return (
        <div className="glass-card rounded-3xl overflow-hidden transition-all duration-300">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between gap-4 p-6 text-left hover:bg-white/60 transition-colors duration-200"
                aria-expanded={isOpen}
            >
                <span className="text-base sm:text-lg font-bold text-gray-900">{question}</span>
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-transform duration-300" style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                </span>
            </button>
            <div
                className="overflow-hidden transition-all duration-300"
                style={{ maxHeight: isOpen ? '200px' : '0px', opacity: isOpen ? 1 : 0 }}
            >
                <p className="px-6 pb-6 text-sm sm:text-base text-gray-500 leading-relaxed">
                    {answer}
                </p>
            </div>
        </div>
    );
};

const FaqPreview: React.FC = () => {
    const { t } = useLanguage();
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-20 lg:py-32 bg-gray-50/50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-16">
                    <span className="inline-block text-xs font-bold uppercase tracking-[0.3em] text-red-500 mb-4">
                        {t('contact.faqTag')}
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                        {t('contact.faqTitle')}
                    </h2>
                    <p className="mt-4 text-lg text-gray-500 leading-relaxed">
                        {t('faq.heroDesc')}
                    </p>
                </div>

                <div className="space-y-4">
                    {FAQS.map((faq, index) => (
                        <FaqItem
                            key={faq.question}
                            question={faq.question}
                            answer={faq.answer}
                            isOpen={openIndex === index}
                            onToggle={() => handleToggle(index)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FaqPreview;
