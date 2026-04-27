import React, { useState, useEffect } from 'react';
import { Hero } from '../components/Hero';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { useStore } from '../context/StoreContext';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { Truck, RotateCcw, ShieldCheck, CreditCard, ChevronRight } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const HomePage: React.FC = () => {
  const { products, loading, clearCart } = useStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleSuccess = async (sessionId: string) => {
      try {
        const response = await fetch(`/api/checkout-session?session_id=${sessionId}`);
        const session = await response.json();
        
        if (session && session.customer_details) {
          // Extrair itens do cart
          const items = session.metadata && session.metadata.cart ? JSON.parse(session.metadata.cart) : [];
          
          let clienteId = null;
          const { data: clientData } = await supabase.from('clientes').select('id').eq('email', session.customer_details.email).single();
          if (clientData) clienteId = clientData.id;

          // Tentar salvar no banco com os campos corretos observados
          const { data: pedido, error: pedidoError } = await supabase.from('pedidos').insert([{
            cliente_id: clienteId,
            status: 'recebido', // Valor oficial permitido
            valor_produtos: session.amount_total / 100,
            valor_frete: 0,
            valor_desconto: 0,
            valor_total: session.amount_total / 100,
            forma_pagamento: 'Stripe'
          }]).select().single();
          
          if (pedidoError) {
            console.error('Erro ao salvar pedido:', pedidoError);
          } else if (pedido) {
            // Save items to itens_pedidos
            const orderItems = items.map((item: any) => ({
              pedido_id: pedido.id,
              nome_produto: item.name,
              quantidade: item.quantity,
              preco_unitario: item.price,
              cor: item.color,
              tamanho: item.size
            }));
            
            const { error: itemsError } = await supabase.from('itens_pedidos').insert(orderItems);
            if (itemsError) console.error('Error saving items:', itemsError);
          }
        }
        
        toast.success('Pedido pago com sucesso! Agradecemos sua compra.', { duration: 5000 });
        clearCart();
        navigate('/', { replace: true });
      } catch (err) {
        console.error('Failed to process checkout session', err);
        toast.success('Pedido pago, porém houve erro ao salvar o registro no app.', { duration: 5000 });
        clearCart();
        navigate('/', { replace: true });
      }
    };

    const query = new URLSearchParams(location.search);
    if (query.get('success')) {
        const sessionId = query.get('session_id');
        if (sessionId) {
          handleSuccess(sessionId);
        } else {
          toast.success('Pedido pago com sucesso! Agradecemos sua compra.', { duration: 5000 });
          clearCart();
          navigate('/', { replace: true });
        }
    }
    if (query.get('canceled')) {
        toast.error('Pagamento cancelado. Seu carrinho foi salvo.', { duration: 5000 });
        navigate('/', { replace: true });
    }
  }, [location.search]);

  const activeProducts = products.filter(p => p.status === 'active');

  const featuredProducts = activeProducts.filter(p => p.isFeatured).slice(0, 4);
  
  // Use first 4 active products if none are marked as featured
  const displayFeatured = featuredProducts.length > 0 ? featuredProducts : activeProducts.slice(0, 4);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const newArrivals = activeProducts.filter(p => {
    if (!p.createdAt) return p.isNew;
    return new Date(p.createdAt) >= sevenDaysAgo;
  }).sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(newArrivals.length / itemsPerPage);
  const currentItems = newArrivals.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const benefits = [
    { icon: <Truck size={32} />, title: 'Frete Rápido', desc: 'Envio imediato para todo Brasil' },
    { icon: <RotateCcw size={32} />, title: 'Troca Fácil', desc: 'Sua primeira troca é grátis' },
    { icon: <ShieldCheck size={32} />, title: 'Pagamento Seguro', desc: 'Seus dados sempre protegidos' },
    { icon: <CreditCard size={32} />, title: 'Até 12x', desc: 'Parcele suas compras no cartão' },
  ];

  const categories = [
    { name: 'Roupas', image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=800', path: '/catalogo?cat=roupas' },
    { name: 'Calçados', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800', path: '/catalogo?cat=tenis' },
    { name: 'Acessórios', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800', path: '/catalogo?cat=accessories' },
  ];

  return (
    <div className="flex-1 bg-white">
      <Hero />

      {/* Benefits */}
      <section className="py-12 border-b border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, idx) => (
            <div key={idx} className="flex flex-col items-center text-center lg:flex-row lg:text-left gap-4 p-4">
              <div className="text-gold">{benefit.icon}</div>
              <div>
                <h3 className="font-black text-xs uppercase tracking-widest text-black">{benefit.title}</h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-3xl font-black text-black uppercase tracking-tight">Categorias <span className="text-gold italic">em Destaque</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, idx) => (
            <Link key={idx} to={cat.path} className="relative h-96 group overflow-hidden rounded-2xl shadow-xl">
              <img src={cat.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={cat.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-8 left-8">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{cat.name}</h3>
                <span className="flex items-center gap-2 text-[10px] font-black text-gold uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
                  Explorar <ChevronRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl font-black text-black uppercase tracking-tight">Os Mais <span className="text-gold italic">Procurados</span></h2>
            <Link to="/catalogo" className="text-[10px] font-black text-gray-400 hover:text-gold uppercase tracking-[0.2em] transition-colors border-b-2 border-gray-100 pb-1">Ver Tudo</Link>
          </div>
          <div className="flex overflow-x-auto lg:grid lg:grid-cols-4 gap-6 pb-8 snap-x snap-mandatory hide-scrollbar">
            {displayFeatured.map(product => (
              <div key={product.id} className="min-w-[280px] snap-start">
                <ProductCard product={product} onClick={() => setSelectedProduct(product)} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-24 max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-black text-black uppercase tracking-tight">Novidades <span className="text-gold italic">da Semana</span></h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Lançamentos selecionados dos últimos 7 dias</p>
          </div>
          <div className="flex items-center gap-4">
            {totalPages > 1 && (
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="p-2 border border-gray-100 rounded-full hover:bg-gold hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                >
                  <ChevronRight size={20} className="rotate-180" />
                </button>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage === totalPages - 1}
                  className="p-2 border border-gray-100 rounded-full hover:bg-gold hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
            <Link to="/catalogo" className="text-[10px] font-black text-gray-400 hover:text-gold uppercase tracking-[0.2em] transition-colors border-b-2 border-gray-100 pb-1">Ver Tudo</Link>
          </div>
        </div>

        {newArrivals.length > 0 ? (
          <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-${Math.min(currentItems.length, 5)} gap-6 pb-8`}>
            {currentItems.map(product => (
              <div key={product.id} className="animate-in fade-in slide-in-from-right-4 duration-500">
                <ProductCard product={product} onClick={() => setSelectedProduct(product)} />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Nenhuma novidade nos últimos 7 dias. <br/> <Link to="/catalogo" className="text-gold mt-2 inline-block">Ver catálogo completo</Link></p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto bg-black rounded-[3rem] overflow-hidden flex flex-col lg:flex-row shadow-2xl">
          <div className="lg:w-1/2 p-12 lg:p-24 flex flex-col justify-center">
            <span className="text-gold font-black uppercase tracking-[0.3em] text-xs mb-4">Oferta Exclusiva</span>
            <h2 className="text-4xl lg:text-6xl font-light text-white leading-tight mb-8">Cadastre-se e ganhe <span className="font-black italic text-gold">10% OFF</span> na primeira compra.</h2>
            <div className="flex gap-4">
              <input type="email" placeholder="Seu melhor e-mail" className="bg-zinc-800 border-none text-white px-6 py-4 rounded-xl flex-1 outline-none focus:ring-2 ring-gold transition-all" />
              <button className="bg-white text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gold hover:text-white transition-all">Quero!</button>
            </div>
          </div>
          <div className="lg:w-1/2 h-80 lg:h-auto">
            <img src="https://images.unsplash.com/photo-1490114538077-0a7f8cb49871?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="Special offer" />
          </div>
        </div>
      </section>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
};
