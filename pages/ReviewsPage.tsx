

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useReviews } from '../contexts/ReviewsContext';
import { ClothingItem } from '../types';
import Lightbox from '../components/Lightbox';
import { StarIcon } from '../components/Icons';

const ReviewGalleryItem: React.FC<{ image: ClothingItem, onClick: () => void }> = ({ image, onClick }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="group relative block cursor-pointer overflow-hidden rounded-lg shadow-md bg-brand-accent/50 pt-[125%]"
            onClick={onClick}
        >
            <img
                src={image.image_url}
                alt={image.name || 'Customer review image'}
                className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
            />
        </motion.div>
    );
};

const ReviewGallerySkeleton = () => (
    <div className="relative bg-gray-200 rounded-lg animate-pulse pt-[125%]"></div>
);

const ReviewsPage: React.FC = () => {
    const { reviewImages, loading } = useReviews();
    const [selectedImage, setSelectedImage] = useState<ClothingItem | null>(null);

    const handleImageClick = (image: ClothingItem) => {
        setSelectedImage(image);
    };
    
    // Create a synthetic ClothingItem for the Lightbox component to show consistent info
    const syntheticItemForLightbox: ClothingItem | null = selectedImage ? {
        ...selectedImage,
        categories: ['Happy Customer'],
        name: selectedImage.name || 'Customer Review',
    } : null;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
            },
        },
    };

    return (
        <>
            <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary flex items-center justify-center gap-3">
                    <StarIcon className="w-9 h-9 text-brand-secondary" />
                    <span>Customer Reviews</span>
                </h1>
                <p className="mt-4 text-lg text-brand-secondary max-w-2xl mx-auto">
                    See how our real customers are enjoying their purchases. Shared experiences, honest reviews, and authentic moments.
                </p>
            </div>

            <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {loading ? (
                    [...Array(10)].map((_, i) => <ReviewGallerySkeleton key={i} />)
                ) : reviewImages.length > 0 ? (
                    reviewImages.map((image) => (
                        <ReviewGalleryItem key={image.id} image={image} onClick={() => handleImageClick(image)} />
                    ))
                ) : (
                    <div className="col-span-full flex items-center justify-center text-center py-20 text-brand-secondary border-2 border-dashed border-brand-accent rounded-lg min-h-[40vh]">
                        <p>No customer reviews have been shared yet. Be the first!</p>
                    </div>
                )}
            </motion.div>

            <Lightbox item={syntheticItemForLightbox} onClose={() => setSelectedImage(null)} />
        </>
    );
};

export default ReviewsPage;
