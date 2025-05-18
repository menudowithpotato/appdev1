"use client"

import { useEffect, useState } from "react"
import { Briefcase, LogOut, Plus, Users } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProtectedRoute } from "@/components/protected-route"
import { EmployeeList } from "@/components/employee-list"
import { PayrollList } from "@/components/payroll-list"
import { EmployeePayrollList } from "@/components/employee-payroll-list"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import type { Employee, Payroll } from "@/lib/types"

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [payrolls, setPayrolls] = useState<Payroll[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      setLoading(true)

      try {
        if (user.role === "admin") {
          // Fetch all employees
          const { data: employeesData, error: employeesError } = await supabase
            .from("employees")
            .select("*")
            .order("name")

          if (employeesError) {
            console.error("Error fetching employees:", employeesError)
          } else {
            setEmployees(employeesData as Employee[])
          }

          // Fetch all payrolls
          const { data: payrollsData, error: payrollsError } = await supabase
            .from("payrolls")
            .select("*")
            .order("created_at", { ascending: false })

          if (payrollsError) {
            console.error("Error fetching payrolls:", payrollsError)
          } else {
            setPayrolls(payrollsData as Payroll[])
          }
        } else {
          // For employees, fetch only their payrolls
          // First get the employee record
          const { data: employeeData, error: employeeError } = await supabase
            .from("employees")
            .select("*")
            .eq("user_id", user.id)
            .single()

          if (employeeError) {
            console.error("Error fetching employee data:", employeeError)
          } else if (employeeData) {
            // Then fetch payrolls for this employee
            const { data: payrollsData, error: payrollsError } = await supabase
              .from("payrolls")
              .select("*")
              .eq("employee_id", employeeData.id)
              .order("created_at", { ascending: false })

            if (payrollsError) {
              console.error("Error fetching payrolls:", payrollsError)
            } else {
              setPayrolls(payrollsData as Payroll[])
            }
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <header className="border-b">
          <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <Briefcase className="h-6 w-6" />
                <span className="text-xl font-bold">PayrollQR</span>
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
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
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
                    <EmployeeList
                      employees={employees}
                      onDataChange={() => {
                        // Refresh employees data
                        supabase
                          .from("employees")
                          .select("*")
                          .order("name")
                          .then(({ data }) => {
                            if (data) setEmployees(data as Employee[])
                          })
                      }}
                    />
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
                    <PayrollList
                      payrolls={payrolls}
                      onDataChange={() => {
                        // Refresh payrolls data
                        supabase
                          .from("payrolls")
                          .select("*")
                          .order("created_at", { ascending: false })
                          .then(({ data }) => {
                            if (data) setPayrolls(data as Payroll[])
                          })
                      }}
                    />
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
                <EmployeePayrollList payrolls={payrolls} />
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
