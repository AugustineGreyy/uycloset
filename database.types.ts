export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: any }
  | any[]

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
          name?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
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
          is_review: boolean
        }
        Insert: {
          category?: string
          created_at?: string
          id?: number
          image_path?: string
          image_url?: string
          name?: string
          product_code?: string
          is_review?: boolean
        }
        Update: {
          category?: string
          created_at?: string
          id?: number
          image_path?: string
          image_url?: string
          name?: string
          product_code?: string
          is_review?: boolean
        }
        Relationships: []
      }
      newsletter_subscriptions: {
        Row: {
          created_at: string
          email: string
          id: number
        }
        Insert: {
          created_at?: string
          email?: string
          id?: number
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
        }
        Relationships: []
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
          key?: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
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
          expires_at?: string
          id?: string
          item_ids?: Json
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          item_ids?: Json
        }
        Relationships: []
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