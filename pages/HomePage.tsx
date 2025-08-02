



import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getFeaturedItems, getAboutImages, getSetupError } from '../services/supabase';
import { ClothingItem, AboutImage } from '../types';
import { useWishlist } from '../contexts/WishlistContext';
import { HeartIcon } from '../components/Icons';
import Reviews from '../components/Reviews';
import toast from 'react-hot-toast';

const FeaturedItemCard: React.FC<{ item: ClothingItem }> = ({ item }) => {
    const { addToWishlist, isInWishlist } = useWishlist();
    const isWishlisted = isInWishlist(item.id);

    const handleAddToWishlist = () => {
        addToWishlist(item.id);
    };

    return (
        <div className="relative w-72 h-[28rem] flex-shrink-0 overflow-hidden rounded-lg shadow-lg bg-brand-accent/50">
            <div className="w-full h-full flex items-center justify-center p-4">
                <img
                    src={item.image_url}
                    alt={item.name}
                    className="max-h-full max-w-full object-contain"
                />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 p-4 w-full">
                <h3 className="text-lg font-serif font-bold text-white truncate">{item.name}</h3>
                <p className="text-sm text-brand-accent/90 mb-3">{item.category}</p>
                <button
                    onClick={handleAddToWishlist}
                    disabled={isWishlisted}
                    className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-white/20 rounded-full text-white backdrop-blur-sm hover:bg-white/40 transition-colors duration-200 text-sm font-semibold disabled:bg-red-500/60 disabled:cursor-not-allowed"
                >
                    <HeartIcon className={`w-4 h-4 ${isWishlisted ? 'fill-white' : ''}`} />
                    <span>{isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}</span>
                </button>
            </div>
        </div>
    );
};

const FeaturedItemCardSkeleton = () => (
    <div className="w-72 h-[28rem] flex-shrink-0 bg-gray-200 rounded-lg shadow-lg animate-pulse"></div>
);

const HomePage: React.FC = () => {
    const [featuredItems, setFeaturedItems] = useState<ClothingItem[]>([]);
    const [aboutImages, setAboutImages] = useState<AboutImage[]>([]);
    const [doubledItems, setDoubledItems] = useState<ClothingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const animationDuration = featuredItems.length * 5; // 5 seconds per item for scroll speed

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const [featured, aboutData] = await Promise.all([
                    getFeaturedItems(),
                    getAboutImages()
                ]);
                
                setFeaturedItems(featured);
                if (featured.length > 0) {
                    setDoubledItems([...featured, ...featured]);
                } else {
                    setDoubledItems([]);
                }
                
                // For About Us collage
                setAboutImages(aboutData);

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
        };
        fetchItems();
    }, []);

    return (
        <div className="space-y-20 md:space-y-32">
            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center py-20 px-4 rounded-lg bg-gradient-to-br from-brand-accent to-brand-bg shadow-inner-lg"
            >
                <h1 className="text-5xl md:text-7xl font-serif font-extrabold text-brand-primary tracking-tight">
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
            {loading ? (
                 <section>
                    <div className="h-10 bg-gray-300 rounded-md w-1/3 mx-auto mb-10 animate-pulse"></div>
                    <div className="w-full overflow-x-hidden -mx-4 px-4">
                        <div className="flex w-max space-x-6 py-4">
                            {[...Array(5)].map((_, i) => <FeaturedItemCardSkeleton key={i} />)}
                        </div>
                    </div>
                </section>
            ) : featuredItems.length > 0 && (
                <section>
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary text-center mb-10">
                        Featured Items
                    </h2>
                     <div className="w-full overflow-x-auto no-scrollbar -mx-4 px-4">
                        <div 
                            className="flex w-max space-x-6 py-4 animate-autoscroll"
                            style={{ animationDuration: `${animationDuration}s` }}
                        >
                            {doubledItems.map((item, index) => (
                                <FeaturedItemCard key={`${item.id}-${index}`} item={item} />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* About Section */}
            <section className="bg-white p-10 rounded-lg shadow-xl flex flex-col md:flex-row items-center gap-10">
                <div className="md:w-1/2 text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary mb-4">About Uy's Closet</h2>
                    <p className="text-brand-text mb-4">
                        At Uy's Closet, we believe that fashion should be both stylish and sustainable. We specialize in curating a collection of high-quality, thrifted apparel—from classy gowns and flattering bodysuits to chic tops and shorts.
                    </p>
                    <p className="text-brand-text">
                        Our mission is to give beautiful garments a second life, allowing you to express your unique style while making an eco-conscious choice. Each piece is selected with love and an eye for timeless appeal.
                    </p>
                </div>
                <div className="md:w-1/2 w-full aspect-square">
                    {aboutImages.length >= 3 ? (
                        <motion.div 
                            className="grid grid-cols-2 grid-rows-2 gap-4 h-full"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ staggerChildren: 0.2 }}
                        >
                            <motion.div 
                                className="row-span-2 rounded-lg overflow-hidden shadow-md"
                                variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                            >
                                <motion.img 
                                    src={aboutImages[0].image_url} 
                                    alt={aboutImages[0].alt_text || 'About image 1'} 
                                    className="w-full h-full object-cover" 
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ duration: 0.3 }}
                                />
                            </motion.div>
                            <motion.div 
                                className="rounded-lg overflow-hidden shadow-md"
                                variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } }}
                            >
                                <motion.img 
                                    src={aboutImages[1].image_url} 
                                    alt={aboutImages[1].alt_text || 'About image 2'} 
                                    className="w-full h-full object-cover"
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ duration: 0.3 }}
                                />
                            </motion.div>
                            <motion.div 
                                className="rounded-lg overflow-hidden shadow-md"
                                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                            >
                                <motion.img 
                                    src={aboutImages[2].image_url} 
                                    alt={aboutImages[2].alt_text || 'About image 3'} 
                                    className="w-full h-full object-cover"
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ duration: 0.3 }}
                                />
                            </motion.div>
                        </motion.div>
                    ) : (
                        <img 
                            src="https://images.unsplash.com/photo-1555529771-835f59fc5efe?q=80&w=1887&auto=format&fit=crop" 
                            alt="Fashionable clothing on display" 
                            className="rounded-lg shadow-md w-full h-full object-cover" 
                        />
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
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary mb-4">
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
        </div>
    );
};

export default HomePage;