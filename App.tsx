
import React, { useState, useMemo } from 'react';
import { Tour, ItineraryStep, SelectedTourConfig } from './types';
import { TOURS } from './data';

// --- UTILS ---
const formatWhatsAppMessage = (selections: SelectedTourConfig[]) => {
  const base = "https://wa.me/50222681264?text=";
  let message = "¡Hola Atitlán Experiences! 🌊\n\nSolicitud de Reserva Premium:\n\n";
  
  selections.forEach((sel) => {
    const tour = TOURS.find(t => t.id === sel.tourId);
    if (!tour) return;
    const priceOption = tour.prices.find(p => p.id === sel.selectedPriceId);
    const addons = tour.addons.filter(a => sel.selectedAddonIds.includes(a.id));

    message += `🔹 *${tour.name}*\n`;
    message += `Opción: ${priceOption?.label} ($${priceOption?.amount})\n`;
    
    if (addons.length > 0) {
      message += `Add-ons: ${addons.map(a => `${a.label} ($${a.price})`).join(', ')}\n`;
    }

    if (sel.customItinerary.length > 0) {
      message += `_Itinerario Ajustado:_\n`;
      sel.customItinerary.forEach(step => {
        message += `• ${step.time}: ${step.activity}\n`;
      });
    }
    message += `\n`;
  });
  
  message += "¿Me podrían confirmar disponibilidad para estas experiencias? ¡Gracias!";
  return base + encodeURIComponent(message);
};

const formatSingleTourWhatsApp = (tour: Tour, config?: Partial<SelectedTourConfig>) => {
  const base = "https://wa.me/50222681264?text=";
  let message = `¡Hola Atitlán Experiences! 🌊\n\nMe interesa la experiencia: *${tour.name}*.\n\n`;
  
  if (config) {
    const priceOption = tour.prices.find(p => p.id === config.selectedPriceId);
    if (priceOption) message += `Formato: ${priceOption.label} ($${priceOption.amount})\n`;
    
    const addons = tour.addons.filter(a => config.selectedAddonIds?.includes(a.id));
    if (addons.length > 0) {
      message += `Add-ons: ${addons.map(a => `${a.label}`).join(', ')}\n`;
    }

    if (config.customItinerary && config.customItinerary.length > 0) {
      message += `\n*Mi itinerario propuesto:*\n`;
      config.customItinerary.forEach(step => {
        message += `• ${step.time}: ${step.activity}\n`;
      });
    }
  }
  
  message += `\n¿Es posible realizar esta reserva? Quedo atento.`;
  return base + encodeURIComponent(message);
};

// --- COMPONENTS ---

