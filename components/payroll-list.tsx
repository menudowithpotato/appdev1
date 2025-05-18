"use client"

import { useState } from "react"
import { Eye, MoreHorizontal, QrCode, Trash } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import { supabase } from "@/lib/supabase"
import type { Payroll } from "@/lib/types"

interface PayrollListProps {
  payrolls: Payroll[]
  onDataChange: () => void
}

export function PayrollList({ payrolls, onDataChange }: PayrollListProps) {
  const { toast } = useToast()
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null)
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id)

      const { error } = await supabase.from("payrolls").delete().eq("id", id)

      if (error) {
        throw new Error(error.message)
      }

      toast({
        title: "Payroll deleted",
        description: "The payroll has been deleted successfully.",
      })

      // Refresh the data
      onDataChange()
    } catch (error) {
      console.error("Error deleting payroll:", error)
      toast({
        title: "Error",
        description: "An error occurred while deleting the payroll.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleShowQR = (payroll: Payroll) => {
    setSelectedPayroll(payroll)
    setQrDialogOpen(true)
  }

  if (payrolls.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No payrolls found. Generate a payroll to get started.</p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
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
              <TableCell className="font-medium">{payroll.employee_name}</TableCell>
              <TableCell>{payroll.pay_period}</TableCell>
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
                    <DropdownMenuItem onClick={() => handleDelete(payroll.id)} disabled={isDeleting === payroll.id}>
                      {isDeleting === payroll.id ? (
                        <span className="flex items-center">
                          <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Deleting...
                        </span>
                      ) : (
                        <>
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </>
                      )}
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
                  Scan this QR code to view the payslip for {selectedPayroll.employee_name}
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
