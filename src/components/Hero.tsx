import React from 'react';

export const Hero: React.FC = () => {
  return (
    <div className="flex-1 flex overflow-hidden">
      <section className="w-full relative bg-zinc-900 flex items-center justify-center p-12 lg:h-[600px] h-[500px]">
        {/* We keep the image for background structure, but add sleek overlay */}
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover opacity-30 invert"
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=2000"
            alt="Fashion storefront"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-black to-zinc-900/80 opacity-90"></div>
        </div>
        
        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center sm:items-start text-center sm:text-left">
          <span className="text-gold font-bold tracking-[0.3em] uppercase text-xs mb-4 block">Somente os Melhores Looks</span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-white leading-[0.9] mb-8">
            O Estilo Que<br/><span className="font-black italic text-gold">Define Você.</span>
          </h1>
          <p className="text-gray-400 max-w-sm mb-10 leading-relaxed border-l-2 border-gold pl-4">
            Seleção exclusiva da MB Imports. Peças premium para você se destacar em qualquer ocasião com muito conforto.
          </p>
          <button 
            onClick={() => window.scrollTo({ top: document.getElementById('products')?.offsetTop, behavior: 'smooth' })}
            className="bg-white text-black px-10 py-4 font-bold uppercase tracking-widest text-sm hover:bg-gold hover:text-white transition-colors shadow-lg shadow-white/5"
          >
            Ver Coleção
          </button>
        </div>
      </section>
    </div>
  );
};
