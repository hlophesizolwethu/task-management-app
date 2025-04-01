"use client"

import { useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  useEffect(() => {
    console.log("Protected route component", { user, loading })
    
    if (!loading && !user) {
      console.log("No user in protected route, redirecting")
      window.location.href = "/auth/login"
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-900" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div>Not authenticated. Redirecting...</div>
      </div>
    )
  }

  return <>{children}</>
}