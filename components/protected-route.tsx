"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "admin" | "member"
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User is not authenticated, redirect to login
        router.push(`/auth/login?returnUrl=${encodeURIComponent(pathname)}`)
      } else if (requiredRole && profile && profile.role !== requiredRole) {
        // User doesn't have the required role
        router.push("/dashboard")
      }
    }
  }, [user, profile, loading, router, pathname, requiredRole])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-900" />
      </div>
    )
  }

  // If there's a required role and the user doesn't have it, don't render children
  if (requiredRole && profile && profile.role !== requiredRole) {
    return null
  }

  // If user is authenticated (and has the required role if specified), render children
  if (user) {
    return <>{children}</>
  }

  // Don't render anything while redirecting
  return null
}
