

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getReviewImages, addReviewImages, deleteReviewImage, deleteAllReviewImages } from '../services/supabase';
import { ReviewImage, ReviewsContextType } from '../types';

const ReviewsContext = createContext<ReviewsContextType | null>(null);

export const ReviewsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [reviewImages, setReviewImages] = useState<ReviewImage[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchImages = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getReviewImages();
            setReviewImages(data);
        } catch (error) {
            console.error("Failed to fetch review images for context:", error);
            toast.error("Could not load review images.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    const addImages = async (uploads: { file: File; altText: string | null }[]) => {
        const toastId = toast.loading(`Uploading ${uploads.length} image(s)...`);
        try {
            await addReviewImages(uploads);
            toast.success('Images uploaded successfully!', { id: toastId });
            await fetchImages(); // Refetch to update the context state
        } catch (error: any) {
            toast.error(error.message, { id: toastId });
            throw error; // Re-throw to allow component-level handling
        }
    };

    const deleteImage = async (image: ReviewImage) => {
        const toastId = toast.loading('Deleting image...');
        try {
            await deleteReviewImage(image);
            setReviewImages(prev => prev.filter(img => img.id !== image.id));
            toast.success('Image deleted.', { id: toastId });
        } catch (error: any) {
            toast.error(error.message, { id: toastId });
            throw error;
        }
    };

    const deleteAllImages = async () => {
        const toastId = toast.loading('Deleting all review images...');
        try {
            await deleteAllReviewImages();
            setReviewImages([]);
            toast.success('All review images deleted.', { id: toastId });
        } catch (error: any) {
            toast.error(error.message, { id: toastId });
            throw error;
        }
    };

    const value = {
        reviewImages,
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