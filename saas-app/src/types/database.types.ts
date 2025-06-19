export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          subscription_tier: 'free' | 'professional' | 'studio' | 'enterprise'
          subscription_status: 'active' | 'canceled' | 'past_due' | null
          stripe_customer_id: string | null
          credits_remaining: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          subscription_tier?: 'free' | 'professional' | 'studio' | 'enterprise'
          subscription_status?: 'active' | 'canceled' | 'past_due' | null
          stripe_customer_id?: string | null
          credits_remaining?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          subscription_tier?: 'free' | 'professional' | 'studio' | 'enterprise'
          subscription_status?: 'active' | 'canceled' | 'past_due' | null
          stripe_customer_id?: string | null
          credits_remaining?: number
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      renders: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          input_image_url: string
          output_image_url: string | null
          style: string
          settings: Json
          status: 'pending' | 'processing' | 'completed' | 'failed'
          error_message: string | null
          processing_time_ms: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          input_image_url: string
          output_image_url?: string | null
          style: string
          settings?: Json
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          processing_time_ms?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          input_image_url?: string
          output_image_url?: string | null
          style?: string
          settings?: Json
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          processing_time_ms?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}