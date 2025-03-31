import { redirect } from "next/navigation"

export default function Home() {
  // Redirect to login page as the first landing page
  redirect("/auth/login")
}
