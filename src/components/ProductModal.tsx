import React, { useState } from 'react';
import { X, ShoppingCart, Heart, Ruler, Truck, RotateCcw, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

type ProductModalProps = {
  product: Product | null;
  onClose: () => void;
};

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [mainImage, setMainImage] = useState<string>('');
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Set default selection when product changes (Hook must be before early return)
  React.useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0] || '');
      setSelectedSize(product.sizes[0] || '');
      setMainImage(product.images[0] || '');
    }
  }, [product]);

  if (!product) return null;

  // Filter available variations and current selection
  const currentVariation = product.variations?.find(
    v => {
      const vColors = v.color ? v.color.split(',').map(s => s.trim()) : ['Padrão'];
      const vSizes = v.size ? v.size.split(',').map(s => s.trim()) : ['Único'];
      
      const colorMatch = vColors.includes(selectedColor) || (vColors.length === 0 && selectedColor === 'Padrão');
      const sizeMatch = vSizes.includes(selectedSize) || (vSizes.length === 0 && selectedSize === 'Único');
      
      return colorMatch && sizeMatch;
    }
  );

  const displayPrice = currentVariation?.price || product.price;
  const currentStock = currentVariation?.stock ?? 0;

  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      toast.error('Por favor, selecione cor e tamanho.', {
        style: {
          background: '#000',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          borderRadius: '0px'
        }
      });
      return;
    }
    if (currentStock <= 0 && product.variations && product.variations.length > 0) {
      toast.error('Este item está fora de estoque.', {
        style: {
          background: '#000',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          borderRadius: '0px'
        }
      });
      return;
    }
    addToCart(product, selectedColor, selectedSize);
    onClose();
  };

  const nextImage = () => {
    const currentIndex = product.images.indexOf(mainImage);
    const nextIndex = (currentIndex + 1) % product.images.length;
    setMainImage(product.images[nextIndex]);
  };

  const prevImage = () => {
    const currentIndex = product.images.indexOf(mainImage);
    const prevIndex = (currentIndex - 1 + product.images.length) % product.images.length;
    setMainImage(product.images[prevIndex]);
  };

  return (
    <>
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative w-full max-w-5xl bg-white shadow-2xl rounded-2xl overflow-hidden text-black border border-gray-100 flex flex-col md:flex-row max-h-[90vh]">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 z-10 p-2 bg-black/5 hover:bg-black/10 rounded-full text-gray-500 hover:text-black transition-colors"
          >
            <X size={20} />
          </button>

          {/* Gallery */}
          <div className="md:w-1/2 flex flex-col bg-gray-50 overflow-hidden">
            <div 
              className={`flex-1 relative overflow-hidden group ${product.images.length > 1 ? 'cursor-zoom-in' : ''}`}
              onClick={() => product.images.length > 1 && setIsGalleryOpen(true)}
            >
              <img 
                src={mainImage || product.images[0]} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              />
              {product.images.length > 1 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-md p-3 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 size={20} />
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex p-4 gap-2 overflow-x-auto border-t border-gray-100 bg-white">
                {product.images.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setMainImage(img)}
                    className={`w-20 h-20 rounded-md overflow-hidden border-2 transition-all flex-shrink-0 ${mainImage === img ? 'border-gold' : 'border-transparent'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt={`${product.name} view ${idx}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="md:w-1/2 p-6 md:p-10 flex flex-col overflow-y-auto">
            <div className="mb-6">
              {product.isNew && (
                <span className="text-gold text-xs font-bold uppercase tracking-widest mb-2 block">🔥 Lançamento</span>
              )}
              <h2 className="text-3xl font-black text-black mb-1 leading-tight">{product.name}</h2>
              <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">{product.category}</p>
            </div>
            
            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-4xl font-black text-black">
                R$ {displayPrice.toFixed(2).replace('.', ',')}
              </span>
              {product.discount && (
                <span className="text-gray-400 line-through text-lg font-bold">
                  R$ {((displayPrice * 100) / (100 - product.discount)).toFixed(2).replace('.', ',')}
                </span>
              )}
              {product.variations && product.variations.length > 0 && (
                 <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${currentStock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                   {currentStock > 0 ? `${currentStock} em estoque` : 'Esgotado'}
                 </span>
              )}
            </div>

            <div className="space-y-6 mb-8">
              {/* Size Select */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Tamanho: {selectedSize}</span>
                  <button className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1 hover:text-black transition-colors">
                    <Ruler size={12} /> Tabela de Medidas
                  </button>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {product.sizes.map(size => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 text-sm font-bold border-2 transition-all rounded-lg flex items-center justify-center ${selectedSize === size ? 'border-gold bg-gold/5 text-black' : 'border-gray-100 text-gray-500 hover:border-gray-300'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Select */}
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 block">Cor: {selectedColor}</span>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map(color => (
                    <button 
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 text-sm font-bold border-2 transition-all rounded-lg ${selectedColor === color ? 'border-gold bg-gold/5 text-black' : 'border-gray-100 text-gray-500 hover:border-gray-300'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-8 font-medium">
              {product.description}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8 text-[11px] font-bold uppercase tracking-widest text-gray-400">
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-gold" /> Frete Rápido
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw size={16} className="text-gold" /> Troca Grátis
              </div>
            </div>

            <div className="flex gap-4 mt-auto">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-black text-white py-5 rounded-xl font-bold uppercase tracking-widest hover:bg-gold transition-all flex items-center justify-center gap-2 shadow-xl shadow-black/10 active:scale-95"
              >
                <ShoppingCart size={20} />
                Comprar Agora
              </button>
              
              <button
                onClick={() => toggleWishlist(product)}
                className="p-5 bg-white border border-gray-200 rounded-xl hover:border-gold group transition-all group active:scale-95"
              >
                <Heart 
                  size={24} 
                  className={isWishlisted ? "fill-gold text-gold" : "text-gray-300 group-hover:text-gold"} 
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl">
          <button 
            onClick={() => setIsGalleryOpen(false)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all hover:rotate-90"
          >
            <X size={24} />
          </button>

          <button 
            onClick={prevImage}
            className="absolute left-6 p-4 text-white/50 hover:text-white transition-colors"
          >
            <ChevronLeft size={48} />
          </button>

          <div className="w-full h-full max-w-6xl max-h-[85vh] p-4 flex items-center justify-center">
            <img 
              src={mainImage} 
              className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" 
              alt="Visualização ampliada" 
            />
          </div>

          <button 
            onClick={nextImage}
            className="absolute right-6 p-4 text-white/50 hover:text-white transition-colors"
          >
            <ChevronRight size={48} />
          </button>

          <div className="absolute bottom-6 flex gap-3 overflow-x-auto p-4 bg-black/20 backdrop-blur-md rounded-2xl max-w-full overflow-hidden">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setMainImage(img)}
                className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${mainImage === img ? 'border-gold scale-110 shadow-lg shadow-gold/20' : 'border-transparent opacity-50 hover:opacity-100'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt="miniatura" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
