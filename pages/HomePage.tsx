


import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getClothingItems, getSetupError } from '../services/supabase';
import { ClothingItem } from '../types';
import { useWishlist } from '../contexts/WishlistContext';
import { HeartIcon } from '../components/Icons';
import Reviews from '../components/Reviews';
import toast from 'react-hot-toast';
import Lightbox from '../components/Lightbox';

const FEATURED_ITEMS_KEY = 'uy-closet-featured-items';
const FEATURED_ITEMS_TIMESTAMP_KEY = 'uy-closet-featured-items-timestamp';
const ITEMS_LAST_UPDATED_KEY = 'uy-closet-items-last-updated';
const TWENTY_FOUR_HOURS_IN_MS = 24 * 60 * 60 * 1000;

const FeaturedItemCard: React.FC<{ item: ClothingItem; onClick: () => void; }> = ({ item, onClick }) => {
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const isWishlisted = isInWishlist(item.id);

    const handleWishlistClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isWishlisted) {
            removeFromWishlist(item.id);
        } else {
            addToWishlist(item.id);
        }
    };

    return (
        <div
            onClick={onClick}
            className="relative group overflow-hidden rounded-lg shadow-lg bg-gradient-to-br from-brand-accent to-white cursor-pointer"
        >
            <div className="aspect-w-4 aspect-h-5">
                <img
                    src={item.image_url}
                    alt={item.category}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
        </div>
    );
};

const FeaturedItemCardSkeleton = () => (
    <div className="overflow-hidden rounded-lg shadow-lg bg-white flex flex-col animate-pulse">
        <div className="bg-gray-200 aspect-w-4 aspect-h-5"></div>
    </div>
);

