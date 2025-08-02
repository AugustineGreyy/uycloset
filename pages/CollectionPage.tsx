
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
            className="group relative block cursor-pointer overflow-hidden rounded-lg shadow-md"
            onClick={onClick}
        >
            {item.is_for_sale && (
                 <div className="absolute top-2 right-2 z-10">
                    {item.price != null ? (
                         <p className="text-sm font-bold text-white bg-green-600/80 px-3 py-1 rounded-full backdrop-blur-sm shadow-md">
                            {item.price.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 })}
                        </p>
                    ) : (
                        <p className="text-xs font-bold text-white bg-gray-500/80 px-2 py-1 rounded-full backdrop-blur-sm shadow-md">
                            Price not available
                        </p>
                    )}
                </div>
            )}
            <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-full object-cover aspect-[4/5] transition-transform duration-500 ease-in-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4 w-full">
                <h3 className="text-lg font-serif font-bold text-white truncate">{item.name}</h3>
                <p className="text-sm text-brand-accent/90 mb-3">{item.category}</p>
                 <button
                    onClick={handleWishlistClick}
                    className={`flex items-center justify-center gap-2 w-full px-3 py-2 rounded-full backdrop-blur-sm transition-colors duration-200 text-sm font-semibold ${
                        isWishlisted 
                        ? 'bg-red-500/80 text-white hover:bg-red-600/80'
                        : 'bg-white/20 text-white hover:bg-white/40'
                    }`}
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <HeartIcon className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
                    <span>{isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}</span>
                </button>
            </div>
        </motion.div>
    );
};

const GalleryItemSkeleton = () => (
    <div className="bg-gray-200 rounded-lg animate-pulse aspect-[4/5]"></div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <GalleryItemSkeleton key={i} />)}
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
    const itemsPerPage = 12;

    useEffect(() => {
        const fetchItems = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getClothingItems();
                setItems(data);
                setFilteredItems(data);
                const uniqueCategories = ['All', 'Available for Sale', ...Array.from(new Set(data.map(item => item.category)))];
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
        } else if (activeCategory === 'Available for Sale') {
            setFilteredItems(items.filter(item => item.is_for_sale));
        } else {
            setFilteredItems(items.filter(item => item.category === activeCategory));
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
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-primary">Our Collection</h1>
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

            {items.length > 0 ? (
                <>
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {currentItems.map((item) => (
                            <GalleryItem key={item.id} item={item} onClick={() => setSelectedItem(item)} />
                        ))}
                    </motion.div>
                    
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-2 mt-12">
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
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-20 text-brand-secondary">
                    <p>Our closet is currently empty. New arrivals coming soon!</p>
                </div>
            )}

            <Lightbox item={selectedItem} onClose={() => setSelectedItem(null)} />
            
            <Reviews />
        </div>
    );
};

export default CollectionPage;