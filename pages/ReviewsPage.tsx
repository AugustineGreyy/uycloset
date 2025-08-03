import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useReviews } from '../contexts/ReviewsContext';
import { ReviewImage, ClothingItem } from '../types';
import Lightbox from '../components/Lightbox';
import { StarIcon } from '../components/Icons';

const ReviewGalleryItem: React.FC<{ image: ReviewImage, onClick: () => void }> = ({ image, onClick }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="group relative block cursor-pointer overflow-hidden rounded-lg shadow-md aspect-w-4 aspect-h-5 bg-brand-accent/50"
            onClick={onClick}
        >
            <img
                src={image.image_url}
                alt={image.alt_text || 'Customer review image'}
                className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
            />
        </motion.div>
    );
};

const ReviewGallerySkeleton = () => (
    <div className="bg-gray-200 rounded-lg animate-pulse aspect-w-4 aspect-h-5"></div>
);

const ReviewsPage: React.FC = () => {
    const { reviewImages, loading } = useReviews();
    const [selectedImage, setSelectedImage] = useState<ReviewImage | null>(null);

    const handleImageClick = (image: ReviewImage) => {
        setSelectedImage(image);
    };
    
    // Create a synthetic ClothingItem for the Lightbox component
    const syntheticItemForLightbox: ClothingItem | null = selectedImage ? {
        id: selectedImage.id,
        created_at: selectedImage.created_at,
        image_path: selectedImage.image_path,
        image_url: selectedImage.image_url,
        name: selectedImage.alt_text || 'Customer Review',
        category: 'Happy Customer',
        product_code: '',
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
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-primary flex items-center justify-center gap-3">
                    <StarIcon className="w-10 h-10 text-brand-secondary" />
                    <span>Customer Reviews</span>
                </h1>
                <p className="mt-4 text-lg text-brand-secondary max-w-2xl mx-auto">
                    See how our real customers are enjoying their purchases. Shared experiences, honest reviews, and authentic moments.
                </p>
            </div>

            <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
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