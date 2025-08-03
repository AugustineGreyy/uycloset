
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFoundPage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center text-center py-20 min-h-[60vh]">
            <motion.div
                initial={{ opacity: 0, y: -50, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
            >
                <h1 className="text-9xl font-serif font-extrabold text-brand-primary tracking-tighter">
                    404
                </h1>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <h2 className="mt-4 text-3xl md:text-4xl font-serif font-bold text-brand-primary">
                    Oops! Page Not Found
                </h2>
                <p className="mt-4 max-w-lg mx-auto text-lg text-brand-secondary">
                    It seems you've wandered off the path. The page you're looking for doesn't exist or has been moved.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-8"
            >
                <Link to="/">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-brand-primary text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-brand-primary/90 transition-all duration-300"
                    >
                        Return to Homepage
                    </motion.button>
                </Link>
            </motion.div>
        </div>
    );
};

export default NotFoundPage;
