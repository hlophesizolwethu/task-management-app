"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

type UserProfile = {
  id: string
  email: string
  role: "admin" | "member"
  display_name?: string | null
  created_at?: string
  updated_at?: string
}

type AuthContextType = {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    console.log("AuthProvider initializing")
    
    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log("Getting initial session")
        const { data } = await supabase.auth.getSession()
        console.log("Initial session:", !!data.session)

        if (data.session?.user) {
          console.log("User found in session:", data.session.user.id)
          setUser(data.session.user)
          await fetchUserProfile(data.session.user.id)
        } else {
          console.log("No user in session")
          setUser(null)
          setProfile(null)
          
          // Redirect to login if on a protected page
          if (pathname?.startsWith("/dashboard")) {
            console.log("On protected page without session, redirecting")
            window.location.href = "/auth/login"
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, "Session:", !!session)
      
      if (session?.user) {
        console.log("User in new session:", session.user.id)
        setUser(session.user)
        await fetchUserProfile(session.user.id)
        
        // Redirect to dashboard if on auth page
        if (pathname?.startsWith("/auth") && pathname !== "/auth/callback") {
          console.log("On auth page with session, redirecting to dashboard")
          window.location.href = "/dashboard"
        }
      } else {
        console.log("No user in new session")
        setUser(null)
        setProfile(null)
        
        // Redirect to login if on a protected page
        if (pathname?.startsWith("/dashboard")) {
          console.log("On protected page without session, redirecting")
          window.location.href = "/auth/login"
        }
      }
      setLoading(false)
    })

    return () => {
      console.log("Cleaning up auth listener")
      authListener.subscription.unsubscribe()
    }
  }, [pathname, router])

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching user profile for:", userId)
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      if (error) {
        console.error("Error fetching user profile:", error)
        return
      }

      if (data) {
        console.log("User profile found:", data)
        setProfile({
          id: data.id,
          email: data.email,
          role: data.role as "admin" | "member",
          display_name: data.display_name,
          created_at: data.created_at,
          updated_at: data.updated_at,
        })
      } else {
        console.log("No user profile found")
      }
    } catch (error) {
      console.error("Exception in fetchUserProfile:", error)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id)
    }
  }

  const signOut = async () => {
    try {
      console.log("Signing out")
      await supabase.auth.signOut()
      window.location.href = "/auth/login"
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}