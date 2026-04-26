import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black border-t border-zinc-900 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <span className="font-sans font-black text-2xl tracking-tighter text-white italic block mb-4">
              MB <span className="text-gold">IMPORTS</span>
            </span>
            <p className="text-gray-400 text-sm leading-relaxed">
              Moda masculina com qualidade superior.<br/> Estilo e design em cada detalhe.
            </p>
          </div>
          
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Nossa Loja</h3>
            <ul className="space-y-3">
              <li><a href="#" className="font-medium text-sm text-gray-400 hover:text-gold transition-colors">Moda Masculina</a></li>
              <li><a href="#" className="font-medium text-sm text-gray-400 hover:text-gold transition-colors">Acessórios</a></li>
              <li><a href="#" className="font-medium text-sm text-gray-400 hover:text-gold transition-colors">Lançamentos</a></li>
              <li><a href="#" className="font-medium text-sm text-gray-400 hover:text-gold transition-colors">Em Promoção</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Atendimento</h3>
            <ul className="space-y-3">
              <li><a href="#" className="font-medium text-sm text-gray-400 hover:text-gold transition-colors">Fale Conosco</a></li>
              <li><a href="#" className="font-medium text-sm text-gray-400 hover:text-gold transition-colors">Rastreie seu Pedido</a></li>
              <li><a href="#" className="font-medium text-sm text-gray-400 hover:text-gold transition-colors">Trocas e Devoluções</a></li>
              <li><a href="#" className="font-medium text-sm text-gray-400 hover:text-gold transition-colors">Perguntas Frequentes</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Novidades</h3>
            <p className="text-sm text-gray-400 mb-4 font-medium">
              Acompanhe as tendências e receba ofertas exclusivas no seu email.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Seu e-mail"
                className="w-full border-y border-l border-zinc-800 bg-zinc-900 border-solid text-white rounded-none px-3 py-2 text-sm focus:outline-none focus:border-gold"
              />
              <button className="bg-gold text-black px-4 py-2 text-sm font-bold uppercase tracking-widest hover:bg-yellow-500 transition-colors">
                Assinar
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-zinc-900 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm font-medium text-gray-500">
          <p>&copy; {new Date().getFullYear()} MB Imports. Todos os direitos reservados.</p>
          <div className="flex space-x-4 mt-4 md:mt-0 gap-4">
            <span className="hover:text-gold transition-colors cursor-pointer uppercase text-xs tracking-widest font-bold">Instagram</span>
            <span className="hover:text-gold transition-colors cursor-pointer uppercase text-xs tracking-widest font-bold">Tiktok</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
