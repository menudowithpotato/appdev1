"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Briefcase, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import type { Employee, Payroll } from "@/lib/types"

export default function GeneratePayrollPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [formData, setFormData] = useState({
    employeeId: "",
    payPeriod: "",
    payDate: "",
    basicSalary: "",
    overtime: "0",
    bonus: "0",
    tax: "0",
    insurance: "0",
    otherDeductions: "0",
  })

  useEffect(() => {
    // Load employees from localStorage
    const storedEmployees = localStorage.getItem("employees")
    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees))
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, employeeId: value }))

    // Find the selected employee
    const selectedEmployee = employees.find((emp) => emp.id === value)

    // Update basic salary based on the selected employee
    if (selectedEmployee) {
      setFormData((prev) => ({
        ...prev,
        basicSalary: selectedEmployee.salary.toString(),
      }))
    }
  }

  const calculateNetSalary = () => {
    const basicSalary = Number.parseFloat(formData.basicSalary) || 0
    const overtime = Number.parseFloat(formData.overtime) || 0
    const bonus = Number.parseFloat(formData.bonus) || 0
    const tax = Number.parseFloat(formData.tax) || 0
    const insurance = Number.parseFloat(formData.insurance) || 0
    const otherDeductions = Number.parseFloat(formData.otherDeductions) || 0

    const grossSalary = basicSalary + overtime + bonus
    const totalDeductions = tax + insurance + otherDeductions
    const netSalary = grossSalary - totalDeductions

    return {
      grossSalary,
      totalDeductions,
      netSalary,
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Get selected employee
    const selectedEmployee = employees.find((emp) => emp.id === formData.employeeId)

    if (!selectedEmployee) {
      toast({
        title: "Error",
        description: "Please select an employee",
        variant: "destructive",
      })
      return
    }

    const { grossSalary, totalDeductions, netSalary } = calculateNetSalary()

    // Create new payroll with unique ID
    const newPayroll: Payroll = {
      id: Date.now().toString(),
      employeeId: formData.employeeId,
      employeeName: selectedEmployee.name,
      payPeriod: formData.payPeriod,
      payDate: formData.payDate,
      basicSalary: Number.parseFloat(formData.basicSalary),
      overtime: Number.parseFloat(formData.overtime),
      bonus: Number.parseFloat(formData.bonus),
      grossSalary,
      tax: Number.parseFloat(formData.tax),
      insurance: Number.parseFloat(formData.insurance),
      otherDeductions: Number.parseFloat(formData.otherDeductions),
      totalDeductions,
      netSalary,
      createdAt: new Date().toISOString(),
    }

    // Get existing payrolls from localStorage
    const existingPayrolls = JSON.parse(localStorage.getItem("payrolls") || "[]")

    // Add new payroll to the list
    const updatedPayrolls = [...existingPayrolls, newPayroll]

    // Save to localStorage
    localStorage.setItem("payrolls", JSON.stringify(updatedPayrolls))

    toast({
      title: "Success",
      description: "Payroll generated successfully.",
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
                <Briefcase className="h-6 w-6" />
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
                <CardTitle>Generate Payroll</CardTitle>
                <CardDescription>Create a new payroll for an employee.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="employeeId">Select Employee</Label>
                    <Select onValueChange={handleSelectChange} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name} - {employee.position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payPeriod">Pay Period</Label>
                    <Input
                      id="payPeriod"
                      name="payPeriod"
                      placeholder="May 2023"
                      value={formData.payPeriod}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payDate">Pay Date</Label>
                    <Input
                      id="payDate"
                      name="payDate"
                      type="date"
                      value={formData.payDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="basicSalary">Basic Salary</Label>
                    <Input
                      id="basicSalary"
                      name="basicSalary"
                      type="number"
                      placeholder="5000"
                      value={formData.basicSalary}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="overtime">Overtime</Label>
                    <Input
                      id="overtime"
                      name="overtime"
                      type="number"
                      placeholder="0"
                      value={formData.overtime}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bonus">Bonus</Label>
                    <Input
                      id="bonus"
                      name="bonus"
                      type="number"
                      placeholder="0"
                      value={formData.bonus}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax">Tax</Label>
                    <Input
                      id="tax"
                      name="tax"
                      type="number"
                      placeholder="0"
                      value={formData.tax}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insurance">Insurance</Label>
                    <Input
                      id="insurance"
                      name="insurance"
                      type="number"
                      placeholder="0"
                      value={formData.insurance}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="otherDeductions">Other Deductions</Label>
                    <Input
                      id="otherDeductions"
                      name="otherDeductions"
                      type="number"
                      placeholder="0"
                      value={formData.otherDeductions}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between">
                      <span>Gross Salary:</span>
                      <span className="font-semibold">${calculateNetSalary().grossSalary.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Deductions:</span>
                      <span className="font-semibold">${calculateNetSalary().totalDeductions.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Net Salary:</span>
                      <span className="font-semibold">${calculateNetSalary().netSalary.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Link href="/dashboard">
                    <Button variant="outline">Cancel</Button>
                  </Link>
                  <Button type="submit">Generate Payroll</Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
