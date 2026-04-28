import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, CreditCard, MapPin } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

type CheckoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cart, cartTotal, clearCart } = useStore();
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2>(1); // 1: form, 2: success
  const [isProcessing, setIsProcessing] = useState(false);
  const [useExistingAddress, setUseExistingAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState('');

  React.useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      setUseExistingAddress(true);
      setSelectedAddressId(user.addresses[0].id?.toString() || '');
    }
  }, [user]);

  // Form State
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    cep: '',
    estado: ''
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error('Seu carrinho está vazio.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Criar o Pedido no Supabase
      let finalAddress = '';
      if (useExistingAddress && selectedAddressId && user?.addresses) {
        const addr = user.addresses.find((a: any) => a.id.toString() === selectedAddressId);
        if (addr) {
          finalAddress = `${addr.rua}, ${addr.numero} - ${addr.bairro}, ${addr.cidade} - ${addr.estado} CEP: ${addr.cep}`;
        }
      }
      
      if (!finalAddress) {
        finalAddress = `${formData.rua}, ${formData.numero} - ${formData.bairro}, ${formData.cidade} - ${formData.estado} CEP: ${formData.cep}`;
      }

      let clienteId = user?.uid;

      const pedidoData: any = {
        status: 'aguardando_pagamento',
        valor_total: cartTotal,
        total: cartTotal,
        endereco_entrega: finalAddress
      };

      if (clienteId) {
        pedidoData.cliente_id = clienteId;
      }

      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .insert([pedidoData])
        .select()
        .single();

      if (pedidoError) throw pedidoError;

      // 2. Inserir itens do pedido
      const itensData = cart.map((item: any) => ({
        pedido_id: pedido.id,
        produto_id: item.id || item.productId,
        quantidade: item.quantity,
        preco_unitario: item.price,
        subtotal: Number(item.quantity) * Number(item.price),
        nome_produto: item.name,
        cor: item.color || '',
        tamanho: item.size || ''
      }));

      const { error: itensError } = await supabase
        .from('itens_pedidos')
        .insert(itensData);

      if (itensError) throw itensError;

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pedidoId: pedido.id,
          items: cart.map(item => ({
            name: item.name,
            image: item.image || item.imagem_url,
            price: item.price,
            quantity: item.quantity,
            color: item.color,
            size: item.size
          })),
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Erro ao gerar sessão Stripe.');
      }

      const session = await response.json();
      window.location.href = session.url;
      
    } catch (error: any) {
      console.error('Erro ao finalizar pedido:', error);
      toast.error('Erro ao processar pagamento. ' + (error.message || ''));
      setIsProcessing(false);
    }
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
              {!user && (
                 <div className="bg-yellow-50 text-yellow-600 p-4 border border-yellow-100 rounded-xl text-sm font-bold">
                   Aviso: Você não está logado. Seu pedido será criado, mas você não poderá acompanhá-lo no painel de usuário. Faça login antes se desejar acompanhar!
                 </div>
              )}
              {/* Personal Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">
                  <CheckCircle size={14} className="text-gold" /> Dados Pessoais
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input required name="nome" value={formData.nome} onChange={handleChange} type="text" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-gold transition-all font-bold" placeholder="Nome Completo" />
                  <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-gold transition-all font-bold" placeholder="E-mail" />
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    <MapPin size={14} className="text-gold" /> Endereço de Entrega
                  </div>
                  {user && user.addresses && user.addresses.length > 0 && (
                    <button type="button" onClick={() => setUseExistingAddress(!useExistingAddress)} className="text-[10px] font-bold text-gold uppercase hover:underline">
                      {useExistingAddress ? 'Digitar Novo Endereço' : 'Usar Endereço Salvo'}
                    </button>
                  )}
                </div>
                
                {useExistingAddress && user?.addresses && user.addresses.length > 0 ? (
                  <select
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-gold transition-all font-bold"
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                  >
                    {user.addresses.map((addr: any) => (
                      <option key={addr.id} value={addr.id}>
                        {addr.rua}, {addr.numero} - {addr.bairro}, {addr.cidade} - {addr.estado} CEP: {addr.cep}
                      </option>
                    ))}
                  </select>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <input required={!useExistingAddress} name="rua" value={formData.rua} onChange={handleChange} type="text" className="col-span-2 w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-gold transition-all font-bold" placeholder="Rua / Avenida" />
                      <input required={!useExistingAddress} name="numero" value={formData.numero} onChange={handleChange} type="text" className="col-span-1 w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-gold transition-all font-bold" placeholder="Número" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input required={!useExistingAddress} name="bairro" value={formData.bairro} onChange={handleChange} type="text" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-gold transition-all font-bold" placeholder="Bairro" />
                      <input required={!useExistingAddress} name="cidade" value={formData.cidade} onChange={handleChange} type="text" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-gold transition-all font-bold" placeholder="Cidade" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input required={!useExistingAddress} name="cep" value={formData.cep} onChange={handleChange} type="text" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-gold transition-all font-bold" placeholder="CEP" />
                      <input required={!useExistingAddress} name="estado" value={formData.estado} onChange={handleChange} type="text" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-gold transition-all font-bold" placeholder="Estado" />
                    </div>
                  </>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">Total</span>
                  <p className="font-black text-2xl text-black">R$ {cartTotal.toFixed(2).replace('.', ',')}</p>
                </div>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="bg-black text-white px-10 py-5 text-xs font-black uppercase tracking-[0.2em] rounded-xl hover:bg-gold transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isProcessing ? 'Processando...' : 'Finalizar Pedido'}
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

