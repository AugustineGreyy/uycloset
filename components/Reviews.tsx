


import React, { useState, useEffect } from 'react';
import { getReviewImages } from '../services/supabase';
import { ReviewImage, ClothingItem } from '../types';
import Lightbox from './Lightbox';

const ReviewImageCard: React.FC<{ image: ReviewImage, onClick: () => void }> = ({ image, onClick }) => (
    <div className="group relative h-80 w-80 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg shadow-lg" onClick={onClick}>
        <img 
            src={image.image_url} 
            alt={image.alt_text || "Customer review image"}
            className="h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center p-4">
            <p className="text-white text-center font-semibold">{image.alt_text || 'A happy customer!'}</p>
        </div>
    </div>
);


const ReviewSkeletonCard: React.FC = () => (
    <div className="h-80 w-80 flex-shrink-0 bg-gray-200 rounded-lg shadow-lg animate-pulse"></div>
);

const Reviews: React.FC = () => {
    const [reviewImages, setReviewImages] = useState<ReviewImage[]>([]);
    const [doubledImages, setDoubledImages] = useState<ReviewImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<ReviewImage | null>(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const data = await getReviewImages();
                setReviewImages(data);
                if (data.length > 0) {
                    setDoubledImages([...data, ...data]);
                }
            } catch (error) {
                console.error("Failed to fetch review images:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    const handleImageClick = (image: ReviewImage) => {
        setSelectedImage(image);
    };

    const syntheticItemForLightbox: ClothingItem | null = selectedImage ? {
        id: selectedImage.id,
        created_at: selectedImage.created_at,
        image_path: selectedImage.image_path,
        image_url: selectedImage.image_url,
        name: selectedImage.alt_text || 'Customer Review',
        category: 'Review',
        product_code: '', // Not applicable for reviews
        is_for_sale: false,
        is_featured: false,
        price: null
    } : null;

    if (loading) {
        return (
            <section className="mt-20 md:mt-32">
                 <div className="h-10 bg-gray-300 rounded-md w-1/3 mx-auto mb-10 animate-pulse"></div>
                 <div className="w-full overflow-x-hidden -mx-4 px-4">
                     <div className="flex w-max space-x-6 py-4">
                         {[...Array(4)].map((_, i) => <ReviewSkeletonCard key={i} />)}
                     </div>
                 </div>
            </section>
        );
    }
    
    if (reviewImages.length === 0) {
        return null; // Don't render the section if there are no reviews
    }

    const animationDuration = reviewImages.length * 8; // 8 seconds per image

    return (
        <>
            <section className="mt-20 md:mt-32">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary text-center mb-10">
                    What Our Customers Say
                </h2>
                <div className="w-full overflow-x-auto no-scrollbar -mx-4 px-4">
                    <div
                        className="flex w-max space-x-6 py-4 animate-autoscroll"
                        style={{ animationDuration: `${animationDuration}s`, animationPlayState: 'running' }}
                    >
                        {doubledImages.map((image, index) => (
                            <ReviewImageCard key={`${image.id}-${index}`} image={image} onClick={() => handleImageClick(image)} />
                        ))}
                    </div>
                </div>
            </section>
            <Lightbox item={syntheticItemForLightbox} onClose={() => setSelectedImage(null)} />
        </>
    );
};

export default Reviews;