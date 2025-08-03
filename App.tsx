

import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { motion, AnimatePresence, Transition } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

import { supabase } from './services/supabase';
import HomePage from './pages/HomePage';
import CollectionPage from './pages/CollectionPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import WishlistPage from './pages/WishlistPage';
import Header from './components/Header';
import Footer from './components/Footer';
import { AuthContextType } from './types';
import { WishlistProvider } from './contexts/WishlistContext';
import { SiteConfigProvider } from './contexts/SiteConfigContext';
import ScrollToTop from './components/ScrollToTop';
import { ReviewsProvider } from './contexts/ReviewsContext';
import ReviewsPage from './pages/ReviewsPage';
import NotFoundPage from './pages/NotFoundPage';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = { session, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  };

  const pageTransition: Transition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5,
  };

  const MotionWrapper = ({ children }: { children: React.ReactNode }) => (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<MotionWrapper><HomePage /></MotionWrapper>} />
        <Route path="/collection" element={<MotionWrapper><CollectionPage /></MotionWrapper>} />
        <Route path="/reviews" element={<MotionWrapper><ReviewsPage /></MotionWrapper>} />
        <Route path="/contact" element={<MotionWrapper><ContactPage /></MotionWrapper>} />
        <Route path="/admin" element={<MotionWrapper><AdminPage /></MotionWrapper>} />
        <Route path="/wishlist" element={<MotionWrapper><WishlistPage /></MotionWrapper>} />
        <Route path="*" element={<MotionWrapper><NotFoundPage /></MotionWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};


function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <SiteConfigProvider>
          <ReviewsProvider>
            <HashRouter>
              <ScrollToTop />
              <div className="flex flex-col min-h-screen">
                <Toaster position="top-center" toastOptions={{
                  style: {
                    background: '#3C2F2F',
                    color: '#FDF6F0',
                  },
                }} />
                <Header />
                <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <AnimatedRoutes />
                </main>
                <Footer />
              </div>
            </HashRouter>
          </ReviewsProvider>
        </SiteConfigProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;
