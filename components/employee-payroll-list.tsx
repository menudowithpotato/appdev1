"use client"

import { useState } from "react"
import { Eye, MoreHorizontal, QrCode } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import type { Payroll } from "@/lib/types"

interface EmployeePayrollListProps {
  payrolls: Payroll[]
}

export function EmployeePayrollList({ payrolls }: EmployeePayrollListProps) {
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)

  const handleShowQR = (payroll: Payroll) => {
    setSelectedPayroll(payroll)
    setQrDialogOpen(true)
  }

  if (payrolls.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No payslips found for you yet.</p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pay Period</TableHead>
            <TableHead>Pay Date</TableHead>
            <TableHead className="text-right">Gross Salary</TableHead>
            <TableHead className="text-right">Net Salary</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payrolls.map((payroll) => (
            <TableRow key={payroll.id}>
              <TableCell className="font-medium">{payroll.pay_period}</TableCell>
              <TableCell>{new Date(payroll.pay_date).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">${Number(payroll.gross_salary).toFixed(2)}</TableCell>
              <TableCell className="text-right">${Number(payroll.net_salary).toFixed(2)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/payslip/${payroll.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Payslip
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShowQR(payroll)}>
                      <QrCode className="mr-2 h-4 w-4" />
                      Show QR Code
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payslip QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            {selectedPayroll && (
              <>
                <QRCodeGenerator value={`${window.location.origin}/payslip/${selectedPayroll.id}`} />
                <p className="text-center mt-4 text-sm text-muted-foreground">
                  Scan this QR code to view your payslip for {selectedPayroll.pay_period}
                </p>
                <div className="mt-4">
                  <Link href={`/payslip/${selectedPayroll.id}`} target="_blank">
                    <Button variant="outline">Open Payslip</Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
