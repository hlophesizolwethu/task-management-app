"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get("registered")
  const reset = searchParams.get("reset")

  useEffect(() => {
    if (registered) {
      setSuccess("Registration successful! Please log in with your credentials.")
    } else if (reset) {
      setSuccess("Password reset successful! Please log in with your new password.")
    }
  }, [registered, reset])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log("Login attempt started")
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      console.log("Auth successful:", data)

      if (!data.user) {
        throw new Error("Login failed")
      }

      // Check if this user exists in the users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single()

      console.log("User data:", userData, "Error:", userError)

      if (userError && !userError.message.includes("No rows found")) {
        console.error("Error fetching user data:", userError)
      }

      // If the user doesn't exist in the users table, create them
      if (!userData) {
        console.log("User not found in users table, creating profile...")
        
        // Check if there are any users in the system
        const { count, error: countError } = await supabase.from("users").select("*", { count: "exact", head: true })

        console.log("User count result:", { count, error: countError })

        if (countError) {
          console.error("Error counting users:", countError)
        }

        // If this is the first user, make them an admin
        const role = count === 0 ? "admin" : "member"

        const { error: insertError } = await supabase.from("users").insert({
          id: data.user.id,
          email: data.user.email || email,
          role: role,
          display_name: data.user.email?.split("@")[0] || "User",
        })

        console.log("Insert result:", { error: insertError })

        if (insertError) {
          console.error("Error creating user profile:", insertError)
        }
      }

      // Use window.location for redirection instead of router
      console.log("About to redirect to dashboard")
      window.location.href = "/dashboard"
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "Failed to sign in")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-purple-900">TaskMaster</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/auth/reset-password" className="text-sm text-purple-900 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-purple-900 hover:bg-purple-800" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-purple-900 hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}