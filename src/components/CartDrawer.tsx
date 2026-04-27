import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, Loader2, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

// A public key can be handled here or inside the function.
// If we don't have it in env, we can use a dummy or just use standard.
// But wait, the prompt says "Implemente o checkout com Stripe" so we should use the test mode key.
// Actually, Stripe requires a publishable key on the frontend to redirect to checkout.
// Let's use the standard `loadStripe` approach but we only need it if we are using redirectToCheckout.
// Actually, our API returns `session.url`, so we can just do `window.location.href = session.url`. We don't even need `@stripe/stripe-js` to redirect!
// Let's just use `window.location.href = data.url;`.

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
};

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onCheckout }) => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const navigate = useNavigate();

  const handleStripeCheckout = async () => {
    try {
      setIsCheckingOut(true);
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: cart }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error in checkout:', error);
      toast.error('Erro ao processar checkout. Tente novamente.');
      setIsCheckingOut(false);
    }
  };

  const handleContinueShopping = () => {
    onClose();
    navigate('/catalogo');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50"
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-[60] w-full max-w-md bg-white shadow-2xl flex flex-col text-black border-l border-gray-100"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white z-10">
              <h2 className="text-xl font-black text-black uppercase tracking-tight flex items-center gap-2">
                <ShoppingBag size={20} className="text-gold" />
                Seu Carrinho
              </h2>
              <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {cart.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center flex-1 text-gray-500 gap-4"
                >
                  <ShoppingBag size={64} className="text-gray-100" />
                  <p className="font-bold text-gray-400 uppercase tracking-widest text-xs text-center">O carrinho está vazio</p>
                  <button 
                    onClick={handleContinueShopping}
                    className="mt-4 bg-black text-white px-8 py-3 uppercase tracking-widest text-xs font-bold hover:bg-gold transition-colors shadow-lg flex items-center gap-2"
                  >
                    Explorar Loja <ArrowRight size={16} />
                  </button>
                </motion.div>
              ) : (
                <AnimatePresence initial={false}>
                  {cart.map((item, idx) => (
                    <motion.div 
                      key={`${item.productId}-${item.color}-${item.size}`}
                      layout
                      initial={{ opacity: 0, height: 0, scale: 0.9, marginBottom: 0 }}
                      animate={{ opacity: 1, height: 'auto', scale: 1, marginBottom: 24 }}
                      exit={{ opacity: 0, height: 0, scale: 0.9, marginBottom: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex gap-4 border-b border-gray-50 pb-6 last:border-0"
                    >
                      <div className="h-28 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50 border border-gray-100">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>

                      <div className="flex flex-1 flex-col justify-between overflow-hidden">
                        <div>
                          <div className="flex justify-between text-sm font-black text-black">
                            <h3 className="line-clamp-1 uppercase tracking-tight truncate">{item.name}</h3>
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
                        
                        <div className="flex items-center justify-between text-sm mt-2">
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-10">
                            <button 
                              onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity - 1)}
                              className="p-2 px-3 text-gray-400 hover:text-black hover:bg-gray-50 transition-colors active:bg-gray-100"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-3 font-black text-sm w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.productId, item.color, item.size, item.quantity + 1)}
                              className="p-2 px-3 text-gray-400 hover:text-black hover:bg-gray-50 transition-colors active:bg-gray-100"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.productId, item.color, item.size)}
                            className="text-gray-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {cart.length > 0 && (
              <motion.div 
                layout
                className="border-t border-gray-100 p-8 bg-gray-50/50"
              >
                <div className="flex justify-between text-lg font-black text-black mb-1">
                  <p className="uppercase tracking-tight">Subtotal</p>
                  <motion.p
                    key={cartTotal}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    R$ {cartTotal.toFixed(2).replace('.', ',')}
                  </motion.p>
                </div>
                <p className="mt-0.5 text-xs text-gray-400 mb-6 font-bold uppercase tracking-widest">
                  Frete calculado no próximo passo
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={onCheckout}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl hover:bg-gold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Finalizar Pedido
                  </button>
                  <button 
                    onClick={handleContinueShopping}
                    className="w-full flex items-center justify-center rounded-xl bg-transparent px-6 py-4 text-xs font-bold uppercase tracking-[0.1em] text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    Continuar Comprando
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

