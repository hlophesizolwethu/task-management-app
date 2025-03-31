export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: string
          priority: string
          assigned_to: string | null
          created_by: string | null
          progress: number
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: string
          priority?: string
          assigned_to?: string | null
          created_by?: string | null
          progress?: number
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: string
          priority?: string
          assigned_to?: string | null
          created_by?: string | null
          progress?: number
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          role: string
          display_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role: string
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: string
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
