"use client"

import { useState } from "react"
import { MoreHorizontal, Trash } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import type { Employee } from "@/lib/types"

interface EmployeeListProps {
  employees: Employee[]
}

export function EmployeeList({ employees }: EmployeeListProps) {
  const [localEmployees, setLocalEmployees] = useState<Employee[]>(employees)

  const handleDelete = (id: string) => {
    // Filter out the employee to delete
    const updatedEmployees = localEmployees.filter((emp) => emp.id !== id)

    // Update local state
    setLocalEmployees(updatedEmployees)

    // Update localStorage
    localStorage.setItem("employees", JSON.stringify(updatedEmployees))
  }

  if (localEmployees.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No employees found. Add an employee to get started.</p>
        <Link href="/dashboard/employees/add" className="mt-4 inline-block">
          <Button>Add Employee</Button>
        </Link>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Email</TableHead>
          <TableHead className="text-right">Salary</TableHead>
          <TableHead>QR Code</TableHead> {/* Add this in your TableHeader */}
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {localEmployees.map((employee) => (
          <TableRow key={employee.id}>
            <TableCell className="font-medium">{employee.name}</TableCell>
            <TableCell>{employee.position}</TableCell>
            <TableCell>{employee.department}</TableCell>
            <TableCell>{employee.email}</TableCell>
            <TableCell className="text-right">${employee.salary.toFixed(2)}</TableCell>
            <TableCell>
              <QRCodeGenerator value={`https://selectedpayroll.id/employee/${employee.id}`} size={64} />
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleDelete(employee.id)}>
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
