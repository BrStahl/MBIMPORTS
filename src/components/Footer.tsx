import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, MessageCircle, Phone, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="font-sans font-black text-2xl tracking-tighter text-black block mb-6">
              MB <span className="text-gold italic">IMPORTS</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed font-medium">
              Curadoria exclusiva de moda masculina premium. Elevando seu estilo com peças que definem personalidade e sofisticação.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="p-2 bg-gray-50 rounded-full text-black hover:text-gold transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="p-2 bg-gray-50 rounded-full text-black hover:text-gold transition-colors">
                <MessageCircle size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Loja</h3>
            <ul className="space-y-4">
              <li><Link to="/catalogo" className="font-bold text-sm text-black hover:text-gold transition-colors uppercase tracking-tight">Novidades</Link></li>
              <li><Link to="/catalogo?cat=men" className="font-bold text-sm text-black hover:text-gold transition-colors uppercase tracking-tight">Roupas</Link></li>
              <li><Link to="/catalogo?cat=shoes" className="font-bold text-sm text-black hover:text-gold transition-colors uppercase tracking-tight">Calçados</Link></li>
              <li><Link to="/catalogo?cat=accessories" className="font-bold text-sm text-black hover:text-gold transition-colors uppercase tracking-tight">Acessórios</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Ajuda & Políticas</h3>
            <ul className="space-y-4">
              <li><Link to="/contato" className="font-bold text-sm text-black hover:text-gold transition-colors uppercase tracking-tight">Contato</Link></li>
              <li><Link to="/politica-troca" className="font-bold text-sm text-black hover:text-gold transition-colors uppercase tracking-tight">Trocas e Devoluções</Link></li>
              <li><Link to="/privacidade" className="font-bold text-sm text-black hover:text-gold transition-colors uppercase tracking-tight">Privacidade</Link></li>
              <li><Link to="/termos" className="font-bold text-sm text-black hover:text-gold transition-colors uppercase tracking-tight">Termos de Uso</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Contato</h3>
            <ul className="space-y-4 text-sm font-bold">
              <li className="flex items-center gap-3 text-black transition-colors">
                <Phone size={18} className="text-gold" />
                (11) 99999-9999
              </li>
              <li className="flex items-center gap-3 text-black transition-colors">
                <Mail size={18} className="text-gold" />
                contato@mbimports.com.br
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-100 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <p>&copy; {new Date().getFullYear()} MB Imports. Todos os direitos reservados.</p>
          <p className="mt-4 md:mt-0">Desenvolvido com sofisticação</p>
        </div>
      </div>
    </footer>
  );
};
