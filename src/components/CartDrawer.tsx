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
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-[60] w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out text-black border-l border-gray-100">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-black text-black uppercase tracking-tight flex items-center gap-2">
            <ShoppingBag size={20} className="text-gold" />
            Seu Carrinho
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-black transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-500 gap-4">
              <ShoppingBag size={64} className="text-gray-100" />
              <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">O carrinho está vazio</p>
              <button 
                onClick={onClose}
                className="mt-4 bg-black text-white px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-gold transition-colors shadow-lg"
              >
                Explorar Loja
              </button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={`${item.productId}-${item.color}-${item.size}-${idx}`} className="flex gap-4 border-b border-gray-50 pb-6 last:border-0">
                <div className="h-28 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50 border border-gray-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover object-center"
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex justify-between text-sm font-black text-black">
                      <h3 className="line-clamp-1 uppercase tracking-tight">{item.name}</h3>
                      <p className="ml-4 whitespace-nowrap">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                        {item.color}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                        Tam: {item.size}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-10">
                      <button 
                        onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity - 1)}
                        className="p-2 px-3 text-gray-400 hover:text-black hover:bg-gray-50 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 font-black text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity + 1)}
                        className="p-2 px-3 text-gray-400 hover:text-black hover:bg-gray-50 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.productId, item.color, item.size)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-gray-100 p-8 bg-gray-50/50">
            <div className="flex justify-between text-lg font-black text-black mb-1">
              <p className="uppercase tracking-tight">Subtotal</p>
              <p>R$ {cartTotal.toFixed(2).replace('.', ',')}</p>
            </div>
            <p className="mt-0.5 text-xs text-gray-400 mb-8 font-bold uppercase tracking-widest">
              Frete calculado no próximo passo
            </p>
            <button
               onClick={() => {
                 onClose();
                 onCheckout();
               }}
              className="w-full flex items-center justify-center rounded-xl bg-black px-6 py-5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl hover:bg-gold transition-all active:scale-95"
            >
              Finalizar Pedido
            </button>
          </div>
        )}
      </div>
    </>
  );
};
