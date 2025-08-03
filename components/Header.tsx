import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { MenuIcon, XIcon, HeartIcon, LogOutIcon } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '../contexts/WishlistContext';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

const Header: React.FC = () => {
    const { session } = useAuth();
    const { wishlist } = useWishlist();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();
    
    const activeLinkStyle: React.CSSProperties = {
        textDecoration: 'underline',
        textUnderlineOffset: '4px',
        color: '#6B4F4B'
    };

    const getStyle = ({ isActive }: { isActive: boolean }) => isActive ? activeLinkStyle : {};

    const handleLogout = async () => {
        setIsMenuOpen(false); // Close mobile menu if open
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error(`Logout failed: ${error.message}`);
        } else {
            toast.success("You have been logged out.");
            navigate('/');
        }
    };

    const NavLinks = () => (
        <>
            <NavLink 
                to="/" 
                end
                className="hover:text-brand-primary transition-colors py-2 md:py-0"
                style={getStyle}
                onClick={() => setIsMenuOpen(false)}
            >
                Home
            </NavLink>
            <NavLink 
                to="/collection" 
                className="hover:text-brand-primary transition-colors py-2 md:py-0"
                style={getStyle}
                onClick={() => setIsMenuOpen(false)}
            >
                Collection
            </NavLink>
            <NavLink 
                to="/reviews" 
                className="hover:text-brand-primary transition-colors py-2 md:py-0"
                style={getStyle}
                onClick={() => setIsMenuOpen(false)}
            >
                Reviews
            </NavLink>
             <NavLink 
                to="/wishlist" 
                className="relative hover:text-brand-primary transition-colors py-2 md:py-0"
                style={getStyle}
                onClick={() => setIsMenuOpen(false)}
            >
                <div className="flex items-center gap-1">
                    <HeartIcon className="w-5 h-5" />
                    <span>Wishlist</span>
                    {wishlist.length > 0 && (
                        <span className="absolute -top-1 -right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                            {wishlist.length}
                        </span>
                    )}
                </div>
            </NavLink>
            <NavLink 
                to="/contact" 
                className="hover:text-brand-primary transition-colors py-2 md:py-0"
                style={getStyle}
                onClick={() => setIsMenuOpen(false)}
            >
                Contact
            </NavLink>
            {session ? (
                <>
                    <NavLink 
                        to="/admin" 
                        className="hover:text-brand-primary transition-colors py-2 md:py-0"
                        style={getStyle}
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Dashboard
                    </NavLink>
                    <button 
                        onClick={handleLogout} 
                        className="flex items-center gap-2 hover:text-brand-primary transition-colors py-2 md:py-0"
                        aria-label="Log Out"
                    >
                        <LogOutIcon className="w-5 h-5" />
                        <span>Log Out</span>
                    </button>
                </>
            ) : (
                <NavLink 
                    to="/admin" 
                    className="hover:text-brand-primary transition-colors py-2 md:py-0"
                    style={getStyle}
                    onClick={() => setIsMenuOpen(false)}
                >
                    Admin
                </NavLink>
            )}
        </>
    );

    return (
        <header className="bg-brand-bg/80 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between py-4">
                    <div className="flex flex-col">
                        <NavLink to="/" className="text-3xl font-serif font-bold text-brand-primary">
                           Uy's Closet
                        </NavLink>
                        <p className="text-sm text-brand-secondary mt-1 hidden sm:block">
                            Classy gowns, bodysuits, chic tops & more.
                        </p>
                    </div>
                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center space-x-4 md:space-x-6 text-brand-text font-medium">
                        <NavLinks />
                    </nav>
                     {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)} 
                            className="text-brand-primary p-2 -mr-2"
                            aria-label="Toggle menu"
                            aria-expanded={isMenuOpen}
                        >
                            {isMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Panel */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="md:hidden overflow-hidden"
                    >
                        <nav className="flex flex-col items-center space-y-4 px-4 pb-4 pt-2 text-brand-text font-medium text-lg">
                           <NavLinks />
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;