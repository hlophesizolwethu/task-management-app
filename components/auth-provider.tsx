"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

type UserProfile = {
  id: string
  email: string
  role: "admin" | "member"
  display_name?: string | null
}

type AuthContextType = {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession()

        if (data.session?.user) {
          setUser(data.session.user)
          await fetchUserProfile(data.session.user.id)
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
      if (session?.user) {
        setUser(session.user)
        await fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      if (error) {
        throw error
      }

      if (data) {
        setProfile({
          id: data.id,
          email: data.email,
          role: data.role as "admin" | "member",
          display_name: data.display_name,
        })
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/auth/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return <AuthContext.Provider value={{ user, profile, loading, signOut }}>{children}</AuthContext.Provider>
}