const ItineraryBuilder = ({ initialItinerary, onUpdate }: { initialItinerary: ItineraryStep[], onUpdate: (itin: ItineraryStep[]) => void }) => {
  const [steps, setSteps] = useState<ItineraryStep[]>(initialItinerary);
  const [isEditing, setIsEditing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const updateStep = (index: number, field: keyof ItineraryStep, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
    onUpdate(newSteps);
  };

  return (
    <div className="bg-gray-50 rounded-3xl p-4 sm:p-6 border border-gray-100">
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between mb-2"
      >
        <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-gray-900">Itinerario Propuesto</h4>
        <div className="flex items-center gap-2 sm:gap-3">
           {!isCollapsed && (
             <button 
              onClick={(e) => { e.stopPropagation(); setIsEditing(!isEditing); }}
              className={`px-3 py-1.5 rounded-xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all ${isEditing ? 'bg-green-600 text-white' : 'bg-white text-blue-600 border border-blue-100'}`}
            >
              {isEditing ? 'Guardar' : 'Editar'}
            </button>
           )}
           <svg className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
        </div>
      </button>

      {!isCollapsed && (
        <div className="space-y-3 sm:space-y-4 animate-fade-in mt-4">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 sm:gap-4 group">
              <div className="flex flex-col items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2"></div>
                {idx !== steps.length - 1 && <div className="w-px h-10 bg-blue-100 mt-2"></div>}
              </div>
              <div className="flex-1 pb-1">
                {isEditing ? (
                  <div className="flex gap-2">
                    <input type="text" value={step.time} onChange={(e) => updateStep(idx, 'time', e.target.value)} className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-1 text-[10px] font-bold" />
                    <input type="text" value={step.activity} onChange={(e) => updateStep(idx, 'activity', e.target.value)} className="flex-1 bg-white border border-gray-200 rounded-lg px-2 py-1 text-[10px] font-bold" />
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <span className="text-[8px] sm:text-[9px] font-black text-blue-600 tracking-wider uppercase">{step.time}</span>
                    <p className="text-[11px] sm:text-xs font-bold text-gray-700 leading-tight">{step.activity}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TourDetailModal = ({ tour, onClose, selection, onSaveSelection }: { 
  tour: Tour, 
  onClose: () => void,
  selection: SelectedTourConfig | undefined,
  onSaveSelection: (config: SelectedTourConfig) => void
}) => {
  const [selectedPriceId, setSelectedPriceId] = useState(selection?.selectedPriceId || tour.prices[0].id);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>(selection?.selectedAddonIds || []);
  const [customItinerary, setCustomItinerary] = useState<ItineraryStep[]>(selection?.customItinerary || tour.itinerary);

  const toggleAddon = (id: string) => {
    setSelectedAddonIds(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const handleSave = () => {
    onSaveSelection({
      tourId: tour.id,
      selectedPriceId,
      selectedAddonIds,
      customItinerary
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-gray-900/70 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-5xl max-h-[92vh] rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row">
        <button onClick={onClose} className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 bg-white/20 backdrop-blur text-white p-2 rounded-full hover:bg-white/40 md:text-gray-900 md:bg-gray-100">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>

        <div className="w-full md:w-5/12 h-48 sm:h-64 md:h-auto relative">
          <img src={tour.image} className="w-full h-full object-cover" alt={tour.name} />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 text-white">
            <span className="bg-blue-600 px-2.5 py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest">{tour.category}</span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2 leading-none uppercase">{tour.name}</h2>
            <p className="text-[10px] sm:text-xs font-bold opacity-70 mt-1">{tour.concept}</p>
          </div>
        </div>

        <div className="flex-1 p-6 sm:p-8 md:p-12 overflow-y-auto scrollbar-hide bg-white space-y-8 sm:space-y-10">
          <div>
            <h4 className="text-[9px] sm:text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] sm:tracking-[0.3em] mb-3 sm:mb-4">Descripción</h4>
            <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed">{tour.description}</p>
          </div>

          <div>
            <h4 className="text-[9px] sm:text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] sm:tracking-[0.3em] mb-3 sm:mb-4">1. Formato de Experiencia</h4>
            <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
              {tour.prices.map((p) => (
                <button 
                  key={p.id}
                  onClick={() => setSelectedPriceId(p.id)}
                  className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border-2 transition-all text-left ${selectedPriceId === p.id ? 'border-blue-600 bg-blue-50/30' : 'border-gray-100 hover:border-blue-200'}`}
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <p className="font-black text-gray-950 text-xs sm:text-sm truncate">{p.label}</p>
                    <p className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{p.description}</p>
                  </div>
                  <span className="font-black text-blue-600 shrink-0 text-sm sm:text-base">${p.amount}</span>
                </button>
              ))}
            </div>
          </div>

          {tour.addons.length > 0 && (
            <div>
              <h4 className="text-[9px] sm:text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] sm:tracking-[0.3em] mb-3 sm:mb-4">2. Servicios Adicionales</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {tour.addons.map((a) => (
                  <button 
                    key={a.id}
                    onClick={() => toggleAddon(a.id)}
                    className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border-2 transition-all text-left ${selectedAddonIds.includes(a.id) ? 'border-blue-600 bg-blue-50/30' : 'border-gray-100 hover:border-blue-100'}`}
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-lg border-2 flex items-center justify-center transition-colors shrink-0 ${selectedAddonIds.includes(a.id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200'}`}>
                        {selectedAddonIds.includes(a.id) && <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>}
                      </div>
                      <span className="text-[11px] sm:text-xs font-bold text-gray-700 truncate">{a.label}</span>
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-black text-blue-500 shrink-0">+${a.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <ItineraryBuilder initialItinerary={customItinerary} onUpdate={setCustomItinerary} />

          <div className="pt-2">
            <button 
              onClick={handleSave}
              className="w-full bg-gray-950 text-white py-4 sm:py-5 rounded-2xl sm:rounded-[2rem] font-black text-xs sm:text-sm uppercase tracking-widest hover:bg-blue-600 active:scale-95 transition-all shadow-xl"
            >
              {selection ? 'Actualizar Selección' : 'Agregar al Plan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Header = ({ onSearchClick }: { onSearchClick: () => void }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMenu = () => setIsMobileMenuOpen(false);
  const handleSearchClick = () => {
    closeMenu();
    onSearchClick();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-6">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.location.reload()}>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 transition-transform group-hover:rotate-3">
            <span className="text-white font-black text-xl sm:text-2xl italic">A</span>
          </div>
          <div className="hidden sm:flex flex-col">
            <h1 className="text-base sm:text-lg font-black tracking-tighter leading-none">ATITLÁN</h1>
            <span className="text-[8px] sm:text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">Experiences</span>
          </div>
        </div>
        <nav className="hidden lg:flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
          <a href="#inicio" className="hover:text-gray-900 transition-colors">Inicio</a>
          <a href="#catalogo" className="hover:text-gray-900 transition-colors">Catálogo</a>
          <a href="#conocenos" className="hover:text-gray-900 transition-colors">Conócenos</a>
          <a href="#contacto" className="hover:text-gray-900 transition-colors">Contacto</a>
        </nav>
        <button onClick={handleSearchClick} className="hidden md:flex items-center flex-1 max-w-md gap-2 sm:gap-3 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all text-left group active:scale-[0.98] bg-white/50 min-w-0">
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-[9px] sm:text-[11px] font-bold text-gray-900 leading-none truncate">Explora el Catálogo</span>
            <span className="text-[8px] sm:text-[10px] text-gray-400 truncate font-medium">14 Experiencias Premium</span>
          </div>
        </button>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button
            onClick={handleSearchClick}
            className="md:hidden w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-blue-600 hover:bg-blue-50"
            aria-label="Buscar en el catálogo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </button>
          <a href="#contacto" className="hidden sm:block text-sm font-bold text-gray-600 hover:text-blue-600">Contacto</a>
          <a href="#catalogo" className="hidden sm:inline-flex bg-gray-950 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-sm font-black hover:bg-blue-600 active:scale-95 transition-all">CATÁLOGO</a>
          <button
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            className="sm:hidden w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-100"
            aria-label="Abrir menú"
          >
            {isMobileMenuOpen ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 6h16M4 12h16M4 18h16"/></svg>
            )}
          </button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl px-4 pb-4">
          <div className="pt-4 grid gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
            <a href="#inicio" onClick={closeMenu} className="hover:text-gray-900">Inicio</a>
            <a href="#catalogo" onClick={closeMenu} className="hover:text-gray-900">Catálogo</a>
            <a href="#conocenos" onClick={closeMenu} className="hover:text-gray-900">Conócenos</a>
            <a href="#contacto" onClick={closeMenu} className="hover:text-gray-900">Contacto</a>
          </div>
          <div className="mt-4 flex gap-2">
            <a href="https://wa.me/50222681264" target="_blank" className="flex-1 text-center bg-green-600 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest">WhatsApp</a>
            <a href="#catalogo" onClick={closeMenu} className="flex-1 text-center bg-gray-950 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest">Catálogo</a>
          </div>
        </div>
      )}
    </header>
  );
};

const SearchOverlay = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-white p-6 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl relative">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tighter uppercase">Filtros Avanzados</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="space-y-4 sm:space-y-6">
          <div className="p-5 sm:p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
            <label className="block text-[9px] sm:text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Fecha de interés</label>
            <input type="date" className="w-full bg-transparent text-base sm:text-lg font-bold outline-none text-gray-900" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="p-5 sm:p-6 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-base sm:text-lg font-bold text-gray-900">Pasajeros</p>
              <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Adultos / Niños</p>
            </div>
            <div className="flex items-center gap-4 sm:gap-5">
              <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-200 flex items-center justify-center text-xl font-light bg-white hover:border-blue-400 transition-colors">-</button>
              <span className="font-black text-lg sm:text-xl">2</span>
              <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-200 flex items-center justify-center text-xl font-light bg-white hover:border-blue-400 transition-colors">+</button>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="mt-8 sm:mt-10 w-full bg-blue-600 text-white py-4 sm:py-5 rounded-2xl font-black text-base uppercase tracking-widest transition-all shadow-xl hover:bg-blue-700">
          Aplicar Filtros
        </button>
      </div>
    </div>
  );
};

const ComparisonModal = ({ tours, configs, onClose }: { tours: Tour[], configs: SelectedTourConfig[], onClose: () => void }) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
    <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-xl" onClick={onClose}></div>
    <div className="relative bg-white w-full max-w-6xl rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
      <div className="p-6 sm:p-8 border-b border-gray-100 flex items-center justify-between bg-white">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 uppercase tracking-tighter">Comparativa Detallada</h2>
        <button onClick={onClose} className="p-2 sm:p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-all active:scale-90">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <div className="flex-1 overflow-x-auto p-4 sm:p-8 bg-gray-50/30">
        <div className="flex gap-4 sm:gap-8 min-w-[800px] md:min-w-[1000px]">
          {tours.map(t => {
            const config = configs.find(c => c.tourId === t.id);
            const price = t.prices.find(p => p.id === config?.selectedPriceId);
            return (
              <div key={t.id} className="flex-1 bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-gray-100 flex flex-col shadow-sm">
                <img src={t.image} className="w-full h-40 sm:h-48 object-cover rounded-[1.5rem] sm:rounded-[2rem] mb-6 shadow-md" alt={t.name} />
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-1 leading-none uppercase truncate">{t.name}</h3>
                <p className="text-[9px] sm:text-[10px] font-black text-blue-600 uppercase tracking-widest mb-6">{t.category}</p>
                
                <div className="space-y-4 sm:space-y-6 flex-1 text-sm">
                  <div className="flex justify-between border-b border-gray-50 pb-3">
                    <span className="font-bold text-gray-400 uppercase text-[8px] sm:text-[9px]">Formato</span>
                    <span className="font-black text-gray-900 text-xs sm:text-sm">{price?.label}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-50 pb-3">
                    <span className="font-bold text-gray-400 uppercase text-[8px] sm:text-[9px]">Precio Ref.</span>
                    <span className="font-black text-blue-600 text-xs sm:text-sm">${price?.amount}</span>
                  </div>
                  <div className="space-y-2">
                    <span className="font-bold text-gray-400 uppercase text-[8px] sm:text-[9px]">Itinerario:</span>
                    {(config?.customItinerary || t.itinerary).slice(0, 4).map((step, idx) => (
                      <div key={idx} className="flex gap-2 text-[10px] sm:text-[11px] font-bold text-gray-600">
                        <span className="text-blue-500 shrink-0">{step.time}</span>
                        <span className="truncate">{step.activity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  </div>
);

// --- MAIN APP COMPONENT ---

const FILTERS = ['Todos', 'Premium', 'Privado', 'Aventura', 'Cultural', 'Gastronomía'];

const App = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [selectedConfigs, setSelectedConfigs] = useState<SelectedTourConfig[]>([]);
  const [selectedTourDetail, setSelectedTourDetail] = useState<Tour | null>(null);
  const [isPricingOpen, setIsPricingOpen] = useState(true);
  const [isAddonsOpen, setIsAddonsOpen] = useState(true);

  const filteredTours = useMemo(() => {
    if (activeFilter === 'Todos') return TOURS;
    return TOURS.filter(t => t.category === activeFilter);
  }, [activeFilter]);

  const toggleSelection = (id: number) => {
    const exists = selectedConfigs.some(c => c.tourId === id);
    if (exists) {
      setSelectedConfigs(prev => prev.filter(c => c.tourId !== id));
    } else {
      const tour = TOURS.find(t => t.id === id);
      if (tour) {
        setSelectedConfigs(prev => [...prev, {
          tourId: tour.id,
          selectedPriceId: tour.prices[0].id,
          selectedAddonIds: [],
          customItinerary: tour.itinerary
        }]);
      }
    }
  };

  const saveConfig = (config: SelectedTourConfig) => {
    setSelectedConfigs(prev => {
      const exists = prev.some(c => c.tourId === config.tourId);
      if (exists) {
        return prev.map(c => c.tourId === config.tourId ? config : c);
      } else {
        return [...prev, config];
      }
    });
  };

  return (
    <div className="min-h-full flex flex-col bg-gray-50/30 selection:bg-blue-100">
      <Header onSearchClick={() => setIsSearchOpen(true)} />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      
      {selectedTourDetail && (
        <TourDetailModal 
          tour={selectedTourDetail} 
          selection={selectedConfigs.find(c => c.tourId === selectedTourDetail.id)}
          onSaveSelection={saveConfig}
          onClose={() => setSelectedTourDetail(null)} 
        />
      )}

      {isCompareOpen && (
        <ComparisonModal 
          tours={TOURS.filter(t => selectedConfigs.some(c => c.tourId === t.id))} 
          configs={selectedConfigs}
          onClose={() => setIsCompareOpen(false)} 
        />
      )}

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 sm:py-16 w-full">
        <section id="inicio" className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-white text-gray-900 border border-gray-200/70 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.45)] p-6 sm:p-10 lg:p-16 mb-12 sm:mb-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_60%)]"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-blue-50/40"></div>
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="h-px w-6 sm:w-8 bg-blue-600"></span>
                <span className="text-blue-600 font-black uppercase text-[9px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.4em]">Atitlán Restaurantes & Experiences</span>
              </div>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-5 text-gray-950">Más que tours: experiencias, gastronomía y servicio premium en el lago.</h2>
              <p className="text-sm sm:text-lg text-gray-600 font-medium leading-relaxed max-w-2xl">
                Creamos rutas de alto nivel para visitantes exigentes y también conectamos con nuestra propuesta gastronómica, hospitalidad y actividades privadas en el corazón de Atitlán.
              </p>
              <div className="mt-6 sm:mt-8 flex flex-wrap gap-3">
                <a href="#catalogo" className="bg-gray-950 text-white px-5 sm:px-7 py-3 sm:py-4 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-lg shadow-gray-900/20 hover:bg-blue-600">Ver catálogo</a>
                <a href="#contacto" className="bg-white text-gray-900 px-5 sm:px-7 py-3 sm:py-4 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest border border-gray-200 hover:border-gray-300">Contactar</a>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { title: 'Experiencias premium', detail: 'Tours privados, concierge y logística personalizada.' },
                { title: 'Gastronomía Atitlán', detail: 'Conectamos con AtitlánRestaurantes.com y aliados.' },
                { title: 'Cultura & bienestar', detail: 'Encuentros con artesanos y rituales locales.' },
                { title: 'Operación 360°', detail: 'Traslados, staff y coordinación total.' },
              ].map((item) => (
                <div key={item.title} className="bg-gray-50/80 border border-gray-200/70 rounded-2xl p-4 sm:p-5 shadow-sm">
                  <p className="text-sm font-black text-gray-900 mb-2">{item.title}</p>
                  <p className="text-[11px] sm:text-xs text-gray-500 font-medium">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="catalogo" className="scroll-mt-28">
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-6 sm:pb-12 scrollbar-hide">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)} className={`px-6 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] transition-all border-2 whitespace-nowrap ${activeFilter === f ? 'bg-gray-950 text-white border-gray-950 shadow-lg' : 'bg-white border-gray-100 text-gray-400 active:scale-95 hover:border-gray-900'}`}>{f}</button>
            ))}
          </div>

          <div className="mb-10 sm:mb-20">
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 mb-4"><span className="h-px w-6 sm:w-8 bg-blue-600"></span><span className="text-blue-600 font-black uppercase text-[9px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.4em]">Guatemala • Lago de Atitlán</span></div>
              <h2 className="text-3xl sm:text-6xl md:text-8xl font-black text-gray-950 mb-6 sm:mb-8 leading-[0.9] sm:leading-[0.85] tracking-tighter">CATÁLOGO PREMIUM.</h2>
              <p className="text-gray-500 text-base sm:text-xl md:text-2xl font-bold leading-relaxed max-w-2xl">14 Experiencias diseñadas por expertos locales para el viajero exigente. Personaliza tu propia ruta.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 lg:gap-16">
            {filteredTours.map(tour => (
              <div key={tour.id} className="relative group">
                <button 
                  onClick={() => toggleSelection(tour.id)} 
                  className={`absolute top-4 left-4 sm:top-5 sm:left-5 z-10 p-2.5 sm:p-3 rounded-2xl shadow-lg transition-all active:scale-90 ${selectedConfigs.some(c => c.tourId === tour.id) ? 'bg-blue-600 text-white scale-110 shadow-blue-200' : 'bg-white/95 text-gray-500 hover:text-blue-600'}`}
                >
                  {selectedConfigs.some(c => c.tourId === tour.id) ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>}
                </button>
                <div onClick={() => setSelectedTourDetail(tour)} className="cursor-pointer">
                  <article className="bg-white rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm group-hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <img src={tour.image} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-1000" alt={tour.name} loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/20 to-transparent"></div>
                      <div className="absolute bottom-6 left-6 right-6 text-white">
                        <div className="flex gap-2 mb-3">
                          {tour.isBestSeller && <span className="bg-blue-600 px-2.5 py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">POPULAR</span>}
                          <span className="bg-white/10 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest">{tour.category}</span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black leading-tight mb-1 tracking-tighter uppercase">{tour.name}</h3>
                        <p className="text-[10px] sm:text-xs text-white/70 line-clamp-2 font-bold tracking-wide italic">{tour.concept}</p>
                      </div>
                    </div>
                    <div className="p-5 sm:p-7 flex justify-between items-center bg-white border-t border-gray-50">
                      <div className="flex flex-col"><span className="text-[9px] sm:text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Desde</span><span className="text-2xl sm:text-3xl font-black text-gray-950">${tour.price}</span></div>
                      <button className="bg-gray-950 text-white px-5 sm:px-7 py-3 sm:py-4 rounded-xl sm:rounded-[1.25rem] font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl">DETALLE</button>
                    </div>
                  </article>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="esquema-precios" className="scroll-mt-28 mt-16 sm:mt-24">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white border border-gray-100 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-950">Esquema de precios (cómo funciona)</h2>
                  <p className="text-sm sm:text-base text-gray-500 font-medium mt-1">Definiciones consistentes para todos los tours.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPricingOpen(prev => !prev)}
                  className="shrink-0 w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-colors"
                  aria-expanded={isPricingOpen}
                  aria-controls="pricing-content"
                >
                  <svg className={`w-4 h-4 transition-transform ${isPricingOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/></svg>
                </button>
              </div>
              {isPricingOpen && (
                <div id="pricing-content" className="space-y-4 text-sm sm:text-base text-gray-700">
                  <div>
                    <h3 className="font-black text-gray-900">Shared Standard (precio base)</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Grupo: 8–12 pax.</li>
                      <li>Guía: bilingüe (EN/ES) compartido.</li>
                      <li>Ritmo: timing estándar (tour clásico).</li>
                      <li>Incluye: operación base del tour + agua.</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900">Shared Premium</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Grupo: 4–8 pax (más exclusivo).</li>
                      <li>Ritmo: más buffers, menos carreras.</li>
                      <li>
                        Incluye además:
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>Priority seating en restaurantes (mesa reservada / servicio más rápido cuando aplique).</li>
                          <li>Premium Perk: 1 beneficio tangible definido por tour (ej.: coffee flight, 2do consumo, snack real, headlamp, safe packing, etc.).</li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900">Shared All-in (solo si el tour tiene “terceros”)</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Lo mismo que Premium, pero ya incluye el costo de actividades de terceros (zipline, kayak/SUP, yoga/temazcal, etc.).</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900">Private (precio por grupo)</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Lancha/vehículo dedicado + host dedicado.</li>
                      <li>Ruta flexible (se ajusta ritmo/paradas).</li>
                      <li>Precio base incluye hasta 6 pax.</li>
                      <li>Persona adicional (si capacidad lo permite): USD 35 p/p.</li>
                    </ul>
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-400">Precios sugeridos. Sujeto a cambios según temporada y disponibilidad.</p>
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-100 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-950">Add-ons generales (opcionales)</h2>
                  <p className="text-sm sm:text-base text-gray-500 font-medium mt-1">Opcionales universales aplicables a cualquier tour.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddonsOpen(prev => !prev)}
                  className="shrink-0 w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-colors"
                  aria-expanded={isAddonsOpen}
                  aria-controls="addons-content"
                >
                  <svg className={`w-4 h-4 transition-transform ${isAddonsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/></svg>
                </button>
              </div>
              {isAddonsOpen && (
                <div id="addons-content" className="space-y-4 text-sm sm:text-base text-gray-700">
                  <div>
                    <h3 className="font-black text-gray-900">Transporte (a/desde Ciudad de Guatemala)</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Shared shuttle Guatemala City/Airport ↔ Panajachel: USD 32–40 p/p</li>
                      <li>
                        Private transfer Guatemala City ↔ Panajachel:
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>1–3 pax: USD 165–195 por vehículo</li>
                          <li>4–6 pax: USD 195–225 por vehículo</li>
                          <li>7–10 pax: USD 225–255 por vehículo</li>
                        </ul>
                      </li>
                      <li>Surcharge madrugada/tarde (si aplica): +USD 25–60</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900">Tiempo extra / flexibilidad</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Hora extra lancha privada (navegación + espera): USD 65–95 por hora</li>
                      <li>Hora extra con host/guía (si excede jornada): USD 25–45 por hora</li>
                      <li>Parada extra planificada (buffer + coordinación): USD 15–35 por grupo</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900">Guías y concierge</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>
                        Guía premium upgrade:
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>Half day: USD 40–80 por grupo</li>
                          <li>Full day: USD 80–150 por grupo</li>
                        </ul>
                      </li>
                      <li>
                        Intérprete 3er idioma (FR/DE/IT):
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>Half day: USD 120–220 por grupo</li>
                          <li>Full day: USD 220–350 por grupo</li>
                        </ul>
                      </li>
                      <li>Concierge WhatsApp (pre-trip + durante tour): USD 15–35 por reserva</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900">Foto / video / contenido</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Foto Mini (30–45 min, 15–25 fotos): USD 80–120</li>
                      <li>Foto Standard (60–90 min, 30–50 fotos): USD 150–230</li>
                      <li>Media jornada (3–4h): USD 350–550</li>
                      <li>Jornada completa (6–8h): USD 550–900</li>
                      <li>Drone add-on (clips + 5 fotos): USD 80–150</li>
                      <li>Reel vertical (30–60s editado): USD 250–450</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900">F&amp;B (upgrade universal)</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Coffee flight/tasting (3–4 muestras): USD 12–20 p/p</li>
                      <li>Upgrade bebida premium (vino/cóctel/beer): USD 8–15 p/p</li>
                      <li>Charcutería/tapas upgrade: USD 12–30 p/p</li>
                      <li>Botella extra (vino): USD 35–70 | Espumante: USD 45–120</li>
                      <li>Menú fijo 2–3 tiempos: USD 45–75 p/p</li>
                      <li>Maridaje 2–3 bebidas: +USD 18–35 p/p</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900">Actividades de terceros (si las integran como All-in)</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Yoga drop-in: USD 8–13 p/p</li>
                      <li>Temazcal: USD 19–39 p/p</li>
                      <li>Masaje 60 min: USD 26–52 p/p</li>
                      <li>Cacao ceremony: USD 13–33 p/p</li>
                      <li>Kayak/SUP (medio día): USD 10–16 p/p</li>
                      <li>Zipline: USD 52–78 p/p</li>
                      <li>Parapente tandem: USD 65–104 p/p</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900">Momentos especiales</h3>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Proposal kit (sin foto): USD 120–220</li>
                      <li>Proposal + foto mini: USD 220–380</li>
                      <li>Cumpleaños a bordo (mini cake + decoración + foto mini opcional): USD 90–160</li>
                    </ul>
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-400">Precios sugeridos. Sujeto a cambios según temporada y disponibilidad.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="conocenos" className="scroll-mt-28 mt-16 sm:mt-24">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="h-px w-6 sm:w-8 bg-blue-600"></span>
                <span className="text-blue-600 font-black uppercase text-[9px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.4em]">Conócenos</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-gray-950 mb-4">Somos mucho más que tours en el lago.</h2>
              <p className="text-gray-500 text-sm sm:text-base font-medium leading-relaxed">
                AtitlánRestaurantes.com y Atitlán Experiences comparten un mismo propósito: mostrar lo mejor del lago con un servicio auténtico,
                responsable y de alto nivel. Diseñamos experiencias completas que integran gastronomía, bienestar, cultura local y logística premium.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { title: 'Hospitalidad', detail: 'Equipo bilingüe y atención personalizada antes y durante el viaje.' },
                { title: 'Curaduría local', detail: 'Colaboramos con chefs, capitanes y artesanos de la zona.' },
                { title: 'Sostenibilidad', detail: 'Priorizamos aliados que cuidan la comunidad y el entorno.' },
                { title: 'Flexibilidad', detail: 'Ajustamos horarios, menús y actividades para cada grupo.' },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <p className="text-sm font-black text-gray-900 mb-2">{item.title}</p>
                  <p className="text-[11px] sm:text-xs text-gray-500 font-medium">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contacto" className="scroll-mt-28 mt-16 sm:mt-24">
          <div className="bg-white border border-gray-100 rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-12 shadow-sm">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="h-px w-6 sm:w-8 bg-blue-600"></span>
                  <span className="text-blue-600 font-black uppercase text-[9px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.4em]">Contacto</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-gray-950 mb-4">Hablemos de tu próxima experiencia.</h2>
                <p className="text-gray-500 text-sm sm:text-base font-medium leading-relaxed mb-6">
                  Escríbenos para cotizar tours privados, experiencias gastronómicas o programas corporativos. Nuestro equipo responde rápido y con opciones claras.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a href="https://wa.me/50222681264" target="_blank" className="bg-green-600 text-white px-5 sm:px-7 py-3 sm:py-4 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-green-500">WhatsApp</a>
                  <a href="mailto:hola@atitlancafe.com" className="bg-gray-950 text-white px-5 sm:px-7 py-3 sm:py-4 rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-blue-600">Email</a>
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 sm:p-6 space-y-4">
                <div>
                  <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Horario</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900">Lunes a Domingo · 8:00 a 20:00</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Zona</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900">Panajachel · San Juan · Santiago Atitlán</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-gray-400 mb-2">Atención</p>
                  <p className="text-sm sm:text-base font-bold text-gray-900">Reservas privadas, restaurantes aliados, eventos especiales.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Selection Bar - Optimized for Mobile Accessibility */}
      <div className={`fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 w-[96%] sm:w-[94%] max-w-2xl bg-gray-950 rounded-2xl sm:rounded-[2.5rem] shadow-2xl px-3 py-3 sm:px-5 sm:py-5 border border-white/10 text-white transition-all duration-700 ${selectedConfigs.length > 0 ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-40 opacity-0 scale-90 pointer-events-none'}`}>
        <div className="flex items-center justify-between gap-1.5 sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            <div className="flex -space-x-2.5 sm:-space-x-4 overflow-hidden p-0.5 shrink-0">
              {selectedConfigs.slice(0, 2).map(c => {
                const tour = TOURS.find(t => t.id === c.tourId);
                return (
                  <div key={c.tourId} className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl border-2 border-gray-950 overflow-hidden ring-1 ring-white/10">
                    <img src={tour?.image} className="w-full h-full object-cover" alt={tour?.name} />
                  </div>
                );
              })}
              {selectedConfigs.length > 2 && (
                <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl border-2 border-gray-950 bg-gray-800 flex items-center justify-center text-[9px] sm:text-[10px] font-bold">
                  +{selectedConfigs.length - 2}
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] sm:text-xs font-black uppercase tracking-tighter leading-none truncate">{selectedConfigs.length} Item{selectedConfigs.length > 1 ? 's' : ''}</span>
              <span className="text-[7px] sm:text-[9px] text-white/30 font-bold uppercase tracking-widest mt-1 hidden xs:block">Plan de viaje</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <button 
              onClick={() => setSelectedConfigs([])} 
              className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white px-1 sm:px-2"
            >
              Limpiar
            </button>
            {selectedConfigs.length > 1 && (
              <button 
                onClick={() => setIsCompareOpen(true)} 
                className="bg-white/10 text-white border border-white/20 px-2.5 sm:px-6 py-2 sm:py-3.5 rounded-xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95"
              >
                Comparar
              </button>
            )}
            <a 
              href={formatWhatsAppMessage(selectedConfigs)}
              target="_blank"
              className="bg-green-600 text-white px-4 sm:px-8 py-2 sm:py-3.5 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-green-500 active:scale-95 shadow-lg shadow-green-900/40"
            >
              RESERVAR
            </a>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-gray-100 pt-12 sm:pt-24 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 text-center sm:text-left">
          <div>
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-gray-400">Atitlán Premium Experiences</p>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-2">Más que tours: experiencias, gastronomía y hospitalidad en el lago.</p>
          </div>
          <div className="flex flex-wrap justify-center sm:justify-end gap-4 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-gray-400">
            <a href="#inicio" className="hover:text-gray-900 transition-colors">Inicio</a>
            <a href="#catalogo" className="hover:text-gray-900 transition-colors">Catálogo</a>
            <a href="#conocenos" className="hover:text-gray-900 transition-colors">Conócenos</a>
            <a href="#contacto" className="hover:text-gray-900 transition-colors">Contacto</a>
          </div>
        </div>
        <div className="mt-8 text-center text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-gray-300">
          © 2026 IG @AINURPROMOTIONS . TODOS LOS DERECHOS RESERVADOS.
        </div>
      </footer>
    </div>
  );
};

export default App;
