
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '../contexts/WishlistContext';
import { getClothingItemsByIds, createWishlist, getWishlist, getSetupError } from '../services/supabase';
import { ClothingItem } from '../types';
import { HeartIcon, TrashIcon, ClipboardIcon } from '../components/Icons';
import toast from 'react-hot-toast';

const WishlistItemCard: React.FC<{ item: ClothingItem; onRemove: () => void }> = ({ item, onRemove }) => (
    <div className="flex items-center space-x-4 bg-gradient-to-br from-brand-accent to-white p-4 rounded-lg shadow-sm">
        <img src={item.image_url} alt={item.category} className="w-20 h-24 object-cover rounded-md" />
        <div className="flex-grow">
            <h3 className="font-bold text-brand-primary font-serif">{item.category}</h3>
            <p className="text-xs text-gray-500 font-mono mt-1">Code: {item.product_code}</p>
        </div>
        <button
            onClick={onRemove}
            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors"
            aria-label="Remove from wishlist"
        >
            <TrashIcon className="w-5 h-5" />
        </button>
    </div>
);

const SharedWishlistItemCard: React.FC<{ item: ClothingItem }> = ({ item }) => (
     <div className="flex items-center space-x-4 bg-gradient-to-br from-brand-accent to-white p-4 rounded-lg shadow-sm">
        <img src={item.image_url} alt={item.category} className="w-20 h-24 object-cover rounded-md" />
        <div className="flex-grow">
            <h3 className="font-bold text-brand-primary font-serif">{item.category}</h3>
            <p className="text-xs text-gray-500 font-mono mt-1">Code: {item.product_code}</p>
        </div>
    </div>
);

const WishlistItemCardSkeleton = () => (
    <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm animate-pulse">
        <div className="w-20 h-24 bg-gray-200 rounded-md"></div>
        <div className="flex-grow space-y-2">
            <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
            <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
            <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
        </div>
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
    </div>
);


