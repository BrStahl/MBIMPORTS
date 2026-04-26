import React from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

type ProductCardProps = {
  product: Product;
  onClick?: () => void;
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const isWishlisted = isInWishlist(product.id);

  return (
    <div className="flex flex-col group cursor-pointer" onClick={onClick}>
      <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-zinc-900 mb-4 relative flex items-center justify-center">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        {product.isNew && (
          <div className="absolute top-4 left-4 bg-gold px-3 py-1 text-xs font-bold uppercase tracking-widest text-white rounded-sm shadow-sm">
            Novo
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-full text-white shadow-sm transition-transform hover:scale-110 hover:text-gold focus:outline-none group/btn border border-white/10"
        >
          <Heart 
            size={18} 
            className={isWishlisted ? "fill-gold text-gold" : "text-gray-400 group-hover/btn:text-gold"} 
          />
        </button>
      </div>

      <div className="flex flex-col">
        <h3 className="font-bold text-white line-clamp-1">
          {product.name}
        </h3>
        <p className="text-gray-400 text-sm capitalize">{product.category}</p>
        <span className="font-black mt-1 text-lg text-gold">
          R$ {product.price.toFixed(2).replace('.', ',')}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product);
          }}
          className="mt-4 w-full bg-zinc-900 border border-zinc-800 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gold hover:border-gold transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingCart size={16} />
          Comprar
        </button>
      </div>
    </div>
  );
};
