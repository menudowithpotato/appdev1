"use client"

import { useEffect, useState } from "react"
import { LogOut, Plus, Users } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProtectedRoute } from "@/components/protected-route"
import { EmployeeList } from "@/components/employee-list"
import { PayrollList } from "@/components/payroll-list"
import { EmployeePayrollList } from "@/components/employee-payroll-list"
import { useAuth } from "@/lib/auth-context"
import type { Employee, Payroll } from "@/lib/types"

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [payrolls, setPayrolls] = useState<Payroll[]>([])

  useEffect(() => {
    // Load data from localStorage on component mount
    const storedEmployees = localStorage.getItem("employees")
    const storedPayrolls = localStorage.getItem("payrolls")

    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees))
    }

    if (storedPayrolls) {
      setPayrolls(JSON.parse(storedPayrolls))
    }
  }, [])

  // Filter payrolls for employee view
  const employeePayrolls = user?.role === "employee" ? payrolls.filter((payroll) => payroll.employeeId === user.id) : []

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <header className="border-b">
          <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
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
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            {user?.role === "admin" && (
              <div className="flex gap-2">
                <Link href="/dashboard/employees/add">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Employee
                  </Button>
                </Link>
                <Link href="/dashboard/payrolls/generate">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Generate Payroll
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {user?.role === "admin" && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{employees.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Payrolls</CardTitle>
                  <Image src="/Logo.png" alt="SlipQR Logo" width={40} height={40} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{payrolls.length}</div>
                </CardContent>
              </Card>
            </div>
          )}

          {user?.role === "admin" ? (
            <Tabs defaultValue="employees">
              <TabsList>
                <TabsTrigger value="employees">Employees</TabsTrigger>
                <TabsTrigger value="payrolls">Payrolls</TabsTrigger>
              </TabsList>
              <TabsContent value="employees">
                <Card>
                  <CardHeader>
                    <CardTitle>Employees</CardTitle>
                    <CardDescription>Manage your employees here.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <EmployeeList employees={employees} />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="payrolls">
                <Card>
                  <CardHeader>
                    <CardTitle>Payrolls</CardTitle>
                    <CardDescription>View and manage payrolls.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PayrollList payrolls={payrolls} />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>My Payslips</CardTitle>
                <CardDescription>View your payslips here.</CardDescription>
              </CardHeader>
              <CardContent>
                <EmployeePayrollList payrolls={employeePayrolls} />
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
