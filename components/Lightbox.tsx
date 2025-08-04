import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClothingItem } from '../types';

interface LightboxProps {
    item: ClothingItem | null;
    onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ item, onClose }) => {
    return (
        <AnimatePresence>
            {item && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="relative max-w-3xl max-h-[90vh] bg-brand-bg rounded-lg shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img src={item.image_url} alt={item.categories?.join(' / ') || item.name} className="w-full h-auto object-contain max-h-[80vh]" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                            <h3 className="text-xl font-bold text-white font-serif">{item.categories?.join(' / ') || item.name}</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="absolute top-2 right-2 bg-brand-bg/70 text-brand-primary rounded-full p-2 hover:bg-brand-bg transition-colors"
                            aria-label="Close image view"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Lightbox;