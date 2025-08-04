

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { getClothingItems, getSetupError } from '../services/supabase';
import { ClothingItem } from '../types';
import Lightbox from '../components/Lightbox';
import { useWishlist } from '../contexts/WishlistContext';
import { HeartIcon } from '../components/Icons';
import Reviews from '../components/Reviews';

const GalleryItem: React.FC<{ item: ClothingItem; onClick: () => void }> = ({ item, onClick }) => {
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const isWishlisted = isInWishlist(item.id);

    const handleWishlistClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevents opening lightbox
        if (isWishlisted) {
            removeFromWishlist(item.id);
        } else {
            addToWishlist(item.id);
        }
    };

    const variants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <motion.div
            variants={variants}
            layout
            onClick={onClick}
            className="relative group overflow-hidden rounded-lg shadow-md bg-gradient-to-br from-brand-accent to-white cursor-pointer"
        >
            <div className="relative pt-[125%]"> {/* 5:4 Aspect Ratio */}
                <img
                    src={item.image_url}
                    alt={item.categories.join(', ')}
                    className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                <motion.button
                    onClick={handleWishlistClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full font-semibold transition-colors duration-300 text-xs shadow-lg
                        ${isWishlisted
                            ? 'bg-red-500/80 text-white backdrop-blur-sm'
                            : 'bg-black/50 text-white backdrop-blur-sm hover:bg-black/70'}`
                    }
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <HeartIcon className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
                    <span>{isWishlisted ? 'Added to Wishlist' : 'Add to Wishlist'}</span>
                </motion.button>
            </div>
        </motion.div>
    );
};

const GalleryItemSkeleton = () => (
    <div className="overflow-hidden rounded-lg shadow-md bg-white flex flex-col animate-pulse">
        <div className="relative bg-gray-200 pt-[125%]"></div>
    </div>
);

const CollectionPageSkeleton = () => (
    <div>
        <div className="text-center mb-12">
            <div className="h-12 bg-gray-300 rounded-md w-1/2 mx-auto animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded-md w-3/4 mx-auto mt-4 animate-pulse"></div>
        </div>
        <div className="flex justify-center flex-wrap gap-2 mb-10">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-9 w-24 bg-gray-200 rounded-full animate-pulse"></div>
            ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => <GalleryItemSkeleton key={i} />)}
        </div>
    </div>
);


const CollectionPage: React.FC = () => {
    const [items, setItems] = useState<ClothingItem[]>([]);
    const [filteredItems, setFilteredItems] = useState<ClothingItem[]>([]);
    const [categories, setCategories] = useState<string[]>(['All']);
    
    const [activeCategory, setActiveCategory] = useState<string>('All');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        const fetchItems = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getClothingItems();
                // Filter out review items from the main collection view.
                const collectionOnlyItems = data.filter(item => !item.is_review);
                setItems(collectionOnlyItems);
                
                // Derive categories from collection items only.
                const allCategories = collectionOnlyItems.flatMap(item => item.categories);
                const uniqueCategories = ['All', ...Array.from(new Set(allCategories))];
                setCategories(uniqueCategories);
            } catch (err: any) {
                const setupMsg = getSetupError(err);
                if (setupMsg) {
                    setError(setupMsg);
                } else {
                    setError('Failed to fetch clothing items. The store might be setting up. Please check back later.');
                }
                console.error('Error fetching items on CollectionPage:', err.message || err);
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, []);
    
    useEffect(() => {
        setCurrentPage(1); // Reset to first page on filter change
        if (activeCategory === 'All') {
            setFilteredItems(items);
        } else {
            setFilteredItems(items.filter(item => item.categories.includes(activeCategory)));
        }
    }, [activeCategory, items]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
            },
        },
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

    const paginate = (pageNumber: number) => {
        if (pageNumber < 1 || pageNumber > totalPages) return;
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const emptyStateMessage = activeCategory === 'All' 
        ? "Our closet is currently empty. New arrivals coming soon!"
        : `There are no items in the "${activeCategory}" category right now.`;

    if (loading) {
        return <CollectionPageSkeleton />;
    }
    
    if (error) {
        return (
            <div className="text-center py-20 text-red-700 bg-red-100 p-6 rounded-lg max-w-2xl mx-auto shadow-md">
                <p className="font-bold text-lg mb-2">A little setup is needed!</p>
                <p className="mb-4">{error}</p>
                {error.includes('Admin page') && (
                    <Link to="/admin" className="mt-2 inline-block bg-brand-primary text-white font-bold py-2 px-4 rounded hover:bg-brand-primary/90 transition-colors shadow-sm">
                        Go to Admin Setup
                    </Link>
                )}
            </div>
        );
    }

    return (
        <div>
            <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary">Our Collection</h1>
                <p className="mt-4 text-lg text-brand-secondary max-w-2xl mx-auto">
                    Browse our curated selection of thrifted gems. Click on an item to see a larger view.
                </p>
            </div>
            
            <div className="flex justify-center flex-wrap gap-2 mb-10">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                            activeCategory === category
                            ? 'bg-brand-primary text-white shadow-md'
                            : 'bg-brand-accent text-brand-primary hover:bg-brand-secondary/40'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-start"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {filteredItems.length > 0 ? (
                    currentItems.map((item) => (
                        <GalleryItem key={item.id} item={item} onClick={() => setSelectedItem(item)} />
                    ))
                ) : (
                    <div className="col-span-full flex items-center justify-center text-center py-20 text-brand-secondary border-2 border-dashed border-brand-accent rounded-lg min-h-[40vh]">
                        <p>{emptyStateMessage}</p>
                    </div>
                )}
            </motion.div>
            
            <div className="flex justify-center items-center space-x-2 mt-12 h-10">
                {filteredItems.length > 0 && totalPages > 1 && (
                    <>
                        <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-brand-text hover:bg-brand-accent/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-brand-secondary">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-brand-text hover:bg-brand-accent/50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </>
                )}
            </div>

            <Lightbox item={selectedItem} onClose={() => setSelectedItem(null)} />
            
            <Reviews />
        </div>
    );
};

export default CollectionPage;
