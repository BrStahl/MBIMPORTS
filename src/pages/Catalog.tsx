import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { Product } from '../types';
import { Filter, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

export const Catalog: React.FC = () => {
  const { products, categories: dbCategories, loading } = useStore();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('cat') || 'all';
  const queryParam = searchParams.get('q') || '';
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sortBy, setSortBy] = useState('newest');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [categoryParam, queryParam]);

  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'roupas', name: 'Roupas' },
    { id: 'calcados', name: 'Calçados' },
    { id: 'acessorios', name: 'Acessórios' },
    ...dbCategories
      .filter(c => {
        if (categoryParam === 'all') return true;
        
        // Find if categoryParam is a main type
        const mainTypesMap: Record<string, string> = {
          'roupas': 'Roupas',
          'calcados': 'Calçados',
          'acessorios': 'Acessórios'
        };
        
        const activeType = mainTypesMap[categoryParam];
        if (activeType) {
          return c.tipo_produto === activeType;
        }

        // If categoryParam is a specific slug, find its type and show categories of that same type
        const selectedCat = dbCategories.find(dbC => dbC.slug === categoryParam);
        if (selectedCat) {
          return c.tipo_produto === selectedCat.tipo_produto;
        }

        return true;
      })
      .map(c => ({ id: c.slug, name: c.nome }))
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
                    (normalize(filterCat) === 'bermudas' && productCat === 'bermuda') ||
                    (normalize(filterCat) === 'calcas' && productCat === 'calca') ||
                    (normalize(filterCat) === 'tenis' && (productCat === 'tenis' || productCat === 'shoes' || productCat === 'calcados'));

    if (categoryParam === 'roupas') {
      const clothingCats = dbCategories
        .filter(c => !c.tipo_produto || c.tipo_produto === 'Roupas')
        .map(c => normalize(c.nome));
      
      const defaultClothing = ['camisetas', 'bermudas', 'calcas', 'camisas', 'shorts', 'short', 'bermuda', 'calca', 'camiseta', 'camisa'];
      return clothingCats.some(c => productCat.includes(c)) || defaultClothing.some(c => productCat.includes(c));
    }

    if (categoryParam === 'acessorios') {
      const accessoryCats = dbCategories
        .filter(c => c.tipo_produto === 'Acessórios')
        .map(c => normalize(c.nome));
      
      return accessoryCats.some(c => productCat.includes(c));
    }

    if (categoryParam === 'calcados' || categoryParam === 'tenis') {
      const footwearCats = dbCategories
        .filter(c => c.tipo_produto === 'Calçados' || normalize(c.nome) === 'tenis')
        .map(c => normalize(c.nome));
      
      const defaultFootwear = ['tenis', 'shoes', 'calcados', 'sapato', 'sandalia', 'chinelo'];
      return footwearCats.some(c => productCat.includes(c)) || defaultFootwear.some(c => productCat.includes(c));
    }

    return isMatch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    return 0; // newest as default (original order)
  });

  // Pagination Logic
  const totalItems = sortedProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto hide-scrollbar">
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
        {paginatedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
              {paginatedProducts.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onClick={() => setSelectedProduct(product)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-20 flex flex-col items-center gap-6">
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-black hover:border-black disabled:opacity-30 disabled:pointer-events-none transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <div className="px-8 py-3 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                      Página <span className="text-black">{currentPage}</span> de <span className="text-black">{totalPages}</span>
                    </p>
                  </div>

                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-gray-100 text-gray-400 hover:text-black hover:border-black disabled:opacity-30 disabled:pointer-events-none transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    // Show only around current page if there are many pages
                    if (
                      totalPages > 7 && 
                      page !== 1 && 
                      page !== totalPages && 
                      (page < currentPage - 1 || page > currentPage + 1)
                    ) {
                      if (page === currentPage - 2 || page === currentPage + 2) return <span key={page} className="text-gray-300">...</span>;
                      return null;
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg text-[10px] font-black transition-all ${
                          currentPage === page
                            ? 'bg-gold text-white shadow-lg'
                            : 'bg-white text-gray-400 border border-gray-100 hover:border-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
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
