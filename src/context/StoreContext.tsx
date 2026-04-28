import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Product, CartItem, Banner, Category } from '../types';
import { supabase } from '../lib/supabase';
import { products as initialProducts } from '../data';

type StoreContextType = {
  products: Product[];
  banners: Banner[];
  categories: Category[];
  loading: boolean;
  cart: CartItem[];
  wishlist: Product[];
  addToCart: (product: Product, color: string, size: string) => void;
  removeFromCart: (productId: string, color: string, size: string) => void;
  updateQuantity: (productId: string, color: string, size: string, quantity: number) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  clearCart: () => void;
  fetchProducts: () => Promise<void>;
  fetchBanners: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  cartTotal: number;
  cartItemsCount: number;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('mb-cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const savedWishlist = localStorage.getItem('mb-wishlist');
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });

  useEffect(() => {
    localStorage.setItem('mb-cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('mb-wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    fetchProducts();
    fetchBanners();
    fetchCategories();

    const produtosChannel = supabase.channel('produtos-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produtos' }, () => fetchProducts())
      .subscribe();

    const bannersChannel = supabase.channel('banners-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banners_promo' }, () => fetchBanners())
      .subscribe();

    const categoriasChannel = supabase.channel('categorias-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categorias' }, () => fetchCategories())
      .subscribe();

    return () => {
      supabase.removeChannel(produtosChannel);
      supabase.removeChannel(bannersChannel);
      supabase.removeChannel(categoriasChannel);
    };
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('ativo', true)
        .order('nome');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  };

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners_promo')
        .select('*')
        .order('id', { ascending: true });
      
      if (error) throw error;
      setBanners((data || []).map(b => ({
        id: b.id,
        image: b.imagem_url,
        title: b.titulo,
        link: b.link,
        status: b.ativo ? 'active' : 'inactive'
      })) as Banner[]);
    } catch (error) {
      console.error("Erro ao buscar banners:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      // Buscando produtos com suas variações, categoria e imagens
      const { data, error } = await supabase
        .from('produtos')
        .select(`
          *,
          categorias (nome),
          variacoes_produtos (*),
          imagens_produtos (*)
        `)
        .eq('ativo', true);
      
      if (error) throw error;

      // Mapeando para o formato que o frontend espera
      const formattedProducts = (data || []).map(p => {
        const rawVariations = p.variacoes_produtos || [];
        
        // Split comma-separated strings if any (defensive approach)
        const colors = [...new Set(rawVariations.flatMap((v: any) => 
          v.cor ? v.cor.toString().split(',').map((c: string) => c.trim()) : []
        ))].filter(Boolean) as string[];

        const sizes = [...new Set(rawVariations.flatMap((v: any) => 
          v.tamanho ? v.tamanho.toString().split(',').map((s: string) => s.trim()) : []
        ))].filter(Boolean) as string[];

        const mappedVariations = rawVariations.map((v: any) => ({
          id: v.id,
          sku: v.sku,
          color: v.cor || '',
          size: v.tamanho || '',
          price: v.preco ? Number(v.preco) : Number(p.preco_base),
          stock: v.estoque || 0
        }));
        
        // Joias elegantes placeholders se não houver imagens
        const placeholderImages = [
          'https://images.unsplash.com/photo-1515562141207-7a88fb0ce33e?auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80'
        ];

        // Se houver imagens na tabela, ordenar por ordem
        let images = placeholderImages;
        if (p.imagens_produtos && p.imagens_produtos.length > 0) {
          images = p.imagens_produtos
            .sort((a: any, b: any) => (a.ordem || 0) - (b.ordem || 0))
            .map((img: any) => img.url);
        }

        return {
          id: p.id,
          name: p.nome,
          price: Number(p.preco_base),
          category: p.categorias?.nome || 'Geral',
          images: images,
          description: p.descricao,
          colors: colors.length > 0 ? colors : ['Padrão'],
          sizes: sizes.length > 0 ? sizes : ['Único'],
          variations: mappedVariations,
          isNew: p.destaque,
          isFeatured: p.destaque,
          status: p.ativo ? 'active' : 'inactive',
          createdAt: p.criado_em
        };
      });

      setProducts(formattedProducts as Product[]);
    } catch (error) {
      console.error("Erro ao buscar produtos do Supabase:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product, color: string, size: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.productId === product.id && item.color === color && item.size === size
      );
      if (existingItem) {
        return prevCart.map((item) =>
          item.productId === product.id && item.color === color && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prevCart, 
        { 
          productId: product.id, 
          name: product.name, 
          price: product.price, 
          image: product.images[0], 
          color, 
          size, 
          quantity: 1 
        }
      ];
    });
    toast.success(`${product.name} adicionado ao carrinho!`, {
      style: {
        background: '#000',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        borderRadius: '0px'
      },
      iconTheme: {
        primary: '#D4AF37',
        secondary: '#000',
      },
    });
  };

  const removeFromCart = (productId: string, color: string, size: string) => {
    setCart((prevCart) => prevCart.filter(
      (item) => !(item.productId === productId && item.color === color && item.size === size)
    ));
  };

  const updateQuantity = (productId: string, color: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, color, size);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.productId === productId && item.color === color && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const toggleWishlist = (product: Product) => {
    setWishlist((prevWishlist) => {
      const exists = prevWishlist.find((item) => item.id === product.id);
      if (exists) {
        toast.success(`${product.name} removido dos favoritos`, {
          style: {
            background: '#000',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 'bold',
            borderRadius: '0px'
          }
        });
        return prevWishlist.filter((item) => item.id !== product.id);
      }
      toast.success(`${product.name} adicionado aos favoritos!`, {
        style: {
          background: '#000',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 'bold',
          borderRadius: '0px'
        },
        iconTheme: {
          primary: '#D4AF37',
          secondary: '#000',
        },
      });
      return [...prevWishlist, product];
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartItemsCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        products,
        banners,
        categories,
        loading,
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleWishlist,
        isInWishlist,
        clearCart,
        fetchProducts,
        fetchBanners,
        fetchCategories,
        cartTotal,
        cartItemsCount,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
