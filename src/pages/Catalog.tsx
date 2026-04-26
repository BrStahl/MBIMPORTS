import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { Product } from '../types';
import { Filter, ChevronDown } from 'lucide-react';

export const Catalog: React.FC = () => {
  const { products, categories: dbCategories, loading } = useStore();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('cat') || 'all';
  const queryParam = searchParams.get('q') || '';
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sortBy, setSortBy] = useState('newest');

  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'roupas', name: 'Roupas (Geral)' },
    ...dbCategories.map(c => ({ id: c.slug, name: c.nome }))
  ];

  const filteredProducts = products.filter(p => {
    const normalize = (str: string) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    
    // Search filter
    if (queryParam) {
      const q = normalize(queryParam);
      const name = normalize(p.name);
      const desc = normalize(p.description || '');
      const cat = normalize(p.category);
      
      if (!name.includes(q) && !desc.includes(q) && !cat.includes(q)) {
        return false;
      }
    }

    // Category filter
    if (categoryParam === 'all') return true;
    
    const productCat = normalize(p.category);
    const filterCat = normalize(categoryParam);

    // Matches if exact match, or if singular/plural variation (simple check)
    const isMatch = productCat === filterCat || 
                    productCat === filterCat + 's' || 
                    productCat + 's' === filterCat ||
                    (filterCat === 'bermudas' && productCat === 'bermuda') ||
                    (filterCat === 'calcas' && productCat === 'calca');

    if (categoryParam === 'roupas') {
      const clothingCats = ['camisetas', 'bermudas', 'calcas', 'camisas', 'shorts', 'short', 'bermuda', 'calca', 'camiseta', 'camisa'];
      return clothingCats.some(c => productCat.includes(c));
    }

    return isMatch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0; // newest as default (original order)
  });

  return (
    <div className="flex-1 bg-white min-h-screen">
      {/* Header */}
      <div className="bg-gray-50 py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-black text-black uppercase tracking-tight mb-4">
            {queryParam ? `Buscando por: "${queryParam}"` : categories.find(c => c.id === categoryParam)?.name}
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
            {sortedProducts.length} {sortedProducts.length === 1 ? 'Produto Encontrado' : 'Produtos Encontrados'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set('cat', cat.id);
                  window.history.pushState({}, '', url);
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap ${
                  categoryParam === cat.id 
                    ? 'bg-black text-white border-black shadow-lg' 
                    : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-lg text-xs font-bold uppercase tracking-widest hover:border-gray-300 transition-all">
                Ordenar por <ChevronDown size={14} />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
                <button onClick={() => setSortBy('newest')} className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 border-b border-gray-50">Lançamentos</button>
                <button onClick={() => setSortBy('price-asc')} className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 border-b border-gray-50">Menor Preço</button>
                <button onClick={() => setSortBy('price-desc')} className="w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50">Maior Preço</button>
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {sortedProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={() => setSelectedProduct(product)}
              />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center">
            <Filter size={48} className="mx-auto text-gray-100 mb-4" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Nenhum produto encontrado nesta categoria</p>
          </div>
        )}
      </div>

      <ProductModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </div>
  );
};
