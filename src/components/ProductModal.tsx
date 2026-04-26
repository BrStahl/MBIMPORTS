import React from 'react';
import { X, ShoppingCart, Heart } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

type ProductModalProps = {
  product: Product | null;
  onClose: () => void;
};

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();

  if (!product) return null;

  const isWishlisted = isInWishlist(product.id);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-zinc-950 shadow-2xl rounded-2xl overflow-hidden text-white border border-zinc-800 flex flex-col md:flex-row">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black rounded-full text-gray-400 hover:text-white transition-colors border border-white/10"
        >
          <X size={20} />
        </button>

        <div className="md:w-1/2 aspect-square md:aspect-auto h-64 md:h-auto relative bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-800">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>

        <div className="md:w-1/2 p-6 md:p-10 flex flex-col justify-center">
          {product.isNew && (
            <span className="text-gold text-xs font-bold uppercase tracking-widest mb-4 block">🔥 Lançamento</span>
          )}
          <h2 className="text-3xl font-black text-white mb-2">{product.name}</h2>
          <p className="text-gray-400 text-sm mb-6 capitalize">{product.category === 'men' ? 'Masculino' : 'Acessórios'}</p>
          
          <span className="text-4xl font-black text-gold mb-8 block">
            R$ {product.price.toFixed(2).replace('.', ',')}
          </span>

          <p className="text-gray-400 mb-8 leading-relaxed">
            Produto premium com modelagem exclusiva e materiais de alta qualidade. Adicione ao carrinho para garantir o seu.
          </p>

          <div className="flex gap-4 mt-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product);
                onClose();
              }}
              className="flex-1 bg-gold text-black py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart size={20} />
              Adicionar ao Carrinho
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product);
              }}
              className="p-4 bg-black border border-zinc-800 rounded-xl hover:border-gold group transition-all"
            >
              <Heart 
                size={24} 
                className={isWishlisted ? "fill-gold text-gold" : "text-gray-400 group-hover:text-gold"} 
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
