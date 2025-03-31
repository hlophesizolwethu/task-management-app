export type UserRole = "admin" | "member"

export interface User {
  id: string
  email: string
  role: UserRole
  display_name?: string | null
  created_at: string
  updated_at: string
}

export interface Task {
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
