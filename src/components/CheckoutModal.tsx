import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

type CheckoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cartTotal, clearCart } = useStore();
  const [step, setStep] = useState<1 | 2>(1); // 1: form, 2: success

  if (!isOpen) return null;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => {
      setStep(2);
      clearCart();
    }, 1500); // simulate processing
  };

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleClose} />
      
      <div className="relative w-full max-w-lg bg-zinc-950 shadow-2xl rounded-2xl overflow-hidden text-white border border-zinc-800">
        {step === 1 ? (
          <>
            <div className="bg-black border-b border-zinc-900 p-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <ShieldCheck size={20} className="text-green-500" />
                Pagamento Seguro
              </h2>
              <button onClick={handleClose} className="text-gray-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCheckout} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Nome Completo</label>
                  <input required type="text" className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all font-medium text-white placeholder:text-zinc-700" placeholder="João da Silva" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">E-mail</label>
                  <input required type="email" className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all font-medium text-white placeholder:text-zinc-700" placeholder="joao@exemplo.com" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Cartão de Crédito</label>
                    <input required type="text" className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all font-medium text-white placeholder:text-zinc-700" placeholder="0000 0000 0000 0000" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Validade / CVV</label>
                    <div className="flex gap-2">
                      <input required type="text" className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all font-medium text-white placeholder:text-zinc-700" placeholder="MM/AA" />
                      <input required type="text" className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold transition-all font-medium text-white placeholder:text-zinc-700" placeholder="123" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-zinc-900 flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-gray-400 font-medium">Total a pagar:</span>
                  <p className="font-black text-lg text-gold">R$ {cartTotal.toFixed(2).replace('.', ',')}</p>
                </div>
                <button
                  type="submit"
                  className="bg-gold text-black px-6 py-3 text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-yellow-500 transition-colors"
                >
                  Finalizar Pedido
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <CheckCircle size={64} className="text-gold mb-4" />
            <h2 className="text-2xl font-black text-white mb-2">Seu Pedido foi <span className="text-gold italic">Confirmado!</span></h2>
            <p className="text-gray-400 mb-8 font-medium">
              Agradecemos a preferência. Você receberá o código de rastreamento por e-mail em breve.
            </p>
            <button
              onClick={handleClose}
              className="bg-gold text-black px-8 py-3 text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-yellow-500 transition-colors"
            >
              Voltar ao Início
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
