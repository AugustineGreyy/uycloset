
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WishlistContextType } from '../types';
import toast from 'react-hot-toast';

const WishlistContext = createContext<WishlistContextType | null>(null);

const WISHLIST_STORAGE_KEY = 'uy-closet-wishlist';

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [wishlist, setWishlist] = useState<number[]>(() => {
        try {
            const storedWishlist = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
            return storedWishlist ? JSON.parse(storedWishlist) : [];
        } catch (error) {
            console.error('Error reading wishlist from localStorage', error);
            return [];
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
        } catch (error) {
            console.error('Error saving wishlist to localStorage', error);
        }
    }, [wishlist]);

    const addToWishlist = useCallback((id: number) => {
        setWishlist(prev => {
            if (prev.includes(id)) return prev;
            toast.success('Added to wishlist!');
            return [...prev, id];
        });
    }, []);

    const removeFromWishlist = useCallback((id: number) => {
        setWishlist(prev => {
            if (!prev.includes(id)) return prev;
            toast.success('Removed from wishlist');
            return prev.filter(itemId => itemId !== id);
        });
    }, []);

    const isInWishlist = useCallback((id: number) => {
        return wishlist.includes(id);
    }, [wishlist]);
    
    const clearWishlist = useCallback(() => {
        setWishlist([]);
    }, []);

    const value = { wishlist, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (context === null) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
