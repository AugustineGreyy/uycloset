

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getClothingItems } from '../services/supabase';
import { ClothingItem, ReviewsContextType } from '../types';

const ReviewsContext = createContext<ReviewsContextType | null>(null);

const REVIEWS_CACHE_KEY = 'uy-closet-reviews-cache';
const REVIEWS_TIMESTAMP_KEY = 'uy-closet-reviews-timestamp';
const TWENTY_FOUR_HOURS_IN_MS = 24 * 60 * 60 * 1000;
const DISPLAY_COUNT = 4;

export const ReviewsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [reviewImages, setReviewImages] = useState<ClothingItem[]>([]);
    const [displayedReviewImages, setDisplayedReviewImages] = useState<ClothingItem[]>([]);
    const [loading, setLoading] = useState(true);

    const manageDisplayedImages = useCallback((allImages: ClothingItem[]) => {
        if (allImages.length === 0) {
            setDisplayedReviewImages([]);
            return;
        }

        const cachedTimestamp = localStorage.getItem(REVIEWS_TIMESTAMP_KEY);
        const cachedImagesJSON = localStorage.getItem(REVIEWS_CACHE_KEY);
        const now = new Date().getTime();

        if (cachedTimestamp && cachedImagesJSON && (now - parseInt(cachedTimestamp, 10)) < TWENTY_FOUR_HOURS_IN_MS) {
            try {
                const cachedImageIds: number[] = JSON.parse(cachedImagesJSON);
                const imagesFromCache = allImages.filter(img => cachedImageIds.includes(img.id));
                
                if (imagesFromCache.length > 0) {
                    setDisplayedReviewImages(imagesFromCache);
                    return;
                }
            } catch (e) {
                console.error("Error parsing review cache", e);
            }
        }
        
        const shuffled = [...allImages].sort(() => 0.5 - Math.random());
        const newImages = shuffled.slice(0, Math.min(DISPLAY_COUNT, allImages.length));
        setDisplayedReviewImages(newImages);

        if (newImages.length > 0) {
            localStorage.setItem(REVIEWS_CACHE_KEY, JSON.stringify(newImages.map(img => img.id)));
            localStorage.setItem(REVIEWS_TIMESTAMP_KEY, now.toString());
        }
    }, []);

    const fetchImages = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getClothingItems();
            const reviewItems = data.filter(item => item.is_review);
            setReviewImages(reviewItems);
            manageDisplayedImages(reviewItems);
        } catch (error) {
            console.error("Failed to fetch review images for context:", error);
            toast.error("Could not load review images.");
        } finally {
            setLoading(false);
        }
    }, [manageDisplayedImages]);

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            // Refetch if item data is updated in another tab (via Admin Panel)
            if (e.key === 'uy-closet-items-last-updated') {
                fetchImages();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        fetchImages();
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [fetchImages]);
    
    const value = {
        reviewImages,
        displayedReviewImages,
        loading,
    };

    return (
        <ReviewsContext.Provider value={value}>
            {children}
        </ReviewsContext.Provider>
    );
};

export const useReviews = () => {
    const context = useContext(ReviewsContext);
    if (!context) {
        throw new Error('useReviews must be used within a ReviewsProvider');
    }
    return context;
};