

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getReviewImages, addReviewImages, deleteReviewImage, deleteAllReviewImages } from '../services/supabase';
import { ReviewImage, ReviewsContextType } from '../types';

const ReviewsContext = createContext<ReviewsContextType | null>(null);

const REVIEWS_CACHE_KEY = 'uy-closet-reviews-cache';
const REVIEWS_TIMESTAMP_KEY = 'uy-closet-reviews-timestamp';
const TWENTY_FOUR_HOURS_IN_MS = 24 * 60 * 60 * 1000;
const DISPLAY_COUNT = 4;

export const ReviewsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [reviewImages, setReviewImages] = useState<ReviewImage[]>([]);
    const [displayedReviewImages, setDisplayedReviewImages] = useState<ReviewImage[]>([]);
    const [loading, setLoading] = useState(true);

    const manageDisplayedImages = useCallback((allImages: ReviewImage[]) => {
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
            const data = await getReviewImages();
            setReviewImages(data);
            manageDisplayedImages(data);
        } catch (error) {
            console.error("Failed to fetch review images for context:", error);
            toast.error("Could not load review images.");
        } finally {
            setLoading(false);
        }
    }, [manageDisplayedImages]);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    const clearDisplayCache = () => {
        localStorage.removeItem(REVIEWS_CACHE_KEY);
        localStorage.removeItem(REVIEWS_TIMESTAMP_KEY);
    };

    const addImages = async (uploads: { file: File; altText: string | null }[]) => {
        const toastId = toast.loading(`Uploading ${uploads.length} image(s)...`);
        try {
            await addReviewImages(uploads);
            toast.success('Images uploaded successfully!', { id: toastId });
            clearDisplayCache();
            await fetchImages();
        } catch (error: any) {
            toast.error(error.message, { id: toastId });
            throw error;
        }
    };

    const deleteImage = async (image: ReviewImage) => {
        const originalImages = [...reviewImages];
        const originalDisplayedImages = [...displayedReviewImages];

        // Optimistically update state to remove the image immediately from the UI
        setReviewImages(prev => prev.filter(i => i.id !== image.id));
        setDisplayedReviewImages(prev => prev.filter(i => i.id !== image.id));
        
        const toastId = toast.loading('Deleting image...');
        try {
            await deleteReviewImage(image);
            toast.success('Image deleted.', { id: toastId });
            clearDisplayCache();
            // Refetch to ensure full consistency with the database.
            // This also handles cases where the optimistic update might be slightly out of sync.
            await fetchImages();
        } catch (error: any) {
            toast.error(error.message, { id: toastId });
            // If the deletion fails, roll back to the original state
            setReviewImages(originalImages);
            setDisplayedReviewImages(originalDisplayedImages);
            throw error;
        }
    };

    const deleteAllImages = async () => {
        const originalImages = [...reviewImages];
        const originalDisplayedImages = [...displayedReviewImages];
        
        // Optimistically clear the images from the UI
        setReviewImages([]);
        setDisplayedReviewImages([]);

        const toastId = toast.loading('Deleting all review images...');
        try {
            await deleteAllReviewImages();
            toast.success('All review images deleted.', { id: toastId });
            clearDisplayCache();
            await fetchImages(); // This will confirm the empty state from the database.
        } catch (error: any) {
            toast.error(error.message, { id: toastId });
            // If deletion fails, restore the original state
            setReviewImages(originalImages);
            setDisplayedReviewImages(originalDisplayedImages);
            throw error;
        }
    };

    const value = {
        reviewImages,
        displayedReviewImages,
        loading,
        addImages,
        deleteImage,
        deleteAllImages,
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
