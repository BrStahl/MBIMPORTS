import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Menu, X, User, Search, ChevronDown } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

type NavbarProps = {
  onCartClick: () => void;
};

export const Navbar: React.FC<NavbarProps> = ({ onCartClick }) => {
  const { cartItemsCount, wishlist, cartTotal, categories } = useStore();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogo?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Início', path: '/' },
    { 
      name: 'Roupas', 
      path: '/catalogo?cat=roupas',
      sublinks: categories
        .filter(cat => !cat.tipo_produto || cat.tipo_produto === 'Roupas')
        .map(cat => ({ 
          name: cat.nome, 
          path: `/catalogo?cat=${cat.slug}` 
        }))
    },
    { 
      name: 'Calçados', 
      path: '/catalogo?cat=calcados',
      sublinks: categories
        .filter(cat => cat.tipo_produto === 'Calçados')
        .map(cat => ({ 
          name: cat.nome, 
          path: `/catalogo?cat=${cat.slug}` 
        }))
    },
    { 
      name: 'Acessórios', 
      path: '/catalogo?cat=acessorios',
      sublinks: categories
        .filter(cat => cat.tipo_produto === 'Acessórios')
        .map(cat => ({ 
          name: cat.nome, 
          path: `/catalogo?cat=${cat.slug}` 
        }))
    },
    { name: 'Sobre', path: '/sobre' },
    { name: 'Contato', path: '/contato' },
  ];

  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleSubmenu = (path: string) => {
    setOpenSubmenu(openSubmenu === path ? null : path);
  };

  const handleMobileNavClick = (path: string, hasSublinks: boolean) => {
    if (hasSublinks) {
      toggleSubmenu(path);
    } else {
      setIsMobileMenuOpen(false);
      navigate(path);
    }
  };

  const activePath = location.pathname;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center h-20">
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden flex-1">
            <button
              type="button"
              className="p-2 -ml-2 text-gray-900 hover:text-gold transition-colors focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu size={24} />
            </button>
          </div>

          {/* Logo */}
          <div className="flex flex-1 justify-center lg:justify-start">
            <Link 
              to="/"
              className="flex-shrink-0 flex items-center cursor-pointer gap-3"
            >
              <img 
                src="/favicon.png" 
                alt="Logo" 
                className="h-20 sm:h-35 w-auto object-contain transition-all"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:justify-center flex-[2] space-x-8">
            {navLinks.map((link) => (
              <div key={link.path} className="relative group">
                <Link
                  to={link.path}
                  className={`flex items-center gap-1 text-[11px] tracking-[0.2em] uppercase transition-all hover:text-gold py-8 ${
                    activePath === link.path
                      ? 'text-black font-black'
                      : 'font-bold text-gray-400'
                  }`}
                >
                  {link.name}
                  {link.sublinks && <ChevronDown size={12} />}
                </Link>
                
                {link.sublinks && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-48 bg-white border border-gray-100 rounded-b-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                    {link.sublinks.map(sub => (
                      <Link
                        key={sub.path}
                        to={sub.path}
                        className="block px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center justify-end space-x-3 lg:space-x-6 flex-1">
            <div className="relative flex items-center">
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.form
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: window.innerWidth < 640 ? 160 : 240, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    onSubmit={handleSearch}
                    className="absolute right-full mr-2"
                  >
                    <input
                      autoFocus
                      type="text"
                      placeholder="Buscar..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-full px-4 py-2 text-[10px] sm:text-[11px] font-bold outline-none focus:border-gold transition-all"
                    />
                  </motion.form>
                )}
              </AnimatePresence>
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`text-black hover:text-gold transition-colors ${isSearchOpen ? 'text-gold' : ''}`}
              >
                <Search size={22} strokeWidth={2} />
              </button>
            </div>
            
            <Link 
              to="/minha-conta"
              className="text-black hover:text-gold transition-colors hidden lg:block"
            >
              <User size={22} strokeWidth={2} />
            </Link>
            
            <button 
              className="text-black hover:text-gold relative transition-colors hidden sm:block"
              onClick={() => navigate('/minha-conta')}
            >
              <Heart size={22} strokeWidth={2} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                  {wishlist.length}
                </span>
              )}
            </button>
            
            <button 
              className="group cursor-pointer relative flex items-center gap-2 bg-gray-50 p-2 sm:px-4 sm:py-2 rounded-full border border-gray-100 hover:border-gold transition-all"
              onClick={onCartClick}
            >
              <div className="relative">
                <ShoppingBag size={20} className="text-black group-hover:text-gold transition-colors" strokeWidth={2} />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-lg">
                    {cartItemsCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-black text-black group-hover:text-gold transition-colors hidden md:block">
                R$ {cartTotal.toFixed(2).replace('.', ',')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-[70] lg:hidden shadow-2xl flex flex-col h-screen"
              style={{ backgroundColor: '#ffffff' }}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 h-24 bg-white">
                <div className="flex items-center gap-3">
                  <img 
                    src="/favicon.png" 
                    alt="Logo" 
                    className="h-12 w-auto object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-black tracking-tighter leading-none">MB</span>
                    <span className="text-[10px] font-bold text-gold tracking-widest leading-none">IMPORTS</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-3 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-50"
                >
                  <X size={28} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 bg-white">
                {/* Search in Mobile Menu */}
                <form onSubmit={handleSearch} className="mb-10">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="O que você procura?"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-sm font-bold outline-none focus:border-gold transition-all"
                    />
                    <button type="submit" className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
                      <Search size={20} />
                    </button>
                  </div>
                </form>

                <div className="space-y-4">
                  {navLinks.map((link) => (
                    <div key={link.path} className="border-b border-gray-50 last:border-0 pb-2">
                      <button
                        onClick={() => handleMobileNavClick(link.path, !!link.sublinks)}
                        className="w-full flex items-center justify-between py-4 group"
                      >
                        <span className={`text-2xl font-black uppercase tracking-tight transition-colors ${
                          activePath === link.path ? 'text-gold' : 'text-black group-hover:text-gold'
                        }`}>
                          {link.name}
                        </span>
                        {link.sublinks && (
                          <ChevronDown 
                            size={24} 
                            className={`transition-transform duration-300 ${openSubmenu === link.path ? 'rotate-180 text-gold' : 'text-gray-300'}`} 
                          />
                        )}
                      </button>
                      
                      <AnimatePresence>
                        {link.sublinks && openSubmenu === link.path && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-6 pb-6 space-y-5 mt-2 border-l-2 border-gold/20">
                              {link.sublinks.map(sub => (
                                <Link
                                  key={sub.path}
                                  to={sub.path}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="block py-1 text-base font-bold text-gray-500 uppercase tracking-widest hover:text-gold transition-colors"
                                >
                                  {sub.name}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 border-t border-gray-100 bg-white flex justify-around items-center">
                <button
                  onClick={() => { setIsMobileMenuOpen(false); navigate('/minha-conta'); }}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="text-gray-400 group-hover:text-gold transition-all relative">
                    <User size={32} strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 group-hover:text-gold">Conta</span>
                </button>

                <button
                  onClick={() => { setIsMobileMenuOpen(false); navigate('/minha-conta'); }}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="text-gray-400 group-hover:text-gold transition-all relative">
                    <Heart size={32} strokeWidth={1.5} />
                    {wishlist.length > 0 && (
                      <span className="absolute top-0 right-0 w-3 h-3 bg-gold rounded-full border-2 border-white shadow-sm" />
                    )}
                  </div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 group-hover:text-gold">Favoritos</span>
                </button>

                <button
                  onClick={() => { setIsMobileMenuOpen(false); onCartClick(); }}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="text-gray-400 group-hover:text-gold transition-all relative">
                    <ShoppingBag size={32} strokeWidth={1.5} />
                    {cartItemsCount > 0 && (
                      <span className="absolute -top-1 -right-2 bg-black text-white text-[10px] px-1.5 py-0.5 rounded-md flex items-center justify-center font-black border-2 border-white shadow-md min-w-[20px]">
                        {cartItemsCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-gray-400 group-hover:text-gold">Carrinho</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};
