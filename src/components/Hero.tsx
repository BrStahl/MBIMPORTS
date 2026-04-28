import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';

export const Hero: React.FC = () => {
  const navigate = useNavigate();
  const { banners, loading } = useStore();
  const activeBanners = banners.filter(b => b.status === 'active');
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  const next = () => setCurrent((prev) => (prev + 1) % activeBanners.length);
  const prev = () => setCurrent((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);

  if (loading) return (
    <div className="h-[80vh] flex items-center justify-center bg-gray-50">
      <div className="w-12 h-12 border-4 border-gold border-t-black rounded-full animate-spin" />
    </div>
  );

  if (activeBanners.length === 0) {
    return (
      <div className="relative h-[85vh] min-h-[600px] flex items-center overflow-hidden bg-white">
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover object-[center_30%] opacity-10 grayscale"
            src="https://images.unsplash.com/photo-1550928431-ee0ec6db30d3?auto=format&fit=crop&q=80&w=2000"
            alt="Fashion Lifestyle"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent" />
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-10">
              <span className="bg-black text-white px-5 py-2 text-[10px] font-black uppercase tracking-[0.4em] rounded-full shadow-lg">
                Nova Coleção 2024
              </span>
              <div className="h-[2px] w-16 bg-gold"></div>
            </div>
            
            <h1 className="text-7xl sm:text-8xl lg:text-9xl font-black text-black leading-[0.85] tracking-tighter mb-10 transition-all">
              <span className="block drop-shadow-sm">ESTILO</span>
              <span className="text-gold italic block drop-shadow-md">MB IMPORTS</span>
            </h1>

            <p className="text-gray-400 text-lg sm:text-xl max-w-xl mb-14 font-bold leading-relaxed uppercase tracking-tight">
              Curadoria excepcional de moda masculina premium para quem exige o extraordinário.
            </p>

            <div className="flex flex-col sm:flex-row gap-6">
              <button 
                onClick={() => navigate('/catalogo')}
                className="relative group bg-gold text-black px-16 py-8 font-black uppercase tracking-[0.25em] text-xs transition-all active:scale-95 shadow-[0_20px_50px_rgba(212,175,55,0.4)] overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-4">
                  Começar a Comprar
                  <ArrowRight size={20} className="transition-transform group-hover:translate-x-3" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
                <div className="absolute -inset-1 bg-gold opacity-30 blur-xl group-hover:opacity-50 transition-opacity animate-pulse" />
              </button>

              <button 
                onClick={() => navigate('/catalogo')}
                className="px-16 py-8 border-2 border-black text-black font-black uppercase tracking-[0.25em] text-xs hover:bg-black hover:text-white transition-all active:scale-95 flex items-center justify-center"
              >
                Ver Catálogo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[80vh] min-h-[600px] overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <img
            src={activeBanners[current].image}
            className="w-full h-full object-cover opacity-60"
            alt={activeBanners[current].title || 'Banner'}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-20 h-full max-w-7xl mx-auto px-4 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="bg-gold text-black px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-full animate-pulse shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                Coleção 2024
              </span>
              <div className="h-[1px] w-12 bg-white/30"></div>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8 drop-shadow-2xl">
              {activeBanners[current].title?.split(' ').map((word, i) => (
                <span key={i} className={i % 2 === 1 ? 'text-gold italic block' : 'block'}>
                  {word}
                </span>
              )) || 'EXCLUSIDADE EM CADA DETALHE'}
            </h1>
            
            {activeBanners[current].link ? (
              <div className="flex flex-col sm:flex-row gap-5">
                <button 
                  onClick={() => navigate(activeBanners[current].link!)}
                  className="bg-gold text-black px-14 py-7 font-black uppercase tracking-[0.2em] text-[11px] hover:bg-white hover:scale-105 transition-all shadow-[0_20px_50px_rgba(212,175,55,0.3)] flex items-center justify-center gap-3 active:scale-95 group"
                >
                  Garantir Agora
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-2" />
                </button>
                <button 
                  onClick={() => navigate('/catalogo')}
                  className="bg-white/5 backdrop-blur-xl border border-white/20 text-white px-14 py-7 font-black uppercase tracking-[0.2em] text-[11px] hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  Ver Catálogo
                </button>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/catalogo')}
                className="bg-gold text-black px-14 py-7 font-black uppercase tracking-[0.2em] text-[11px] hover:bg-white hover:scale-105 transition-all shadow-[0_20px_50px_rgba(212,175,55,0.3)] flex items-center justify-center gap-3 active:scale-95 group"
              >
                Comprar Agora
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-2" />
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {activeBanners.length > 1 && (
        <>
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-30">
            {activeBanners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-12 h-1 transition-all duration-500 rounded-full ${i === current ? 'bg-gold w-16' : 'bg-white/30'}`}
              />
            ))}
          </div>
          <div className="absolute inset-y-0 left-4 right-4 flex items-center justify-between z-30 pointer-events-none">
            <button 
              onClick={prev}
              className="p-4 bg-black/20 hover:bg-gold transition-all rounded-full text-white pointer-events-auto backdrop-blur-sm"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={next}
              className="p-4 bg-black/20 hover:bg-gold transition-all rounded-full text-white pointer-events-auto backdrop-blur-sm"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
