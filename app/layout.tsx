import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Task Management System",
  description: "A task management system for teams",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
