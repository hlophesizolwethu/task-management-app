import type React from "react"
import ProtectedRoute from "@/components/protected-route"
import DashboardHeader from "@/components/dashboard-header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </ProtectedRoute>
  )
}
