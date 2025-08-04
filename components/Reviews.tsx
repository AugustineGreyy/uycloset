

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ClothingItem } from '../types';
import Lightbox from './Lightbox';
import { useReviews } from '../contexts/ReviewsContext';

const ReviewImageCard: React.FC<{ image: ClothingItem, onClick: () => void }> = ({ image, onClick }) => (
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
            alt={image.name || "Customer review image"}
            className="h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
        />
    </motion.div>
);


const ReviewSkeletonCard: React.FC = () => (
    <div className="bg-gray-200 rounded-lg shadow-lg animate-pulse aspect-w-4 aspect-h-5"></div>
);

const Reviews: React.FC = () => {
    const { reviewImages, displayedReviewImages, loading } = useReviews();
    const [selectedImage, setSelectedImage] = useState<ClothingItem | null>(null);
    
    const handleImageClick = (image: ClothingItem) => {
        setSelectedImage(image);
    };

    // Create a synthetic item for the Lightbox to ensure consistent display
    const syntheticItemForLightbox: ClothingItem | null = selectedImage ? {
        ...selectedImage,
        category: 'Happy Customer',
        name: selectedImage.name || 'Customer Review',
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
                    {loading && displayedReviewImages.length === 0 ? (
                        [...Array(4)].map((_, i) => <ReviewSkeletonCard key={i} />)
                    ) : (
                        <AnimatePresence>
                            {displayedReviewImages.map((image) => (
                               <ReviewImageCard key={image.id} image={image} onClick={() => handleImageClick(image)} />
                            ))}
                        </AnimatePresence>
                    )}
                </div>
                
                {reviewImages.length > displayedReviewImages.length && (
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