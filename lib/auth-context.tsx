"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export type UserRole = "admin" | "employee"

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: UserRole
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]") as User[]

    // Find user with matching email and password
    const foundUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password)

    if (foundUser) {
      setUser(foundUser)
      localStorage.setItem("currentUser", JSON.stringify(foundUser))
      return { success: true, message: "Login successful" }
    }

    return { success: false, message: "Invalid email or password" }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("currentUser")
    router.push("/login")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