const WishlistPage: React.FC = () => {
    const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
    const [wishlistItems, setWishlistItems] = useState<ClothingItem[]>([]);
    const [loading, setLoading] = useState(false);
    
    const [sharedWishlistItems, setSharedWishlistItems] = useState<ClothingItem[]>([]);
    const [loadingShared, setLoadingShared] = useState(false);
    const [sharedError, setSharedError] = useState<string | null>(null);

    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const wishlistIdFromUrl = useMemo(() => searchParams.get('id'), [searchParams]);
    
    const [retrievalId, setRetrievalId] = useState('');
    const [generatedId, setGeneratedId] = useState<string | null>(null);

    // Fetch details for items in local wishlist
    useEffect(() => {
        const fetchItems = async () => {
            if (wishlist.length === 0) {
                setWishlistItems([]);
                return;
            }
            setLoading(true);
            try {
                const items = await getClothingItemsByIds(wishlist);
                setWishlistItems(items);
            } catch (error) {
                toast.error("Could not fetch wishlist items.");
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, [wishlist]);

    // Fetch shared wishlist if ID is in URL
    useEffect(() => {
        if (!wishlistIdFromUrl) {
            setSharedWishlistItems([]);
            setSharedError(null);
            return;
        };

        const fetchSharedWishlist = async () => {
            setLoadingShared(true);
            setSharedError(null);
            try {
                const itemIds = await getWishlist(wishlistIdFromUrl);
                if (itemIds) {
                    const items = await getClothingItemsByIds(itemIds);
                    setSharedWishlistItems(items);
                } else {
                    setSharedError('This wishlist could not be found. It may have expired (after 30 days) or the ID is incorrect.');
                    setSharedWishlistItems([]);
                }
            } catch (error: any) {
                 const setupMsg = getSetupError(error);
                 if (setupMsg) {
                    setSharedError(setupMsg);
                } else {
                    setSharedError(error.message || 'An error occurred while fetching the wishlist.');
                }
            } finally {
                setLoadingShared(false);
            }
        };

        fetchSharedWishlist();
    }, [wishlistIdFromUrl]);

    const handleShareWishlist = async () => {
        if (wishlist.length === 0) {
            toast.error("Your wishlist is empty. Add items to share them.");
            return;
        }
        
        const toastId = toast.loading('Generating shareable code...');
        try {
            const newId = await createWishlist(wishlist);
            setGeneratedId(newId);
            toast.success('Shareable code generated!', { id: toastId });
            navigator.clipboard.writeText(newId).catch(() => {});
            
        } catch (error: any) {
            setGeneratedId(null);
            const setupMsg = getSetupError(error);
            if (setupMsg) {
                 toast.error(setupMsg, { id: toastId, duration: 8000 });
            } else {
                toast.error(error.message || 'Failed to generate code.', { id: toastId });
            }
        }
    };

    const handleRetrieveWishlist = (e: React.FormEvent) => {
        e.preventDefault();
        if (retrievalId) {
            navigate(`${location.pathname}?id=${retrievalId}`);
        }
    };

    return (
        <div className="space-y-12">
            <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary flex items-center justify-center gap-3">
                    <HeartIcon className="w-9 h-9 text-red-500" />
                    <span>My Wishlist</span>
                </h1>
                <p className="mt-4 text-lg text-brand-secondary max-w-2xl mx-auto">
                    Here are your saved items. You can generate a shareable code to send to someone else!
                </p>
            </div>
            
            {/* My Wishlist Section */}
            <div className="bg-brand-bg/60 p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl font-serif font-bold text-brand-primary">Your Saved Items ({wishlist.length})</h2>
                     {wishlist.length > 0 && (
                        <div className="flex items-center gap-2">
                             <button
                                onClick={() => { clearWishlist(); setGeneratedId(null); }}
                                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md shadow-sm hover:bg-red-200 transition-colors text-sm font-semibold"
                            >
                                Clear All
                            </button>
                            <button onClick={handleShareWishlist} className="px-4 py-1.5 bg-brand-primary text-white rounded-md shadow-sm hover:bg-brand-primary/90 transition-colors text-sm font-semibold">
                                Share Wishlist
                            </button>
                        </div>
                     )}
                </div>

                <AnimatePresence>
                    {generatedId && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -10, height: 0 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="my-4 p-4 bg-brand-primary/10 border border-brand-primary/20 rounded-lg overflow-hidden"
                        >
                            <h3 className="text-sm font-semibold text-brand-primary mb-2">Your Shareable Code:</h3>
                            <div className="flex items-center gap-2 p-2 bg-white rounded-md shadow-sm">
                                <input 
                                    type="text" 
                                    readOnly 
                                    value={generatedId} 
                                    className="flex-grow font-mono text-sm text-brand-text bg-transparent outline-none border-none p-1"
                                    onFocus={(e) => e.target.select()}
                                    aria-label="Shareable Wishlist Code"
                                />
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(generatedId);
                                        toast.success('Code copied to clipboard!');
                                    }}
                                    className="flex items-center gap-2 px-3 py-1 bg-brand-secondary text-white rounded-md hover:bg-brand-primary transition-colors text-sm"
                                    aria-label="Copy code to clipboard"
                                >
                                    <ClipboardIcon className="w-4 h-4" />
                                    <span>Copy</span>
                                </button>
                            </div>
                            <p className="text-xs text-brand-secondary mt-2">
                                Share this code with someone to let them see your wishlist. The code expires in 30 days.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>


                {loading && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {[...Array(Math.max(wishlist.length, 2))].map((_, i) => <WishlistItemCardSkeleton key={i} />)}
                    </div>
                )}
                {!loading && wishlist.length === 0 && (
                    <div className="text-center py-10 border-2 border-dashed border-brand-accent rounded-lg">
                        <p className="text-brand-secondary">Your wishlist is empty.</p>
                        <Link to="/collection" className="mt-2 inline-block text-brand-primary font-bold hover:underline">
                            Start adding items
                        </Link>
                    </div>
                )}
                {!loading && wishlistItems.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {wishlistItems.map(item => (
                            <WishlistItemCard key={item.id} item={item} onRemove={() => removeFromWishlist(item.id)} />
                        ))}
                    </div>
                )}
            </div>

            {/* Shared Wishlist Section */}
            <div>
                 <h2 className="text-xl font-serif font-bold text-brand-primary mb-4 text-center">Retrieve a Wishlist</h2>
                 <form onSubmit={handleRetrieveWishlist} className="max-w-xl mx-auto flex gap-2 mb-8">
                     <input 
                        type="text"
                        value={retrievalId}
                        onChange={(e) => setRetrievalId(e.target.value)}
                        placeholder="Enter a Wishlist ID..."
                        className="flex-grow w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-brand-text placeholder-gray-500 focus:outline-none focus:ring-brand-primary focus:border-brand-primary"
                     />
                     <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md shadow-sm hover:bg-brand-primary/90">
                        Find
                    </button>
                 </form>

                 {loadingShared && (
                    <div className="bg-brand-bg/60 p-6 rounded-lg shadow-md">
                        <div className="h-7 w-3/4 bg-gray-300 rounded-md animate-pulse mb-4"></div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                             {[...Array(2)].map((_, i) => <WishlistItemCardSkeleton key={i} />)}
                        </div>
                    </div>
                 )}
                 {sharedError && <p className="text-center text-red-600 bg-red-100 p-3 rounded-md">{sharedError}</p>}
                 {sharedWishlistItems.length > 0 && (
                     <div className="bg-brand-bg/60 p-6 rounded-lg shadow-md">
                         <h3 className="text-xl font-serif font-bold text-brand-primary mb-4">Viewing a Shared Wishlist ({sharedWishlistItems.length} items)</h3>
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {sharedWishlistItems.map(item => (
                                <SharedWishlistItemCard key={item.id} item={item} />
                            ))}
                        </div>
                     </div>
                 )}
            </div>

        </div>
    );
};

export default WishlistPage;
