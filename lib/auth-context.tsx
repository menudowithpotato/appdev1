"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Session } from "@supabase/supabase-js"

import { supabase } from "@/lib/supabase"
import type { User } from "@/lib/types"

interface AuthContextType {
  user: User | null
  session: Session | null
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (
    email: string,
    password: string,
    name: string,
    role: "admin" | "employee",
  ) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const fetchSession = async () => {
      setIsLoading(true)

      try {
        // Get session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error fetching session:", error)
          setIsLoading(false)
          return
        }

        setSession(session)

        if (session) {
          // Get user data from our users table
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single()

          if (userError) {
            console.error("Error fetching user data:", userError)
            setIsLoading(false)
            return
          }

          setUser(userData as User)
        }
      } catch (error) {
        console.error("Error in fetchSession:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSession()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession)

      if (newSession) {
        try {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", newSession.user.id)
            .single()

          if (userError) {
            console.error("Error fetching user data:", userError)
            return
          }

          setUser(userData as User)
        } catch (error) {
          console.error("Error in auth state change:", error)
        }
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, message: error.message }
      }

      // Get user data from our users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single()

      if (userError) {
        return { success: false, message: "Error fetching user data" }
      }

      setUser(userData as User)
      return { success: true, message: "Login successful" }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: "An error occurred during login" }
    }
  }

  const register = async (email: string, password: string, name: string, role: "admin" | "employee") => {
    try {
      // Check if any users exist to determine if this should be an admin
      const { count, error: countError } = await supabase.from("users").select("*", { count: "exact", head: true })

      if (countError) {
        return { success: false, message: "Error checking existing users" }
      }

      // If no users exist, make this user an admin regardless of selection
      const finalRole = count === 0 ? "admin" : role

      // Register the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { success: false, message: error.message }
      }

      if (!data.user) {
        return { success: false, message: "User registration failed" }
      }

      // Insert the user into our users table
      const { error: insertError } = await supabase.from("users").insert({
        id: data.user.id,
        email,
        name,
        role: finalRole,
      })

      if (insertError) {
        console.error("Error creating user record:", insertError)
        return { success: false, message: insertError.message }
      }

      // If user is an employee, create an employee record
      if (finalRole === "employee") {
        const { error: employeeError } = await supabase.from("employees").insert({
          user_id: data.user.id,
          name,
          position: "Not set",
          department: "Not set",
          email,
          salary: 0,
        })

        if (employeeError) {
          console.error("Error creating employee record:", employeeError)
          // We don't return an error here as the user account is still created
        }
      }

      return { success: true, message: "Registration successful" }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, message: "An error occurred during registration" }
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
