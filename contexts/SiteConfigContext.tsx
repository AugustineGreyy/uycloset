
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getSiteConfig, getSetupError } from '../services/supabase';
import { SiteConfig } from '../types';

interface SiteConfigContextType {
    config: SiteConfig;
    loading: boolean;
    error: string | null;
    refetchConfig: () => Promise<void>;
}

const SiteConfigContext = createContext<SiteConfigContextType | null>(null);

// Default values for when config is not set in DB
const defaultConfig: SiteConfig = {
    contactEmail: { value: 'your-email@example.com', href: 'mailto:your-email@example.com' },
    contactWhatsapp: { value: 'Your WhatsApp Number', href: '#' },
    contactPhone: { value: 'Your Phone Number', href: '#' },
    socialInstagram: { href: '#', handle: '@your_handle' },
    socialTiktok: { href: '#', handle: '@your_handle' },
};

export const SiteConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [config, setConfig] = useState<SiteConfig>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchConfig = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getSiteConfig();
            // Merge fetched data with defaults to ensure all keys exist
            const mergedConfig: SiteConfig = {
                contactEmail: data.contact_email || defaultConfig.contactEmail,
                contactWhatsapp: data.contact_whatsapp || defaultConfig.contactWhatsapp,
                contactPhone: data.contact_phone || defaultConfig.contactPhone,
                socialInstagram: data.social_instagram || defaultConfig.socialInstagram,
                socialTiktok: data.social_tiktok || defaultConfig.socialTiktok,
            };
            setConfig(mergedConfig);
        } catch (err: any) {
            const setupMsg = getSetupError(err);
            if (setupMsg) {
                setError(setupMsg);
                setConfig(defaultConfig); // Use defaults on setup error
            } else {
                setError('Failed to load site configuration.');
                setConfig(defaultConfig); // Use defaults on other errors
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    const value = { config, loading, error, refetchConfig: fetchConfig };

    return (
        <SiteConfigContext.Provider value={value}>
            {children}
        </SiteConfigContext.Provider>
    );
};

export const useSiteConfig = () => {
    const context = useContext(SiteConfigContext);
    if (context === null) {
        throw new Error('useSiteConfig must be used within a SiteConfigProvider');
    }
    return context;
};
