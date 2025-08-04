export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
      }
      clothing_items: {
        Row: {
          category: string
          created_at: string
          id: number
          image_path: string
          image_url: string
          name: string
          product_code: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: number
          image_path: string
          image_url: string
          name: string
          product_code: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: number
          image_path?: string
          image_url?: string
          name?: string
          product_code?: string
        }
      }
      newsletter_subscriptions: {
        Row: {
          created_at: string
          email: string
          id: number
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
        }
      }
      review_images: {
        Row: {
          alt_text?: string | null
          created_at: string
          id: number
          image_path: string
          image_url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: number
          image_path: string
          image_url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: number
          image_path?: string
          image_url?: string
        }
      }
      site_config: {
        Row: {
          created_at: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          key?: string
          updated_at?: string
          value?: Json
        }
      }
      wishlists: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          item_ids: Json
        }
        Insert: {
          created_at?: string
          expires_at: string
          id: string
          item_ids: Json
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          item_ids?: Json
        }
      }
    }
    Views: {
      [key: string]: never
    }
    Functions: {
      handle_site_config_update: {
        Args: Record<string, unknown>
        Returns: unknown
      }
    }
    Enums: {
      [key: string]: never
    }
    CompositeTypes: {
      [key: string]: never
    }
  }
}