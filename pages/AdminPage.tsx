
import React, { useState, useEffect, useCallback, ChangeEvent, useRef, useMemo } from 'react';
import { useAuth } from '../App';
import { 
    supabase, getClothingItems, addClothingItem, deleteClothingItem, 
    deleteAllClothingItems, 
    updateSiteConfig, getClothingItemCount, 
    getStorageUsage,
    getReviewImageCount, getNewsletterSubscriberCount, getNewsletterSubscribers,
    deleteNewsletterSubscriber, deleteAllNewsletterSubscribers,
    getCategories, addCategory, deleteCategory, updateClothingItem
} from '../services/supabase';
import { ClothingItem, ReviewImage, NewsletterSubscription, Category, SiteConfig } from '../types';
import { Json } from '../database.types';
import { 
    TrashIcon, UploadIcon, LogOutIcon, MailIcon, SettingsIcon, 
    BoxIcon, ChevronLeftIcon, PieChartIcon, MessageSquareIcon, ImageIcon, XIcon, StarIcon, TagIcon
} from '../components/Icons';
import toast from 'react-hot-toast';
import { useSiteConfig } from '../contexts/SiteConfigContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useReviews } from '../contexts/ReviewsContext';

type AdminPanel = 'stats' | 'items' | 'reviews' | 'newsletter' | 'settings';

// --- Reusable Panel Component ---
const Panel: React.FC<{ title: string; children: React.ReactNode, className?: string }> = ({ title, children, className = '' }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
        <h3 className="text-xl font-bold font-serif text-brand-primary mb-6">{title}</h3>
        {children}
    </div>
);

// --- Scroll To Top Wrapper for Panels ---
const ScrolledOnMount: React.FC<{children: React.ReactNode}> = ({children}) => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    return <>{children}</>;
};


