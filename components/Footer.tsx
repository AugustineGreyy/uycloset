

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { InstagramIcon, TikTokIcon, WhatsAppIcon, MailIcon, PhoneIcon } from './Icons';
import { useSiteConfig } from '../contexts/SiteConfigContext';
import GlobalContactCTA from './GlobalContactCTA';
import { addNewsletterSubscriber } from '../services/supabase';
import toast from 'react-hot-toast';

const FooterSkeleton: React.FC = () => {
    const location = useLocation();
    const isAdminPage = location.pathname === '/admin';

    return (
        <footer className="bg-brand-bg text-brand-text mt-16 border-t border-brand-accent">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
                {/* Newsletter Skeleton */}
                {!isAdminPage && (
                    <div className="text-center mb-12 pb-12 border-b border-brand-accent">
                        <div className="h-9 w-2/3 bg-gray-300 rounded-md mx-auto mb-4"></div>
                        <div className="h-4 w-5/6 bg-gray-200 rounded-md mx-auto mb-8"></div>
                        <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                            <div className="flex-grow h-12 bg-gray-200 rounded-md"></div>
                            <div className="h-12 w-32 bg-gray-300 rounded-md"></div>
                        </div>
                    </div>
                )}
                {/* Main grid skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-1 space-y-2">
                        <div className="h-6 w-3/4 bg-gray-300 rounded"></div>
                        <div className="h-4 w-full bg-gray-200 rounded"></div>
                        <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                    </div>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="space-y-3">
                            <div className="h-5 w-1/2 bg-gray-300 rounded"></div>
                            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                            <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
                <div className="mt-12 pt-8 border-t border-brand-secondary/30 text-center">
                    <div className="h-4 w-1/3 bg-gray-200 rounded mx-auto"></div>
                </div>
            </div>
        </footer>
    );
};

const NewsletterSection = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email address.");
            return;
        }
        setLoading(true);
        const toastId = toast.loading("Subscribing...");
        try {
            await addNewsletterSubscriber(email);
            toast.success("Thanks for subscribing!", { id: toastId });
            setEmail('');
        } catch (error: any) {
            toast.error(error.message || "Subscription failed.", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="text-center mb-12 pb-12 border-b border-brand-accent">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-primary mb-4">Join Our Style Circle</h2>
            <p className="text-brand-secondary max-w-xl mx-auto mb-8">
                Be the first to know about new arrivals, exclusive sales, and styling tips. Subscribe to the Uy's Closet newsletter!
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    className="flex-grow px-4 py-3 rounded-md border border-gray-300 bg-white text-brand-text focus:ring-brand-primary focus:border-brand-primary transition-shadow shadow-sm"
                    disabled={loading}
                    aria-label="Email for newsletter"
                />
                <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-brand-primary text-white font-bold py-3 px-6 rounded-md shadow-lg hover:bg-brand-primary/90 transition-all duration-300 disabled:bg-brand-secondary"
                >
                    {loading ? "Subscribing..." : "Subscribe"}
                </motion.button>
            </form>
        </div>
    );
}

const Footer: React.FC = () => {
    const { config, loading } = useSiteConfig();
    const location = useLocation();
    const isAdminPage = location.pathname === '/admin';

    if (loading) {
        return <FooterSkeleton />;
    }
    
    const socialLinks = [
        { name: 'Instagram', href: config.socialInstagram?.href, icon: InstagramIcon },
        { name: 'TikTok', href: config.socialTiktok?.href, icon: TikTokIcon },
    ].filter(link => link.href && link.href !== '#');

    const contactInfo = [
        { name: 'Email', value: config.contactEmail?.value, href: config.contactEmail?.href, icon: MailIcon },
        { name: 'WhatsApp', value: config.contactWhatsapp?.value, href: config.contactWhatsapp?.href, icon: WhatsAppIcon },
        { name: 'Phone', value: config.contactPhone?.value, href: config.contactPhone?.href, icon: PhoneIcon },
    ].filter(info => info.value && info.href && info.href !== '#');

    return (
        <footer className="bg-brand-bg text-brand-text mt-16 border-t border-brand-accent">
            {!isAdminPage && <GlobalContactCTA />}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {!isAdminPage && <NewsletterSection />}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
                    <div className="md:col-span-1">
                        <h3 className="text-xl font-serif font-bold text-brand-primary">Uy's Closet</h3>
                        <p className="mt-2 text-sm text-brand-secondary">
                            Sales of thrifted classy gowns, sexy gowns, flattering bodysuits, bralettes, chic crop tops, and bum shorts.
                        </p>
                    </div>
                     <div>
                        <h3 className="text-lg font-bold text-brand-primary uppercase tracking-wider">Quick Links</h3>
                        <ul className="mt-4 space-y-3">
                            <li><Link to="/" className="text-sm text-brand-secondary hover:text-brand-primary transition-colors">Home</Link></li>
                            <li><Link to="/collection" className="text-sm text-brand-secondary hover:text-brand-primary transition-colors">Collection</Link></li>
                            <li><Link to="/wishlist" className="text-sm text-brand-secondary hover:text-brand-primary transition-colors">Wishlist</Link></li>
                        </ul>
                    </div>
                    {contactInfo.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-brand-primary uppercase tracking-wider">Contact Us</h3>
                            <ul className="mt-4 space-y-3">
                                {contactInfo.map((item) => (
                                    <li key={item.name}>
                                        <a href={item.href} className="flex items-center justify-center md:justify-start space-x-3 text-sm text-brand-secondary hover:text-brand-primary transition-colors">
                                            <item.icon className="w-5 h-5" />
                                            <span>{item.value}</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {socialLinks.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-brand-primary uppercase tracking-wider">Follow Us</h3>
                            <div className="flex justify-center md:justify-start mt-4 space-x-6">
                                {socialLinks.map((item) => (
                                    <a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer" className="text-brand-secondary hover:text-brand-primary transition-colors">
                                        <span className="sr-only">{item.name}</span>
                                        <item.icon className="h-7 w-7" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="mt-12 pt-8 border-t border-brand-secondary/30 text-center text-sm text-brand-secondary">
                    <p>&copy; {new Date().getFullYear()} Uy's Closet. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;