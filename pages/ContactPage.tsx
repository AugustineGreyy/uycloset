
import React from 'react';
import { InstagramIcon, TikTokIcon, WhatsAppIcon, MailIcon, PhoneIcon } from '../components/Icons';
import { motion } from 'framer-motion';
import { useSiteConfig } from '../contexts/SiteConfigContext';

interface ContactInfoItem {
    name: string;
    value?: string;
    href?: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

const ContactCard: React.FC<{ item: ContactInfoItem }> = ({ item }) => {
    if (!item.value || !item.href || item.href === '#') return null;

    return (
        <motion.a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-6 bg-gradient-to-br from-brand-accent to-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            whileHover={{ y: -5 }}
        >
            <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 bg-brand-accent p-3 rounded-full">
                    <item.icon className="h-6 w-6 text-brand-primary" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-brand-primary">{item.name}</h3>
                    <p className="text-brand-secondary">{item.value}</p>
                </div>
            </div>
        </motion.a>
    );
};

const ContactCardSkeleton: React.FC = () => (
    <div className="block p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center space-x-4 animate-pulse">
            <div className="flex-shrink-0 bg-gray-200 rounded-full w-12 h-12"></div>
            <div className="w-full space-y-2">
                <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
            </div>
        </div>
    </div>
);


const ContactPage: React.FC = () => {
    const { config, loading } = useSiteConfig();

    const socialLinks = [
        { name: 'Instagram', href: config.socialInstagram?.href, icon: InstagramIcon, handle: config.socialInstagram?.handle },
        { name: 'TikTok', href: config.socialTiktok?.href, icon: TikTokIcon, handle: config.socialTiktok?.handle },
    ].filter(link => link.href && link.href !== '#');

    const contactInfo: ContactInfoItem[] = [
        { name: 'Email', value: config.contactEmail?.value, href: config.contactEmail?.href, icon: MailIcon },
        { name: 'WhatsApp', value: config.contactWhatsapp?.value, href: config.contactWhatsapp?.href, icon: WhatsAppIcon },
        { name: 'Phone', value: config.contactPhone?.value, href: config.contactPhone?.href, icon: PhoneIcon },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-primary">Get In Touch</h1>
                <p className="mt-4 text-lg text-brand-secondary max-w-2xl mx-auto">
                    We'd love to hear from you! For orders, inquiries, or collaborations, please reach out through your preferred channel below.
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {[...Array(3)].map((_, i) => (
                       <ContactCardSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {contactInfo.map((item) => (
                        <ContactCard key={item.name} item={item} />
                    ))}
                </div>
            )}
            
            {socialLinks.length > 0 && (
                <div className="text-center">
                    <h2 className="text-3xl font-serif font-bold text-brand-primary mb-6">Follow Our Journey</h2>
                    <div className="flex justify-center items-center space-x-4 sm:space-x-8">
                        {socialLinks.map((item) => (
                            <motion.a 
                                key={item.name} 
                                href={item.href} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex flex-col items-center text-brand-text hover:text-brand-primary transition-colors"
                                whileHover={{ scale: 1.1 }}
                            >
                                <item.icon className="h-12 w-12" />
                                <span className="mt-2 font-semibold">{item.name}</span>
                                {item.handle && <span className="text-sm text-brand-secondary">{item.handle}</span>}
                            </motion.a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactPage;