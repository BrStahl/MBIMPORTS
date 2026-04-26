import React from 'react';
import { Mail, Phone, MessageSquare, MapPin, ShieldCheck, RefreshCw, ClipboardList } from 'lucide-react';

export const About: React.FC = () => (
  <div className="flex-1 bg-white pb-24">
    <div className="bg-gray-50 py-24 mb-16 border-b border-gray-100">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-black text-black uppercase tracking-tight mb-8">Sobre a <span className="text-gold italic">MB Imports</span></h1>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm leading-relaxed">
          Nossa missão é trazer o que há de mais refinado na moda masculina internacional diretamente para seu guarda-roupa, com curadoria exclusiva e qualidade excepcional.
        </p>
      </div>
    </div>
    
    <div className="max-w-4xl mx-auto px-4 prose prose-zinc lg:prose-lg">
      <p className="font-medium text-gray-600 leading-loose">
        Fundada com a visão de redefinir o estilo masculino, a MB Imports não é apenas uma loja de roupas; é uma experiência de curadoria. 
        Viajamos pelo mundo em busca de tecidos premium, cortes impecáveis e designs que transcendem temporadas.
      </p>
      <h2 className="text-2xl font-black uppercase tracking-tight text-black mt-12 mb-6">Nossa Curadoria</h2>
      <p className="font-medium text-gray-600 leading-loose">
        Cada peça em nosso catálogo passa por um processo rigoroso de seleção. Avaliamos a durabilidade, o conforto e, claro, o fator estético. 
        Nossa especialidade é o Fast Fashion de luxo, trazendo tendências globais com a agilidade que o homem moderno exige.
      </p>
    </div>
  </div>
);

export const Contact: React.FC = () => (
  <div className="flex-1 bg-white pb-24">
    <div className="bg-gray-50 py-24 mb-16 border-b border-gray-100">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-black text-black uppercase tracking-tight mb-8">Fale <span className="text-gold italic">Conosco</span></h1>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Estamos prontos para te atender</p>
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="space-y-12">
        <div className="flex gap-6 items-start">
          <div className="p-4 bg-gray-50 rounded-2xl text-gold shadow-sm"><Phone size={32} /></div>
          <div>
            <h3 className="text-xl font-black text-black uppercase tracking-tight mb-2">WhatsApp</h3>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-4">Atendimento rápido e personalizado</p>
            <a href="https://wa.me/5511999999999" target="_blank" rel="noreferrer" className="text-2xl font-black text-black hover:text-gold transition-colors">(11) 99999-9999</a>
          </div>
        </div>

        <div className="flex gap-6 items-start">
          <div className="p-4 bg-gray-50 rounded-2xl text-gold shadow-sm"><Mail size={32} /></div>
          <div>
            <h3 className="text-xl font-black text-black uppercase tracking-tight mb-2">E-mail</h3>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-4">Envie suas dúvidas a qualquer momento</p>
            <a href="mailto:contato@mbimports.com.br" className="text-xl font-black text-black hover:text-gold transition-colors">contato@mbimports.com.br</a>
          </div>
        </div>

        <div className="flex gap-6 items-start">
          <div className="p-4 bg-gray-50 rounded-2xl text-gold shadow-sm"><MapPin size={32} /></div>
          <div>
            <h3 className="text-xl font-black text-black uppercase tracking-tight mb-2">Sede</h3>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-4">São Paulo, SP</p>
            <p className="text-lg font-black text-black">Avenida Berrini, 1000 - Brooklin</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-10 lg:p-16 rounded-[3rem] border border-gray-100 shadow-xl">
        <h3 className="text-2xl font-black text-black uppercase tracking-tight mb-8">Envie uma Mensagem</h3>
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input type="text" placeholder="Nome" className="w-full bg-white border border-gray-100 rounded-xl p-4 font-bold text-sm outline-none focus:border-gold transition-all" />
            <input type="email" placeholder="E-mail" className="w-full bg-white border border-gray-100 rounded-xl p-4 font-bold text-sm outline-none focus:border-gold transition-all" />
          </div>
          <input type="text" placeholder="Assunto" className="w-full bg-white border border-gray-100 rounded-xl p-4 font-bold text-sm outline-none focus:border-gold transition-all" />
          <textarea rows={4} placeholder="Sua mensagem" className="w-full bg-white border border-gray-100 rounded-xl p-4 font-bold text-sm outline-none focus:border-gold transition-all"></textarea>
          <button className="w-full bg-black text-white py-5 rounded-xl font-black uppercase tracking-[0.2em] text-xs hover:bg-gold transition-all shadow-xl">Enviar Mensagem</button>
        </form>
      </div>
    </div>
  </div>
);

const PolicyLayout: React.FC<{ title: string; subtitle: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, subtitle, icon, children }) => (
  <div className="flex-1 bg-white pb-24">
    <div className="bg-gray-50 py-24 mb-16 border-b border-gray-100">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <div className="text-gold flex justify-center mb-6">{icon}</div>
        <h1 className="text-5xl font-black text-black uppercase tracking-tight mb-8">{title}</h1>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">{subtitle}</p>
      </div>
    </div>
    <div className="max-w-4xl mx-auto px-4 prose prose-zinc lg:prose-lg font-medium text-gray-600 leading-loose">
      {children}
    </div>
  </div>
);

export const ExchangePolicy: React.FC = () => (
  <PolicyLayout 
    title="Política de Troca" 
    subtitle="Transparência e respeito ao cliente"
    icon={<RefreshCw size={64} />}
  >
    <h2>Como funciona?</h2>
    <p>Nossa política de trocas e devoluções é pautada no Código de Defesa do Consumidor. Você tem até 7 dias corridos após o recebimento para solicitar a troca ou devolução por arrependimento.</p>
    <ul>
      <li>O produto deve estar com a etiqueta original fixada.</li>
      <li>Não pode apresentar sinais de uso ou lavagem.</li>
      <li>A primeira troca é totalmente gratuita (frete por nossa conta).</li>
    </ul>
  </PolicyLayout>
);

export const PrivacyPolicy: React.FC = () => (
  <PolicyLayout 
    title="Privacidade" 
    subtitle="Segurança total dos seus dados"
    icon={<ShieldCheck size={64} />}
  >
    <p>A MB Imports se compromete com a privacidade e a segurança de seus clientes durante todo o processo de navegação e compra pelo site.</p>
    <p>Os dados cadastrais dos clientes não são vendidos, trocados ou divulgados para terceiros, exceto quando essas informações são necessárias para o processo de entrega ou para cobrança.</p>
  </PolicyLayout>
);

export const TermsOfUse: React.FC = () => (
  <PolicyLayout 
    title="Termos de Uso" 
    subtitle="Regras de utilização da plataforma"
    icon={<ClipboardList size={64} />}
  >
    <p>Ao acessar o site da MB Imports, você concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis.</p>
    <p>O uso comercial de qualquer conteúdo do nosso site sem autorização prévia por escrito é estritamente proibido.</p>
  </PolicyLayout>
);
