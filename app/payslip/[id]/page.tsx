"use client"

import { useEffect, useState } from "react"
import { Briefcase, Download, LogOut, Mail } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import type { Employee, Payroll } from "@/lib/types"

export default function PayslipPage({ params }: { params: { id: string } }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [payroll, setPayroll] = useState<Payroll | null>(null)
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        // Fetch payroll data
        const { data: payrollData, error: payrollError } = await supabase
          .from("payrolls")
          .select("*")
          .eq("id", params.id)
          .single()

        if (payrollError) {
          console.error("Error fetching payroll:", payrollError)
          setLoading(false)
          return
        }

        if (!payrollData) {
          setLoading(false)
          return
        }

        setPayroll(payrollData as Payroll)

        // Fetch employee data
        const { data: employeeData, error: employeeError } = await supabase
          .from("employees")
          .select("*")
          .eq("id", payrollData.employee_id)
          .single()

        if (employeeError) {
          console.error("Error fetching employee:", employeeError)
        } else {
          setEmployee(employeeData as Employee)
        }

        // Check authorization
        if (user.role === "admin" || (employeeData && employeeData.user_id === user.id)) {
          setAuthorized(true)
        }

        setLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, user])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!payroll || !employee) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Payslip not found</h1>
        <p className="text-muted-foreground">The requested payslip could not be found.</p>
        <Link href="/dashboard" className="mt-4">
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You are not authorized to view this payslip.</p>
        <Link href="/dashboard" className="mt-4">
          <Button>Go to Dashboard</Button>
        </Link>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <header className="border-b print:hidden">
          <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="flex items-center gap-2">
                <Briefcase className="h-6 w-6" />
                <span className="text-xl font-bold">PayrollQR</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={handlePrint} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Print Payslip
              </Button>
              <Button variant="ghost" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 container py-6">
          <Card className="max-w-3xl mx-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="h-6 w-6" />
                <CardTitle className="text-xl">PayrollQR</CardTitle>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-bold">PAYSLIP</h2>
                <p className="text-muted-foreground">Pay Period: {payroll.pay_period}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg">Employee Details</h3>
                  <p className="text-lg font-bold">{employee.name}</p>
                  <p>{employee.position}</p>
                  <p>{employee.department}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Mail className="h-4 w-4" />
                    <span>{employee.email}</span>
                  </div>
                </div>
                <div className="text-right">
                  <h3 className="font-semibold text-lg">Payment Information</h3>
                  <p>Pay Date: {new Date(payroll.pay_date).toLocaleDateString()}</p>
                  <p>Payment Method: Direct Deposit</p>
                  <p>Employee ID: {employee.id}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg">Earnings</h3>
                  <div className="space-y-1 mt-2">
                    <div className="flex justify-between">
                      <span>Basic Salary</span>
                      <span>${Number(payroll.basic_salary).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Overtime</span>
                      <span>${Number(payroll.overtime).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bonus</span>
                      <span>${Number(payroll.bonus).toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold">
                      <span>Gross Earnings</span>
                      <span>${Number(payroll.gross_salary).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Deductions</h3>
                  <div className="space-y-1 mt-2">
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${Number(payroll.tax).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Insurance</span>
                      <span>${Number(payroll.insurance).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Other Deductions</span>
                      <span>${Number(payroll.other_deductions).toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold">
                      <span>Total Deductions</span>
                      <span>${Number(payroll.total_deductions).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between text-lg font-bold">
                  <span>Net Pay</span>
                  <span>${Number(payroll.net_salary).toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground pt-4">
                <p>This is a computer-generated document. No signature is required.</p>
                <p>Generated on: {new Date(payroll.created_at || "").toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  )
}
