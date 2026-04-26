import React from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

type ProductCardProps = {
  product: Product;
  onClick?: () => void;
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const { toggleWishlist, isInWishlist } = useStore();
  const isWishlisted = isInWishlist(product.id);

  return (
    <div className="flex flex-col group cursor-pointer" onClick={onClick}>
      <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-gray-50 mb-4 relative flex items-center justify-center border border-gray-100 shadow-sm">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
        />
        {product.isNew && (
          <div className="absolute top-4 left-4 bg-black px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white rounded-sm shadow-lg z-10">
            Novo
          </div>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full text-gray-900 shadow-xl transition-all hover:scale-110 active:scale-95 group-hover:opacity-100 sm:opacity-0 transition-opacity z-10 border border-gray-100"
        >
          <Heart 
            size={18} 
            className={isWishlisted ? "fill-gold text-gold" : "text-gray-400"} 
          />
        </button>
      </div>

      <div className="flex flex-col">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-black group-hover:text-gold transition-colors line-clamp-1 uppercase tracking-tight text-sm">
            {product.name}
          </h3>
        </div>
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">{product.category}</p>
        <span className="font-black mt-2 text-xl text-black">
          R$ {product.price.toFixed(2).replace('.', ',')}
        </span>
        
        <div className="mt-4 flex gap-2 overflow-hidden">
          {product.colors.slice(0, 4).map(color => (
            <div key={color} className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: 'white' }} title={color} />
          ))}
          {product.colors.length > 4 && <span className="text-[10px] font-bold text-gray-400">+{product.colors.length - 4}</span>}
        </div>
      </div>
    </div>
  );
};
