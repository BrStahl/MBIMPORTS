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
      sublinks: categories.map(cat => ({ 
        name: cat.nome, 
        path: `/catalogo?cat=${cat.slug}` 
      }))
    },
    { name: 'Sobre', path: '/sobre' },
    { name: 'Contato', path: '/contato' },
  ];

  const activePath = location.pathname;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center h-20">
          {/* Mobile menu button */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              className="text-gray-900 hover:text-gold transition-colors focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu size={24} />
            </button>
          </div>

          {/* Logo */}
          <div className="flex-1 flex justify-center lg:justify-start">
            <Link 
              to="/"
              className="flex-shrink-0 flex items-center cursor-pointer gap-3"
            >
              <img 
                src="/favicon.png" 
                alt="Logo" 
                className="h-35 w-35 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:justify-center flex-1 space-x-8">
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
                  <div className="absolute top-full left-0 w-48 bg-white border border-gray-100 rounded-b-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
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
          <div className="flex items-center justify-end space-x-4 lg:space-x-6 flex-1">
            <div className="relative flex items-center">
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.form
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 240, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    onSubmit={handleSearch}
                    className="absolute right-full mr-2"
                  >
                    <input
                      autoFocus
                      type="text"
                      placeholder="Buscar produtos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-full px-5 py-2 text-[11px] font-bold outline-none focus:border-gold transition-all"
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
              className="text-black hover:text-gold transition-colors hidden sm:block"
            >
              <User size={22} strokeWidth={2} />
            </Link>
            
            <button 
              className="text-black hover:text-gold relative transition-colors"
              onClick={() => {}} // TODO: Redirect to wishlist page
            >
              <Heart size={22} strokeWidth={2} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black">
                  {wishlist.length}
                </span>
              )}
            </button>
            
            <button 
              className="group cursor-pointer relative flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100 hover:border-gold transition-all"
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
              <span className="text-[11px] font-black text-black group-hover:text-gold transition-colors hidden sm:block">
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
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-full max-w-sm bg-white z-[70] lg:hidden shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <img 
                    src="/favicon.png" 
                    alt="Logo" 
                    className="h-16 w-16 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-gray-400 hover:text-black transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Search in Mobile Menu */}
                <form onSubmit={handleSearch} className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar no catálogo..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-3 text-sm font-bold outline-none focus:border-gold transition-all"
                    />
                    <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Search size={18} />
                    </button>
                  </div>
                </form>

                {navLinks.map((link) => (
                  <div key={link.path} className="space-y-2">
                    <Link
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block py-4 text-xl font-black uppercase tracking-tight border-b border-gray-50 transition-colors ${
                        activePath === link.path ? 'text-gold' : 'text-black'
                      }`}
                    >
                      {link.name}
                    </Link>
                    {link.sublinks && (
                      <div className="pl-6 space-y-2 pb-4">
                        {link.sublinks.map(sub => (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block py-2 text-sm font-bold text-gray-400 uppercase tracking-widest hover:text-gold"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                <Link
                  to="/minha-conta"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 font-bold text-black uppercase tracking-widest text-xs mb-8"
                >
                  <User size={20} className="text-gold" />
                  Minha Conta
                </Link>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="flex flex-col gap-1 p-4 bg-white rounded-xl border border-gray-100">
                    <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Favoritos</span>
                    <span className="font-black text-xl">{wishlist.length}</span>
                  </div>
                  <div className="flex flex-col gap-1 p-4 bg-white rounded-xl border border-gray-100">
                    <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">Itens</span>
                    <span className="font-black text-xl">{cartItemsCount}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};
