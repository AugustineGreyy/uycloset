
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ReviewImage, ClothingItem } from '../types';
import Lightbox from './Lightbox';
import { useReviews } from '../contexts/ReviewsContext';

const REVIEWS_CACHE_KEY = 'uy-closet-reviews-cache';
const REVIEWS_TIMESTAMP_KEY = 'uy-closet-reviews-timestamp';
const TWENTY_FOUR_HOURS_IN_MS = 24 * 60 * 60 * 1000;

const ReviewImageCard: React.FC<{ image: ReviewImage, onClick: () => void }> = ({ image, onClick }) => (
    <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className="relative aspect-w-4 aspect-h-5 cursor-pointer overflow-hidden rounded-lg shadow-lg group" 
        onClick={onClick}
    >
        <img 
            src={image.image_url} 
            alt={image.alt_text || "Customer review image"}
            className="h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
        />
    </motion.div>
);


const ReviewSkeletonCard: React.FC = () => (
    <div className="bg-gray-200 rounded-lg shadow-lg animate-pulse aspect-w-4 aspect-h-5"></div>
);

const Reviews: React.FC = () => {
    const { reviewImages, loading } = useReviews();
    const [selectedImage, setSelectedImage] = useState<ReviewImage | null>(null);
    const [displayedImages, setDisplayedImages] = useState<ReviewImage[]>([]);
    
    useEffect(() => {
        if (loading || reviewImages.length === 0) return;

        const cachedTimestamp = localStorage.getItem(REVIEWS_TIMESTAMP_KEY);
        const cachedImagesJSON = localStorage.getItem(REVIEWS_CACHE_KEY);
        const now = new Date().getTime();

        if (cachedTimestamp && cachedImagesJSON && (now - parseInt(cachedTimestamp, 10)) < TWENTY_FOUR_HOURS_IN_MS) {
            const cachedImageIds: number[] = JSON.parse(cachedImagesJSON);
            const imagesFromCache = reviewImages.filter(img => cachedImageIds.includes(img.id));
            if (imagesFromCache.length > 0) {
                 setDisplayedImages(imagesFromCache);
                 return;
            }
        }
        
        // If cache is stale, invalid, or empty, select new random images
        const shuffled = [...reviewImages].sort(() => 0.5 - Math.random());
        const newImages = shuffled.slice(0, 4);
        setDisplayedImages(newImages);

        // Update cache
        if (newImages.length > 0) {
            localStorage.setItem(REVIEWS_CACHE_KEY, JSON.stringify(newImages.map(img => img.id)));
            localStorage.setItem(REVIEWS_TIMESTAMP_KEY, now.toString());
        }
        
    }, [reviewImages, loading]);

    const handleImageClick = (image: ReviewImage) => {
        setSelectedImage(image);
    };

    const syntheticItemForLightbox: ClothingItem | null = selectedImage ? {
        id: selectedImage.id,
        created_at: selectedImage.created_at,
        image_path: selectedImage.image_path,
        image_url: selectedImage.image_url,
        name: selectedImage.alt_text || 'Customer Review',
        category: 'Happy Customer',
        product_code: '',
    } : null;


    if (reviewImages.length === 0 && !loading) {
        return null; // Don't render the section if there are no reviews and not loading
    }

    return (
        <>
            <section className="mt-20 md:mt-32 bg-gradient-to-br from-brand-accent to-white p-8 md:p-12 rounded-2xl shadow-xl">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary text-center mb-4">
                    Customer Reviews
                </h2>
                <p className="text-center text-lg text-brand-secondary max-w-2xl mx-auto mb-10">
                    See how our real customers are enjoying their purchases. Shared experiences, honest reviews, and authentic moments.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {loading && displayedImages.length === 0 ? (
                        [...Array(4)].map((_, i) => <ReviewSkeletonCard key={i} />)
                    ) : (
                        <AnimatePresence>
                            {displayedImages.map((image) => (
                               <ReviewImageCard key={image.id} image={image} onClick={() => handleImageClick(image)} />
                            ))}
                        </AnimatePresence>
                    )}
                </div>
                
                {reviewImages.length > 4 && (
                    <div className="mt-12 text-center">
                        <Link to="/reviews">
                             <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-white border-2 border-brand-primary text-brand-primary font-bold py-3 px-8 rounded-full shadow-lg hover:bg-brand-primary hover:text-white transition-all duration-300"
                            >
                                See All Reviews
                            </motion.button>
                        </Link>
                    </div>
                )}

            </section>
            <Lightbox item={syntheticItemForLightbox} onClose={() => setSelectedImage(null)} />
        </>
    );
};

export default Reviews;