// --- Categories Management Sub-Panel ---
const CategoriesManager: React.FC<{ categories: Category[], onUpdate: () => void }> = ({ categories, onUpdate }) => {
    const [name, setName] = useState('');

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;
        const toastId = toast.loading(`Adding category "${name}"...`);
        try {
            await addCategory(name);
            toast.success('Category added.', { id: toastId });
            setName('');
            onUpdate();
        } catch (error: any) {
            toast.error(error.message, { id: toastId });
        }
    };

    const handleDeleteCategory = async (id: number, catName: string) => {
        if (window.confirm(`Are you sure you want to delete category "${catName}"? This will not delete items in it.`)) {
            try {
                await deleteCategory(id);
                toast.success('Category deleted.');
                onUpdate();
            } catch (error: any) {
                toast.error(error.message);
            }
        }
    };
    
    return (
        <div className="mt-8 pt-6 border-t">
            <h4 className="text-lg font-bold font-serif text-brand-primary mb-4">Manage Categories</h4>
             <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
                <input type="text" placeholder="New category name" value={name} onChange={e => setName(e.target.value)} className="flex-grow p-2 border rounded bg-white text-brand-text" />
                <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded hover:bg-brand-primary/90 flex-shrink-0">Add Category</button>
            </form>
             <div className="space-y-2 max-h-48 overflow-y-auto">
                {categories.map(c => (
                    <div key={c.id} className="flex justify-between items-center p-2 border-b">
                        <span>{c.name}</span>
                        <button onClick={() => handleDeleteCategory(c.id, c.name)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- Clothing Items Panel ---
const ClothingItemsPanel: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
    const [items, setItems] = useState<ClothingItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [newItemCategory, setNewItemCategory] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const fetchItemsAndCategories = useCallback(async () => {
        setLoading(true);
        try {
            const [itemData, categoryData] = await Promise.all([getClothingItems(), getCategories()]);
            setItems(itemData);
            setCategories(categoryData);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchItemsAndCategories();
    }, [fetchItemsAndCategories]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setFile(e.target.files[0]);
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemCategory || !file) {
            toast.error('Please select a category and an image.');
            return;
        }

        const toastId = toast.loading('Adding new item...');
        try {
            await addClothingItem(newItemCategory, file);
            toast.success('Item added successfully!', { id: toastId });
            setNewItemCategory('');
            setFile(null);
            (document.getElementById('file-upload') as HTMLInputElement).value = '';
            fetchItemsAndCategories();
            onUpdate();
        } catch (error: any) {
            toast.error(error.message, { id: toastId });
        }
    };

    const handleDeleteItem = async (item: ClothingItem) => {
        if (window.confirm(`Are you sure you want to delete this item from the "${item.category}" category? This cannot be undone.`)) {
            const toastId = toast.loading('Deleting item...');
            try {
                await deleteClothingItem(item);
                toast.success('Item deleted.', { id: toastId });
                // Invalidate frontend cache
                localStorage.removeItem('uy-closet-featured-items');
                localStorage.removeItem('uy-closet-featured-items-timestamp');
                fetchItemsAndCategories();
                onUpdate();
            } catch (error: any) {
                toast.error(error.message, { id: toastId });
            }
        }
    };

    const handleDeleteAll = async () => {
         if (window.confirm("ARE YOU SURE you want to delete ALL clothing items? This action is permanent!")) {
            const toastId = toast.loading('Deleting all items...');
            try {
                await deleteAllClothingItems();
                toast.success('All items deleted.', { id: toastId });
                // Invalidate frontend cache
                localStorage.removeItem('uy-closet-featured-items');
                localStorage.removeItem('uy-closet-featured-items-timestamp');
                fetchItemsAndCategories();
                onUpdate();
            } catch (error: any) {
                toast.error(error.message, { id: toastId });
            }
        }
    }

    return (
        <div className="space-y-8">
            <Panel title="Add New Clothing Item">
                 <form onSubmit={handleAddItem} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select value={newItemCategory} onChange={(e) => setNewItemCategory(e.target.value)} className="w-full p-2 border rounded bg-white text-brand-text" required>
                             <option value="" disabled>Select a category...</option>
                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                        <input type="file" id="file-upload" onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-accent file:text-brand-primary hover:file:bg-brand-secondary/40" accept="image/*" required />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded hover:bg-brand-primary/90">Add Item</button>
                 </form>
                 <CategoriesManager categories={categories} onUpdate={() => { fetchItemsAndCategories(); onUpdate(); }} />
            </Panel>
            <Panel title={`Manage Clothing Items (${items.length})`}>
                {items.length > 0 && <button onClick={handleDeleteAll} className="float-right -mt-12 text-sm text-red-500 hover:text-red-700">Delete All</button>}
                {loading ? <p>Loading items...</p> : items.length === 0 ? <p>No items found.</p> :
                    <div className="w-full">
                        <table className="w-full text-sm text-left text-brand-text">
                            <thead className="text-xs text-brand-primary uppercase bg-brand-accent/50 hidden md:table-header-group">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Item</th>
                                    <th scope="col" className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="flex flex-col md:table-row-group gap-4">
                                {items.map(item => (
                                    <tr key={item.id} className="bg-white border-b hover:bg-brand-bg/50 flex flex-col md:table-row p-4 md:p-0 rounded-lg shadow-md md:shadow-none">
                                        <td data-label="Item" className="px-6 py-4 font-medium text-brand-text whitespace-nowrap md:w-auto">
                                            <div className="flex items-center gap-4">
                                                <img src={item.image_url} alt={item.name} className="w-16 h-20 object-cover rounded"/>
                                                <div className="flex-grow">
                                                    <div className="font-bold">{item.category}</div>
                                                    <div className="text-xs text-gray-500 font-mono">Code: {item.product_code}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 flex justify-end">
                                            <button onClick={() => handleDeleteItem(item)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                }
            </Panel>
        </div>
    );
};

// --- Review Image Management Panel ---
const ImageManagementPanel: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
    const { reviewImages, loading, addImages, deleteImage, deleteAllImages } = useReviews();
    const [files, setFiles] = useState<FileList | null>(null);
    const [altTexts, setAltTexts] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        setFiles(selectedFiles);
        if (selectedFiles) {
            setAltTexts(Array(selectedFiles.length).fill(''));
        } else {
            setAltTexts([]);
        }
    };

    const handleAltTextChange = (index: number, value: string) => {
        setAltTexts(prev => {
            const newAlts = [...prev];
            newAlts[index] = value;
            return newAlts;
        });
    };

    const handleUpload = async () => {
        if (!files || files.length === 0) return;
        const uploads = Array.from(files).map((file, i) => ({ file, altText: altTexts[i] || null }));
        try {
            await addImages(uploads);
            setFiles(null);
            setAltTexts([]);
            if (fileInputRef.current) fileInputRef.current.value = '';
            onUpdate(); // Update dashboard stats
        } catch (error) {
            // Error is already toasted in context
        }
    };

    const handleDelete = async (image: ReviewImage) => {
        if (window.confirm('Are you sure you want to delete this review image?')) {
            try {
                await deleteImage(image);
                onUpdate(); // Update dashboard stats
            } catch (error) {
                 // Error is already toasted in context
            }
        }
    };

    const handleDeleteAll = async () => {
        if (window.confirm(`ARE YOU SURE you want to delete ALL review images? This is permanent!`)) {
            try {
                await deleteAllImages();
                onUpdate(); // Update dashboard stats
            } catch (error) {
                // Error is already toasted in context
            }
        }
    };

    return (
        <Panel title="Review Images">
            <div className="mb-6 border-b pb-6">
                <input type="file" multiple onChange={handleFileChange} ref={fileInputRef} accept="image/*" className="mb-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-accent file:text-brand-primary hover:file:bg-brand-secondary/40" />
                {files && Array.from(files).map((file, i) => (
                    <div key={i} className="flex gap-2 items-center mb-2">
                        <span className="text-sm truncate flex-1">{file.name}</span>
                        <input type="text" placeholder="Alt text (optional)" value={altTexts[i]} onChange={(e) => handleAltTextChange(i, e.target.value)} className="p-1 border rounded text-sm w-1/2 bg-white text-brand-text" />
                    </div>
                ))}
                {files && files.length > 0 && <button onClick={handleUpload} className="px-4 py-2 bg-brand-primary text-white rounded hover:bg-brand-primary/90 mt-2">Upload</button>}
            </div>

            {reviewImages.length > 0 && <button onClick={handleDeleteAll} className="float-right -mt-4 text-sm text-red-500 hover:text-red-700">Delete All</button>}
            <h4 className="font-bold mb-4">Current Images ({reviewImages.length})</h4>
            {loading ? <p>Loading...</p> : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {reviewImages.map(img => (
                        <div key={img.id} className="relative group border rounded-lg overflow-hidden shadow-sm">
                            <img src={img.image_url} alt={img.alt_text || ''} className="w-full h-32 object-cover" />
                             <div className="p-2 flex justify-end">
                                <button onClick={() => handleDelete(img)} className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"><TrashIcon className="w-4 h-4"/></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Panel>
    );
};

// --- Newsletter Panel ---
const NewsletterPanel: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
    const [subscribers, setSubscribers] = useState<NewsletterSubscription[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSubscribers = useCallback(async () => {
        setLoading(true);
        try {
            setSubscribers(await getNewsletterSubscribers());
        } catch(e:any) { toast.error(e.message) }
        finally { setLoading(false) }
    }, []);

    useEffect(() => { fetchSubscribers() }, [fetchSubscribers]);

    const handleDelete = async (id: number) => {
        if (window.confirm("Delete this subscriber?")) {
            const toastId = toast.loading("Deleting subscriber...");
            try {
                await deleteNewsletterSubscriber(id);
                toast.success("Subscriber deleted.", { id: toastId });
                fetchSubscribers();
                onUpdate();
            } catch (e: any) { 
                toast.error(e.message, { id: toastId });
            }
        }
    };

    const handleDeleteAll = async () => {
        if (window.confirm("ARE YOU SURE you want to delete ALL subscribers?")) {
             try {
                await deleteAllNewsletterSubscribers();
                toast.success("All subscribers deleted.");
                fetchSubscribers();
                onUpdate();
            } catch (e: any) { toast.error(e.message) }
        }
    }
    
    const exportAsCSV = () => {
        if (subscribers.length === 0) {
            toast.error("No subscribers to export.");
            return;
        }

        const headers = "Email,SubscribedAt\n";
        const csvContent = subscribers
            .map(s => `"${s.email}","${new Date(s.created_at).toISOString()}"`)
            .join("\n");

        const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute("download", `uys-closet-subscribers-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Subscriber list exported.");
    };

    return (
        <Panel title={`Newsletter Subscribers (${subscribers.length})`}>
            {subscribers.length > 0 && (
                <div className="flex gap-2 mb-4">
                    <button onClick={exportAsCSV} className="text-sm px-3 py-1 bg-green-100 text-green-700 rounded">Export as CSV</button>
                    <button onClick={handleDeleteAll} className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded">Delete All</button>
                </div>
            )}
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                {loading ? <p>Loading...</p> : subscribers.length === 0 ? <p>No subscribers yet.</p> : subscribers.map(s => (
                    <div key={s.id} className="flex justify-between items-center p-2 border-b">
                        <div>
                            <p>{s.email}</p>
                            <p className="text-xs text-gray-500">Subscribed: {new Date(s.created_at).toLocaleDateString()}</p>
                        </div>
                        <button onClick={() => handleDelete(s.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                ))}
            </div>
        </Panel>
    );
};


// --- Settings Panel ---
const SettingsPanel: React.FC<{ onUpdate: () => void }> = ({ onUpdate }) => {
    const { config: initialConfig, loading: loadingConfig, refetchConfig } = useSiteConfig();
    const [config, setConfig] = useState<SiteConfig>(initialConfig);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        setConfig(initialConfig);
        setIsDirty(false);
    }, [initialConfig]);
    
    const handleSimpleChange = (section: keyof SiteConfig, value: string) => {
        setIsDirty(true);
        setConfig(prev => {
            const newConfig = { ...prev };
            let updatedSection: any = { ...newConfig[section] };

            switch (section) {
                case 'contactEmail':
                    updatedSection = { value, href: `mailto:${value}` };
                    break;
                case 'contactWhatsapp':
                    const cleanedWhatsapp = value.replace(/[^+\d]/g, '');
                    updatedSection = { value, href: `https://wa.me/${cleanedWhatsapp}` };
                    break;
                case 'contactPhone':
                     const cleanedPhone = value.replace(/[^\d]/g, '');
                    updatedSection = { value, href: `tel:${cleanedPhone}` };
                    break;
                case 'socialInstagram':
                    const cleanedInsta = value.replace('@', '');
                    updatedSection = { handle: `@${cleanedInsta}`, href: `https://instagram.com/${cleanedInsta}` };
                    break;
                case 'socialTiktok':
                    const cleanedTiktok = value.replace('@', '');
                    updatedSection = { handle: `@${cleanedTiktok}`, href: `https://tiktok.com/@${cleanedTiktok}` };
                    break;
                default:
                    // For any other keys that might not be objects
                    return { ...newConfig, [section]: value };
            }
            return { ...newConfig, [section]: updatedSection };
        });
    };

    const handleSave = async () => {
        const updates = Object.keys(config).map(key => ({
            key: key.replace(/([A-Z])/g, '_$1').toLowerCase(), // camelCase to snake_case
            value: config[key as keyof SiteConfig]
        }));
        
        const toastId = toast.loading('Saving settings...');
        try {
            await updateSiteConfig(updates as { key: string; value: Json }[]);
            await refetchConfig();
            toast.success('Settings saved!', { id: toastId });
            onUpdate();
            setIsDirty(false);
        } catch (e: any) {
            toast.error(e.message, { id: toastId });
        }
    }

    if (loadingConfig) return <p>Loading settings...</p>;

    return (
        <Panel title="Site Settings">
            <div className="space-y-8">
                <div>
                    <h4 className="font-bold text-lg mb-2">Contact Information</h4>
                    <div className="space-y-4 p-4 border rounded-lg">
                        <div>
                            <label htmlFor="contact-email" className="block text-sm font-medium text-brand-text mb-1">Contact Email</label>
                            <input id="contact-email" type="email" placeholder="e.g., contact@uyscloset.com" value={config.contactEmail?.value || ''} onChange={e => handleSimpleChange('contactEmail', e.target.value)} className="w-full p-2 border rounded bg-white text-brand-text" />
                            <p className="text-xs text-gray-500 mt-1">This will be used for email links.</p>
                        </div>
                        <div>
                            <label htmlFor="contact-whatsapp" className="block text-sm font-medium text-brand-text mb-1">WhatsApp Number</label>
                            <input id="contact-whatsapp" type="text" placeholder="e.g., +2348012345678" value={config.contactWhatsapp?.value || ''} onChange={e => handleSimpleChange('contactWhatsapp', e.target.value)} className="w-full p-2 border rounded bg-white text-brand-text" />
                            <p className="text-xs text-gray-500 mt-1">Include country code. Used for WhatsApp click-to-chat links.</p>
                        </div>
                        <div>
                            <label htmlFor="contact-phone" className="block text-sm font-medium text-brand-text mb-1">Public Phone Number</label>
                            <input id="contact-phone" type="tel" placeholder="e.g., 08012345678" value={config.contactPhone?.value || ''} onChange={e => handleSimpleChange('contactPhone', e.target.value)} className="w-full p-2 border rounded bg-white text-brand-text" />
                            <p className="text-xs text-gray-500 mt-1">Used for 'tap-to-call' links.</p>
                        </div>
                    </div>
                </div>

                 <div>
                    <h4 className="font-bold text-lg mb-2">Social Media</h4>
                    <div className="space-y-4 p-4 border rounded-lg">
                        <div>
                            <label htmlFor="social-instagram" className="block text-sm font-medium text-brand-text mb-1">Instagram Handle</label>
                            <div className="flex items-center">
                                <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md h-10">@</span>
                                <input id="social-instagram" type="text" placeholder="uys_closet" value={(config.socialInstagram?.handle || '').replace('@','')} onChange={e => handleSimpleChange('socialInstagram', e.target.value)} className="w-full p-2 border rounded-r-md bg-white text-brand-text" />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Just the username. The app will create the profile link.</p>
                        </div>
                        <div>
                            <label htmlFor="social-tiktok" className="block text-sm font-medium text-brand-text mb-1">TikTok Handle</label>
                            <div className="flex items-center">
                                <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md h-10">@</span>
                                <input id="social-tiktok" type="text" placeholder="uyscloset" value={(config.socialTiktok?.handle || '').replace('@','')} onChange={e => handleSimpleChange('socialTiktok', e.target.value)} className="w-full p-2 border rounded-r-md bg-white text-brand-text" />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Just the username. The app will create the profile link.</p>
                        </div>
                    </div>
                </div>
                <button onClick={handleSave} disabled={!isDirty || loadingConfig} className="px-6 py-2 bg-brand-primary text-white rounded disabled:bg-brand-secondary">
                    {isDirty ? 'Save Changes' : 'Saved'}
                </button>
            </div>
        </Panel>
    );
};


// --- Usage Monitor Skeleton ---
const UsageMonitorSkeleton = () => (
    <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
        <div className="h-7 w-1/2 bg-gray-300 rounded-md mb-4"></div>
        <div className="space-y-6">
            <div>
                <div className="flex justify-between items-baseline mb-2">
                    <div className="h-5 w-1/3 bg-gray-200 rounded-md"></div>
                    <div className="h-4 w-1/4 bg-gray-200 rounded-md"></div>
                </div>
                <div className="h-2.5 w-full bg-gray-200 rounded-full"></div>
            </div>
             {[...Array(2)].map((_, i) => (
                <div key={i} className="flex justify-between items-baseline">
                    <div className="h-5 w-1/3 bg-gray-200 rounded-md"></div>
                    <div className="h-4 w-1/4 bg-gray-200 rounded-md"></div>
                </div>
            ))}
        </div>
    </div>
);

// --- Usage Monitor ---
const UsageMonitor: React.FC<{ stats: { totalImages: number; items: number; reviews: number; storage: number; subscribers: number } }> = ({ stats }) => {
    const { totalImages, items, reviews, storage, subscribers } = stats;
    const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
    
    const STORAGE_LIMIT_BYTES = 1000 * 1024 * 1024; // 1000 MB

    const formatBytes = (bytes: number, decimals = 2): string => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    const usagePercentage = Math.min((storage / STORAGE_LIMIT_BYTES) * 100, 100);
    
    let progressBarColor = 'bg-brand-secondary';
    if (usagePercentage > 90) progressBarColor = 'bg-red-500';
    else if (usagePercentage > 75) progressBarColor = 'bg-orange-500';

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold font-serif text-brand-primary mb-4">Usage Monitor</h3>
            <div className="space-y-4">
                <div>
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="text-sm font-medium text-brand-text">Storage Usage</span>
                        <span className="text-xs font-mono text-brand-secondary">
                            {formatBytes(storage)} / {formatBytes(STORAGE_LIMIT_BYTES, 0)}
                        </span>
                    </div>
                    <div className="w-full bg-brand-accent rounded-full h-2.5"><div className={`${progressBarColor} h-2.5 rounded-full`} style={{ width: `${usagePercentage}%` }}></div></div>
                </div>
                <div className="text-sm">
                    <button onClick={() => setIsBreakdownOpen(!isBreakdownOpen)} className="flex justify-between items-center w-full font-medium text-brand-text hover:text-brand-primary">
                        <span>Total Images</span>
                        <span className="flex items-center gap-1 font-mono text-brand-secondary">{totalImages} <ChevronLeftIcon className={`w-4 h-4 transition-transform ${isBreakdownOpen ? '-rotate-90' : 'rotate-0'}`} /></span>
                    </button>
                    <AnimatePresence>{isBreakdownOpen && (<motion.div initial="collapsed" animate="open" exit="collapsed" variants={{ open: { opacity: 1, height: 'auto', marginTop: '8px' }, collapsed: { opacity: 0, height: 0, marginTop: '0px' } }} transition={{ duration: 0.3 }} className="pl-4 border-l-2 border-brand-accent/50 text-xs"><p className="flex justify-between"><span>Clothing Items:</span> <span>{items}</span></p><p className="flex justify-between"><span>Review Images:</span> <span>{reviews}</span></p></motion.div>)}</AnimatePresence>
                </div>
                <div className="text-sm flex justify-between"><span className="font-medium text-brand-text">Newsletter Subscribers</span><span className="font-mono text-brand-secondary">{subscribers}</span></div>
            </div>
        </div>
    );
};

// --- Login Screen ---
const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) toast.error(error.message);
        else toast.success('Logged in successfully!');
        setLoading(false);
    };

    return (
        <div className="max-w-md mx-auto mt-10"><div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold font-serif text-brand-primary text-center mb-6">Admin Login</h2>
            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-brand-text">Email</label>
                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" required />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-brand-text">Password</label>
                    <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" required />
                </div>
                <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 disabled:bg-brand-secondary">{loading ? 'Logging in...' : 'Log In'}</button>
            </form>
        </div></div>
    );
};

// --- Admin Dashboard Navigation Card ---
const AdminCard: React.FC<{ icon: React.FC<any>; title: string; onClick: () => void; }> = ({ icon: Icon, title, onClick }) => (
    <motion.button
        onClick={onClick}
        whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" }}
        transition={{ type: "spring", stiffness: 300 }}
        className="p-6 bg-white rounded-lg shadow-md text-left w-full flex flex-col items-start"
    >
        <div className="p-3 bg-brand-accent rounded-full mb-4">
            <Icon className="w-6 h-6 text-brand-primary" />
        </div>
        <h3 className="text-lg font-bold font-serif text-brand-primary">{title}</h3>
    </motion.button>
);


// --- Admin Dashboard ---
const AdminDashboard: React.FC = () => {
    const { refetchConfig } = useSiteConfig();
    const [activePanel, setActivePanel] = useState<AdminPanel>('stats');
    const [stats, setStats] = useState({ totalImages: 0, items: 0, reviews: 0, storage: 0, subscribers: 0 });
    const [loadingStats, setLoadingStats] = useState(true);

    const fetchAllStats = useCallback(async () => {
        setLoadingStats(true);
        try {
            const [itemCount, reviewCount, storage, subscriberCount] = await Promise.all([
                getClothingItemCount(), getReviewImageCount(), getStorageUsage(), getNewsletterSubscriberCount()
            ]);
            setStats({ totalImages: itemCount + reviewCount, items: itemCount, reviews: reviewCount, storage, subscribers: subscriberCount });
        } catch (err: any) {
            toast.error("Failed to load dashboard stats.");
            console.error(err);
        } finally {
            setLoadingStats(false);
        }
    }, []);

    useEffect(() => { fetchAllStats(); }, [fetchAllStats]);
    
    const navItems = [
        { id: 'items', label: 'Collections', icon: BoxIcon },
        { id: 'reviews', label: 'Review Images', icon: StarIcon },
        { id: 'newsletter', label: 'Newsletter', icon: MailIcon },
        { id: 'settings', label: 'Site Settings', icon: SettingsIcon },
    ] as const;

    const PanelContent = () => {
        switch (activePanel) {
            case 'items': return <ClothingItemsPanel onUpdate={fetchAllStats} />;
            case 'reviews': return <ImageManagementPanel onUpdate={fetchAllStats} />;
            case 'newsletter': return <NewsletterPanel onUpdate={fetchAllStats} />;
            case 'settings': return <SettingsPanel onUpdate={refetchConfig} />;
            default: return <div />;
        }
    };

    const PanelViewWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <div>
            <button
                onClick={() => setActivePanel('stats')}
                className="flex items-center gap-2 mb-6 font-semibold text-brand-primary hover:text-brand-primary/80 transition-colors"
            >
                <ChevronLeftIcon className="w-5 h-5" />
                <span>Back to Dashboard</span>
            </button>
            <AnimatePresence mode="wait">
                <motion.div
                    key={activePanel}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </div>
    );
    
    if (activePanel !== 'stats') {
        return (
            <PanelViewWrapper>
                <ScrolledOnMount>
                    <PanelContent />
                </ScrolledOnMount>
            </PanelViewWrapper>
        );
    }
    
    return (
        <div>
            <div className="mb-8">
                {loadingStats ? <UsageMonitorSkeleton /> : <UsageMonitor stats={stats} />}
            </div>

             <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold font-serif text-brand-primary mb-2">Admin Dashboard</h3>
                <p className="text-brand-secondary mb-8">
                    This is your central hub for managing Uy's Closet. Select a panel below to get started.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {navItems.map(item => (
                        <AdminCard
                            key={item.id}
                            icon={item.icon}
                            title={item.label}
                            onClick={() => setActivePanel(item.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---
const AdminPage: React.FC = () => {
    const { session, loading } = useAuth();

    if (loading) {
        return <div className="text-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div><p className="mt-4 text-brand-secondary">Loading...</p></div>;
    }

    return <div>{session ? <AdminDashboard /> : <LoginScreen />}</div>;
};

export default AdminPage;
