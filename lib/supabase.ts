import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Make sure we have the environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create a single supabase client for the entire app
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
})
