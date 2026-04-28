import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { HomePage } from './pages/HomePage';
import { Catalog } from './pages/Catalog';
import { Login } from './pages/Login';
import { MyAccount } from './pages/MyAccount';
import { AdminDashboard } from './pages/AdminDashboard';
import { About, Contact, ExchangePolicy, PrivacyPolicy, TermsOfUse } from './pages/StaticPages';
import { StoreProvider } from './context/StoreContext';
import { AuthProvider } from './context/AuthContext';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const AppContent = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-gold selection:text-black bg-white">
      <ScrollToTop />
      {!isAdminRoute && <Navbar onCartClick={() => setIsCartOpen(true)} />}
      
      <main className="flex-grow flex flex-col">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/login" element={<Login />} />
          <Route path="/minha-conta/*" element={<MyAccount />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="/politica-troca" element={<ExchangePolicy />} />
          <Route path="/privacidade" element={<PrivacyPolicy />} />
          <Route path="/termos" element={<TermsOfUse />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}

      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <Router>
          <Toaster position="top-right" />
          <AppContent />
        </Router>
      </StoreProvider>
    </AuthProvider>
  );
}
