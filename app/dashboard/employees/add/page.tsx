"use client"

import type React from "react"

import { useState } from "react"
import { LogOut } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import type { Employee } from "@/lib/types"

export default function AddEmployeePage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    department: "",
    email: "",
    salary: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Get existing employees from localStorage
    const existingEmployees = JSON.parse(localStorage.getItem("employees") || "[]")

    // Check if email already exists
    if (existingEmployees.some((emp: Employee) => emp.email.toLowerCase() === formData.email.toLowerCase())) {
      toast({
        title: "Error",
        description: "An employee with this email already exists.",
        variant: "destructive",
      })
      return
    }

    // Create new employee with unique ID
    const newEmployee: Employee = {
      id: Date.now().toString(),
      name: formData.name,
      position: formData.position,
      department: formData.department,
      email: formData.email,
      salary: Number.parseFloat(formData.salary),
    }

    // Add new employee to the list
    const updatedEmployees = [...existingEmployees, newEmployee]

    // Save to localStorage
    localStorage.setItem("employees", JSON.stringify(updatedEmployees))

    toast({
      title: "Success",
      description: "Employee added successfully.",
    })

    // Redirect to dashboard
    router.push("/dashboard")
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="flex min-h-screen flex-col">
        <header className="border-b">
          <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Image src="/Logo.png" alt="SlipQR Logo" width={40} height={40} />
                <span className="text-xl font-bold">SlipQR</span>
              </Link>
            </div>
            <nav className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Logged in as <span className="font-medium">{user?.name}</span> ({user?.role})
              </span>
              <Button variant="ghost" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </nav>
          </div>
        </header>
        <main className="flex-1 container py-6">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Add New Employee</CardTitle>
                <CardDescription>Enter employee details to add them to the system.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      name="position"
                      placeholder="Software Developer"
                      value={formData.position}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      name="department"
                      placeholder="Engineering"
                      value={formData.department}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary">Monthly Salary</Label>
                    <Input
                      id="salary"
                      name="salary"
                      type="number"
                      placeholder="5000"
                      value={formData.salary}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Link href="/dashboard">
                    <Button variant="outline">Cancel</Button>
                  </Link>
                  <Button type="submit">Add Employee</Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
