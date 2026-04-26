import React, { useState } from 'react';
import { ShoppingBag, Heart, Menu, X, User } from 'lucide-react';
import { useStore } from '../context/StoreContext';

type NavbarProps = {
  onCartClick: () => void;
  onWishlistClick: () => void;
  onCategoryChange: (category: string) => void;
  activeCategory: string;
};

export const Navbar: React.FC<NavbarProps> = ({ 
  onCartClick, 
  onWishlistClick, 
  onCategoryChange,
  activeCategory
}) => {
  const { cartItemsCount, wishlist, cartTotal } = useStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Início', category: 'all' },
    { name: 'Masculino', category: 'men' },
    { name: 'Acessórios', category: 'accessories' },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full bg-black border-b border-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center h-20">
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="text-slate-500 hover:text-slate-900 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex-1 flex justify-center sm:justify-start">
            <div 
              className="flex-shrink-0 flex items-center cursor-pointer"
              onClick={() => onCategoryChange('all')}
            >
              <span className="font-sans font-black text-2xl tracking-tighter text-white italic">
                MB <span className="text-gold">IMPORTS</span>
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:justify-center flex-1 space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.category}
                onClick={() => onCategoryChange(link.category)}
                className={`text-sm tracking-widest uppercase transition-colors hover:text-gold ${
                  activeCategory === link.category
                    ? 'text-gold font-bold border-b-2 border-gold pb-1'
                    : 'font-medium text-gray-500'
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center justify-end space-x-4 sm:space-x-6 flex-1">
            <button className="text-gray-400 hover:text-white hidden sm:block">
              <User size={24} strokeWidth={1.5} />
            </button>
            <button 
              className="text-gray-400 hover:text-white relative"
              onClick={onWishlistClick}
            >
              <Heart size={24} strokeWidth={1.5} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-slate-950 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>
            
            <button 
              className="group cursor-pointer relative hidden sm:flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800 hover:border-gold transition-colors"
              onClick={onCartClick}
            >
              <div className="relative">
                <ShoppingBag size={20} className="text-gray-300" strokeWidth={1.5} />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold text-black font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {cartItemsCount}
                  </span>
                )}
              </div>
              <span className="text-sm font-bold text-white group-hover:text-gold transition-colors">R$ {cartTotal.toFixed(2).replace('.', ',')}</span>
            </button>

            {/* Mobile cart icon */}
            <button 
              className="text-gray-400 hover:text-white relative sm:hidden"
              onClick={onCartClick}
            >
              <ShoppingBag size={24} strokeWidth={1.5} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-slate-950 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="sm:hidden border-t border-zinc-900 bg-black">
          <div className="px-2 pt-2 pb-3 space-y-1 shadow-lg">
            {navLinks.map((link) => (
              <button
                key={link.category}
                onClick={() => {
                  onCategoryChange(link.category);
                  setIsMobileMenuOpen(false);
                }}
                className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left uppercase tracking-widest ${
                  activeCategory === link.category
                    ? 'bg-zinc-900 text-gold'
                    : 'text-gray-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                {link.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};
