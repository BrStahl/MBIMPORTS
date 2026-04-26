import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
};

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onCheckout }) => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useStore();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-zinc-950 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out text-white border-l border-zinc-900">
        <div className="flex items-center justify-between p-4 border-b border-zinc-900">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShoppingBag size={20} className="text-gold" />
            Seu Carrinho
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-500 gap-4">
              <ShoppingBag size={48} className="text-zinc-700" />
              <p className="font-medium text-gray-400">Seu carrinho está vazio.</p>
              <button 
                onClick={onClose}
                className="mt-4 border border-gold text-gold px-6 py-2 uppercase tracking-widest text-sm font-bold hover:bg-gold hover:text-black transition-colors rounded-xl"
              >
                Voltar aos Produtos
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-4 border-b border-zinc-900 pb-4">
                <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-900">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover object-center"
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex justify-between text-sm font-bold text-white">
                      <h3 className="line-clamp-1">{item.name}</h3>
                      <p className="ml-4 whitespace-nowrap text-gold">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 capitalize">{item.category}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center border border-zinc-800 rounded-md">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 px-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-2 font-bold text-xs text-white">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 px-2 text-gray-400 hover:text-white transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="font-medium text-slate-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-zinc-900 p-6 bg-black">
            <div className="flex justify-between text-base font-bold text-white mb-4">
              <p>Total do Pedido</p>
              <p className="text-gold">R$ {cartTotal.toFixed(2).replace('.', ',')}</p>
            </div>
            <p className="mt-0.5 text-xs text-center text-gray-500 mb-6 font-medium">
              Taxas de frete calculadas na próxima etapa.
            </p>
            <button
               onClick={() => {
                 onClose();
                 onCheckout();
               }}
              className="w-full flex items-center justify-center rounded-xl bg-gold px-6 py-4 text-sm font-bold uppercase tracking-widest text-black shadow-sm hover:bg-yellow-500 transition-colors"
            >
              Ir para o Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};
