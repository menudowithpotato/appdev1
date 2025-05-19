"use client"

import { useEffect, useState } from "react"
import { Download, Mail } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Employee, Payroll } from "@/lib/types"

export default async function PayslipPage({ params }: { params: { id: string } }) {
  const [payroll, setPayroll] = useState<Payroll | null>(null)
  const [employee, setEmployee] = useState<Employee | null>(null)

  useEffect(() => {
    // Load payroll and employee data from localStorage
    const storedPayrolls = localStorage.getItem("payrolls")
    const storedEmployees = localStorage.getItem("employees")

    if (storedPayrolls) {
      const payrolls: Payroll[] = JSON.parse(storedPayrolls)
      const foundPayroll = payrolls.find((p) => p.id === params.id)

      if (foundPayroll) {
        setPayroll(foundPayroll)

        // Find the employee associated with this payroll
        if (storedEmployees) {
          const employees: Employee[] = JSON.parse(storedEmployees)
          const foundEmployee = employees.find((e) => e.id === foundPayroll.employeeId)

          if (foundEmployee) {
            setEmployee(foundEmployee)
          }
        }
      }
    }
  }, [params.id])

  const handlePrint = () => {
    window.print()
  }

  if (!payroll || !employee) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Payslip not found</h1>
        <p className="text-muted-foreground">The requested payslip could not be found.</p>
        <Link href="/" className="mt-4">
          <Button>Go to Home</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b print:hidden">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/Logo.png" alt="SlipQR Logo" width={40} height={40} />
              <span className="text-xl font-bold">SlipQR</span>
            </Link>
          </div>
          <Button onClick={handlePrint} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Print Payslip
          </Button>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Image src="/Logo.png" alt="SlipQR Logo" width={40} height={40} />
              <CardTitle className="text-xl">PayrollQR</CardTitle>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold">PAYSLIP</h2>
              <p className="text-muted-foreground">Pay Period: {payroll.payPeriod}</p>
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
                <p>Pay Date: {new Date(payroll.payDate).toLocaleDateString()}</p>
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
                    <span>₱{payroll.basicSalary.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overtime</span>
                    <span>₱{payroll.overtime.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bonus</span>
                    <span>₱{payroll.bonus.toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Gross Earnings</span>
                    <span>₱{payroll.grossSalary.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Deductions</h3>
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>₱{payroll.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Insurance</span>
                    <span>₱{payroll.insurance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Other Deductions</span>
                    <span>₱{payroll.otherDeductions.toFixed(2)}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total Deductions</span>
                    <span>₱{payroll.totalDeductions.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between text-lg font-bold">
                <span>Net Pay</span>
                <span>₱{payroll.netSalary.toFixed(2)}</span>
              </div>
            </div>

            
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
