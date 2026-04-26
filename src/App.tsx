import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { ProductModal } from './components/ProductModal';
import { Footer } from './components/Footer';
import { products } from './data';
import { Product } from './types';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter((product) => {
    if (activeCategory === 'all') return true;
    return product.category === activeCategory;
  });

  return (
    <div className="min-h-screen bg-black font-sans text-white flex flex-col">
      <Navbar 
        activeCategory={activeCategory}
        onCategoryChange={(cat) => {
          setActiveCategory(cat);
          setShowWishlistOnly(false);
        }}
        onCartClick={() => setIsCartOpen(true)}
        onWishlistClick={() => setShowWishlistOnly(!showWishlistOnly)}
      />
      
      {!showWishlistOnly && activeCategory === 'all' && <Hero />}

      <main className="flex-1 flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16" id="products">
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            {showWishlistOnly ? (
              <>Sua Lista de <span className="text-gold italic">Desejos</span></>
            ) : activeCategory === 'all' ? (
              <>As <span className="text-gold italic">Novidades</span></>
            ) : (
              <><span className="text-gold italic">{activeCategory === 'men' ? 'Moda Masculina' : 'Acessórios'}</span></>
            )}
          </h2>
          {!showWishlistOnly && (
            <span className="text-sm font-bold text-gray-400 hover:text-gold transition-colors border-b border-gray-200 hover:border-gold pb-1 hidden sm:block cursor-pointer">
              Ver todos ({filteredProducts.length})
            </span>
          )}
        </div>

        {showWishlistOnly ? (
          <WishlistView onSelect={setSelectedProduct} />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onClick={() => setSelectedProduct(product)} />
            ))}
          </div>
        )}
      </main>

      <Footer />

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}

// A local component in App to keep it clean, but using StoreContext via hook
import { useStore } from './context/StoreContext';

const WishlistView = ({ onSelect }: { onSelect: (product: Product) => void }) => {
  const { wishlist } = useStore();

  if (wishlist.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500 mb-4 text-lg">Você ainda não adicionou nenhum item aos favoritos.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
      {wishlist.map((product) => (
        <ProductCard key={product.id} product={product} onClick={() => onSelect(product)} />
      ))}
    </div>
  );
};

