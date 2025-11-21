/**
 * TypeScript types for Supabase database schema
 * These provide full type safety for database operations
 */

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
      clients: {
        Row: {
          id: string
          name: string
          contact_name: string | null
          contact_email: string | null
          user_id: string | null
          active: boolean
          subscription_tier: 'starter' | 'pro' | 'enterprise'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          contact_name?: string | null
          contact_email?: string | null
          user_id?: string | null
          active?: boolean
          subscription_tier?: 'starter' | 'pro' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact_name?: string | null
          contact_email?: string | null
          user_id?: string | null
          active?: boolean
          subscription_tier?: 'starter' | 'pro' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
      }
      client_integrations: {
        Row: {
          id: string
          client_id: string
          type: string
          config: Json
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          type: string
          config: Json
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          type?: string
          config?: Json
          is_active?: boolean
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          client_id: string
          type: 'daily' | 'weekly' | 'monthly'
          report_date: string
          subject: string
          body_markdown: string
          kpi_summary: Json
          issues_summary: Json
          actions: Json
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          type: 'daily' | 'weekly' | 'monthly'
          report_date: string
          subject: string
          body_markdown: string
          kpi_summary: Json
          issues_summary: Json
          actions: Json
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          type?: 'daily' | 'weekly' | 'monthly'
          report_date?: string
          subject?: string
          body_markdown?: string
          kpi_summary?: Json
          issues_summary?: Json
          actions?: Json
          sent_at?: string | null
          created_at?: string
        }
      }
      issues: {
        Row: {
          id: string
          client_id: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          title: string
          description: string | null
          data: Json | null
          detected_at: string
          status: 'open' | 'acknowledged' | 'resolved'
          resolved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          title: string
          description?: string | null
          data?: Json | null
          detected_at?: string
          status?: 'open' | 'acknowledged' | 'resolved'
          resolved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          severity?: 'low' | 'medium' | 'high' | 'critical'
          title?: string
          description?: string | null
          data?: Json | null
          detected_at?: string
          status?: 'open' | 'acknowledged' | 'resolved'
          resolved_at?: string | null
          created_at?: string
        }
      }
      actions: {
        Row: {
          id: string
          client_id: string
          title: string
          description: string | null
          impact_score: number | null
          confidence: number | null
          status: 'open' | 'in_progress' | 'done'
          created_at: string
          due_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          client_id: string
          title: string
          description?: string | null
          impact_score?: number | null
          confidence?: number | null
          status?: 'open' | 'in_progress' | 'done'
          created_at?: string
          due_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          title?: string
          description?: string | null
          impact_score?: number | null
          confidence?: number | null
          status?: 'open' | 'in_progress' | 'done'
          created_at?: string
          due_at?: string | null
          completed_at?: string | null
        }
      }
      csv_uploads: {
        Row: {
          id: string
          client_id: string
          uploaded_by: string | null
          file_name: string
          file_url: string
          data_type: 'sales' | 'warehouse' | 'staff' | 'support' | 'finance' | 'mixed'
          row_count: number | null
          status: 'pending' | 'processed' | 'failed'
          error_message: string | null
          processed_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          uploaded_by?: string | null
          file_name: string
          file_url: string
          data_type: 'sales' | 'warehouse' | 'staff' | 'support' | 'finance' | 'mixed'
          row_count?: number | null
          status?: 'pending' | 'processed' | 'failed'
          error_message?: string | null
          processed_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          uploaded_by?: string | null
          file_name?: string
          file_url?: string
          data_type?: 'sales' | 'warehouse' | 'staff' | 'support' | 'finance' | 'mixed'
          row_count?: number | null
          status?: 'pending' | 'processed' | 'failed'
          error_message?: string | null
          processed_data?: Json | null
          created_at?: string
        }
      }
      kpi_snapshots: {
        Row: {
          id: string
          client_id: string
          kpi_key: string
          value: number
          unit: string | null
          snapshot_at: string
          meta: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          kpi_key: string
          value: number
          unit?: string | null
          snapshot_at: string
          meta?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          kpi_key?: string
          value?: number
          unit?: string | null
          snapshot_at?: string
          meta?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_client_id_for_user: {
        Args: Record<string, never>
        Returns: string | null
      }
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
