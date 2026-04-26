import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, CreditCard, MapPin } from 'lucide-react';
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
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      
      <div className="relative w-full max-w-2xl bg-white shadow-2xl rounded-2xl overflow-hidden text-black border border-gray-100 max-h-[90vh] flex flex-col">
        {step === 1 ? (
          <>
            <div className="bg-gray-50 border-b border-gray-100 p-6 flex items-center justify-between">
              <h2 className="text-xl font-black text-black tracking-tight flex items-center gap-2 uppercase">
                <ShieldCheck size={24} className="text-gold" />
                Checkout Seguro
              </h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-black transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCheckout} className="p-8 overflow-y-auto space-y-8">
              {/* Personal Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">
                  <CheckCircle size={14} className="text-gold" /> Dados Pessoais
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required type="text" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-gold transition-all font-bold" placeholder="Nome Completo" />
                  <input required type="email" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-gold transition-all font-bold" placeholder="E-mail" />
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">
                  <MapPin size={14} className="text-gold" /> Endereço de Entrega
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <input required type="text" className="col-span-2 w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-gold transition-all font-bold" placeholder="Rua / Avenida" />
                  <input required type="text" className="col-span-1 w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-gold transition-all font-bold" placeholder="Número" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input required type="text" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-gold transition-all font-bold" placeholder="Bairro" />
                  <input required type="text" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-gold transition-all font-bold" placeholder="Cidade" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input required type="text" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-gold transition-all font-bold" placeholder="CEP" />
                  <input required type="text" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-gold transition-all font-bold" placeholder="Estado" />
                </div>
              </div>

              {/* Payment */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">
                  <CreditCard size={14} className="text-gold" /> Pagamento
                </div>
                <input required type="text" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-gold transition-all font-bold" placeholder="Número do Cartão" />
                <div className="grid grid-cols-2 gap-4">
                  <input required type="text" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-gold transition-all font-bold" placeholder="MM/AA" />
                  <input required type="password" title="CVV" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-gold transition-all font-bold" placeholder="CVV" />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">Total</span>
                  <p className="font-black text-2xl text-black">R$ {cartTotal.toFixed(2).replace('.', ',')}</p>
                </div>
                <button
                  type="submit"
                  className="bg-black text-white px-10 py-5 text-xs font-black uppercase tracking-[0.2em] rounded-xl hover:bg-gold transition-all shadow-xl active:scale-95"
                >
                  Finalizar Pedido
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center mb-8">
              <CheckCircle size={48} className="text-gold" />
            </div>
            <h2 className="text-3xl font-black text-black mb-4 uppercase tracking-tight">Pedido <span className="text-gold italic">Confirmado!</span></h2>
            <p className="text-gray-500 font-medium max-w-xs mb-10 leading-relaxed uppercase tracking-widest text-[10px]">
              Obrigado por escolher a MB Imports. Você receberá os detalhes no seu e-mail.
            </p>
            <button
              onClick={handleClose}
              className="w-full bg-black text-white px-10 py-5 text-xs font-black uppercase tracking-[0.2em] rounded-xl hover:bg-gold transition-all shadow-xl"
            >
              Voltar ao Início
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