const HomePage: React.FC = () => {
    const [featuredItems, setFeaturedItems] = useState<ClothingItem[]>([]);
    const [allItems, setAllItems] = useState<ClothingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [dataVersion, setDataVersion] = useState(localStorage.getItem(ITEMS_LAST_UPDATED_KEY));

    // Listen for storage changes to sync across tabs
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === ITEMS_LAST_UPDATED_KEY) {
                setDataVersion(e.newValue);
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const allItemsData = await getClothingItems();
            // Filter out review items immediately after fetching.
            const collectionItems = allItemsData.filter(item => !item.is_review);
            
            setAllItems(collectionItems); // Used for the "About Us" slideshow

            const cachedTimestamp = localStorage.getItem(FEATURED_ITEMS_TIMESTAMP_KEY);
            const cachedItemsJSON = localStorage.getItem(FEATURED_ITEMS_KEY);
            const now = new Date().getTime();

            if (cachedTimestamp && cachedItemsJSON && (now - parseInt(cachedTimestamp, 10)) < TWENTY_FOUR_HOURS_IN_MS) {
                const cachedItemIds: number[] = JSON.parse(cachedItemsJSON);
                // Validate cached items against the filtered collection list.
                const validCachedItems = collectionItems.filter(item => cachedItemIds.includes(item.id));
                
                if (validCachedItems.length > 0) {
                    setFeaturedItems(validCachedItems);
                    setLoading(false);
                    return;
                }
            }
            
            // If cache is stale, select new random items from the filtered collection.
            const shuffled = [...collectionItems].sort(() => 0.5 - Math.random());
            const newFeatured = shuffled.slice(0, 6);
            setFeaturedItems(newFeatured);

            // Update cache
            if (newFeatured.length > 0) {
                const itemIdsToCache = newFeatured.map(item => item.id);
                localStorage.setItem(FEATURED_ITEMS_KEY, JSON.stringify(itemIdsToCache));
                localStorage.setItem(FEATURED_ITEMS_TIMESTAMP_KEY, now.toString());
            }

        } catch (err: any) {
            console.error("Failed to fetch items for homepage:", err);
            const setupError = getSetupError(err);
            if (setupError) {
                toast.error(setupError, { 
                    duration: 8000,
                    id: 'homepage-setup-error' // prevent multiple toasts
                });
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItems();
    }, [fetchItems, dataVersion]);
    
    useEffect(() => {
        if (allItems.length === 0) return;
        const intervalId = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % allItems.length);
        }, 1500); // Change slide every 1.5 seconds
        return () => clearInterval(intervalId);
    }, [allItems]);


    return (
        <div className="space-y-20 md:space-y-32">
            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center py-20 px-4 rounded-lg bg-gradient-to-br from-brand-accent to-brand-bg shadow-inner-lg"
            >
                <h1 className="text-4xl md:text-6xl font-serif font-extrabold text-brand-primary tracking-tight">
                    Timeless Style, Thrifted.
                </h1>
                <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-brand-secondary">
                    Discover unique, hand-picked apparel that brings sustainable chic to your wardrobe.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                    <Link to="/collection">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-brand-primary text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-brand-primary/90 transition-all duration-300"
                        >
                            Explore Collection
                        </motion.button>
                    </Link>
                    <Link to="/contact">
                         <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-transparent border-2 border-brand-primary text-brand-primary font-bold py-3 px-8 rounded-full shadow-lg hover:bg-brand-primary hover:text-white transition-all duration-300"
                        >
                            Contact Us
                        </motion.button>
                    </Link>
                </div>
            </motion.section>

            {/* Featured Items Section */}
            <section>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-primary text-center mb-4">
                    Featured Items
                </h2>
                <p className="text-center text-lg text-brand-secondary max-w-2xl mx-auto mb-10">
                    Hand-picked with love, these are the pieces everyone is talking about. Discover our current favorites and top-selling styles.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 min-h-[50vh] items-start">
                    {loading ? (
                        [...Array(6)].map((_, i) => <FeaturedItemCardSkeleton key={i} />)
                    ) : featuredItems.length > 0 ? (
                        featuredItems.map(item => (
                            <FeaturedItemCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
                        ))
                    ) : (
                        <div className="col-span-2 md:col-span-3 h-full flex items-center justify-center text-center py-16 text-brand-secondary border-2 border-dashed border-brand-accent rounded-lg">
                            <p>No featured items to show right now. Please check back later!</p>
                        </div>
                    )}
                </div>

                <div className="mt-12 text-center flex justify-center gap-4 flex-wrap">
                    <Link to="/collection">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-brand-primary text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-brand-primary/90 transition-all duration-300">
                            View Full Collection
                        </motion.button>
                    </Link>
                </div>
            </section>


            {/* About Section */}
            <section className="bg-gradient-to-br from-brand-accent to-white p-10 rounded-lg shadow-xl flex flex-col md:flex-row items-center gap-10">
                <div className="md:w-1/2 text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-primary mb-4">About Uy's Closet</h2>
                    <p className="text-brand-text mb-4">
                        At Uy's Closet, we believe that fashion should be both stylish and sustainable. We specialize in curating a collection of high-quality, thrifted apparel—from classy gowns and flattering bodysuits to chic tops and shorts.
                    </p>
                    <p className="text-brand-text">
                        Our mission is to give beautiful garments a second life, allowing you to express your unique style while making an eco-conscious choice. Each piece is selected with love and an eye for timeless appeal.
                    </p>
                </div>
                <div className="md:w-1/2 w-full">
                    {allItems.length > 0 ? (
                        <div className="relative w-full overflow-hidden rounded-lg shadow-xl bg-gray-100" style={{aspectRatio: '3/4'}}>
                             <AnimatePresence>
                                <motion.img
                                    key={currentSlide}
                                    src={allItems[currentSlide].image_url}
                                    alt={allItems[currentSlide].category}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="w-full rounded-lg shadow-md bg-gray-200 animate-pulse" style={{aspectRatio: '3/4'}} />
                    )}
                </div>
            </section>
            
            {/* Reviews Section */}
            <Reviews />

            {/* Final Call to Action */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8 }}
                className="text-center py-20 px-4 rounded-lg bg-gradient-to-br from-brand-accent to-white shadow-xl"
            >
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-primary mb-4">
                    Ready to Find Your Perfect Look?
                </h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-brand-secondary">
                    Explore our curated pieces available for sale or browse the entire collection to discover your next treasure.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                    <Link to="/collection">
                         <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-brand-primary text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-brand-primary/90 transition-all duration-300"
                        >
                            View Full Collection
                        </motion.button>
                    </Link>
                </div>
            </motion.section>

            <Lightbox item={selectedItem} onClose={() => setSelectedItem(null)} />
        </div>
    );
};

export default HomePage;