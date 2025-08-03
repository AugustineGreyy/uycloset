
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MailIcon } from './Icons';

const GlobalContactCTA: React.FC = () => {
    const location = useLocation();

    // Don't show this component on the contact page itself
    if (location.pathname === '/contact') {
        return null;
    }

    return (
        <div className="border-b border-brand-accent">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                 <motion.div
                    className="bg-brand-primary text-white rounded-lg shadow-xl p-8 md:p-12"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                        <div className="flex-shrink-0 hidden md:block">
                            <MailIcon className="w-16 h-16 text-brand-accent/50" />
                        </div>
                        <div className="flex-grow">
                            <h2 className="text-3xl font-serif font-bold">Have a Question or Inquiry?</h2>
                            <p className="mt-2 text-brand-accent/80 max-w-2xl mx-auto md:mx-0">
                                Whether you want to place an order, ask about an item, or just say hello, we're here to help.
                            </p>
                        </div>
                        <div className="flex-shrink-0 mt-4 md:mt-0">
                            <Link to="/contact">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-white text-brand-primary font-bold py-3 px-8 rounded-full shadow-lg hover:bg-brand-accent transition-colors duration-300"
                                >
                                    Contact Us
                                </motion.button>
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default GlobalContactCTA;
