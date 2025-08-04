

import type { Session } from '@supabase/supabase-js';
import { Database } from './database.types';

export type ClothingItem = Database['public']['Tables']['clothing_items']['Row'];
export type ReviewImage = Database['public']['Tables']['review_images']['Row'];
export type NewsletterSubscription = Database['public']['Tables']['newsletter_subscriptions']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];

export interface SiteConfig {
    contactEmail?: { value: string; href: string };
    contactWhatsapp?: { value: string; href: string };
    contactPhone?: { value: string; href: string };
    socialInstagram?: { href: string; handle: string };
    socialTiktok?: { href: string; handle: string };
    [key: string]: any;
}

export interface AuthContextType {
  session: Session | null;
  loading: boolean;
}

export interface WishlistContextType {
    wishlist: number[];
    addToWishlist: (id: number) => void;
    removeFromWishlist: (id: number) => void;
    isInWishlist: (id: number) => boolean;
    clearWishlist: () => void;
}

export interface ReviewsContextType {
    reviewImages: ReviewImage[];
    displayedReviewImages: ReviewImage[];
    loading: boolean;
    addImages: (uploads: { file: File, altText: string | null }[]) => Promise<void>;
    deleteImage: (image: ReviewImage) => Promise<void>;
    deleteAllImages: () => Promise<void>;
}