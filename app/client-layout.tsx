"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/layout/sidebar"
import { LoginForm } from "@/components/auth/login-form"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay un token guardado
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (token && userData) {
      setIsAuthenticated(true)
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const handleLogin = (token: string, userData: any) => {
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(userData))
    setIsAuthenticated(true)
    setUser(userData)

    router.push("/dashboard") // Redirigi al dashboard
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setIsAuthenticated(false)
    setUser(null)
  }

  if (loading) {
    return (
      <html lang="es">
        <body className={inter.className}>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </body>
      </html>
    )
  }

  if (!isAuthenticated) {
    return (
      <html lang="es">
        <body className={inter.className}>
          <LoginForm onLogin={handleLogin} />
        </body>
      </html>
    )
  }

  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
          <Sidebar userRole={user?.role} onLogout={handleLogout} />
          <div className="flex flex-col">
            <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
              <div className="flex-1">
                <h1 className="text-lg font-semibold md:text-2xl">Bienvenido, {user?.username}</h1>
                <p className="text-sm text-muted-foreground capitalize">Rol: {user?.role}</p>
              </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}
