"use client"

import { useState } from "react"
import { MoreHorizontal, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import type { Employee } from "@/lib/types"

interface EmployeeListProps {
  employees: Employee[]
  onDataChange: () => void
}

export function EmployeeList({ employees, onDataChange }: EmployeeListProps) {
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id)

      // Check if employee has payrolls
      const { count, error: countError } = await supabase
        .from("payrolls")
        .select("*", { count: "exact", head: true })
        .eq("employee_id", id)

      if (countError) {
        throw new Error("Error checking payrolls")
      }

      if (count && count > 0) {
        toast({
          title: "Cannot delete employee",
          description: "This employee has payrolls associated with them. Delete the payrolls first.",
          variant: "destructive",
        })
        return
      }

      // Get the user_id from the employee record
      const { data: employeeData, error: employeeError } = await supabase
        .from("employees")
        .select("user_id")
        .eq("id", id)
        .single()

      if (employeeError) {
        throw new Error("Error fetching employee data")
      }

      // Delete the employee
      const { error: deleteError } = await supabase.from("employees").delete().eq("id", id)

      if (deleteError) {
        throw new Error("Error deleting employee")
      }

      // Delete the user if it exists
      if (employeeData?.user_id) {
        // First delete from our users table
        const { error: userDeleteError } = await supabase.from("users").delete().eq("id", employeeData.user_id)

        if (userDeleteError) {
          console.error("Error deleting user record:", userDeleteError)
          // We don't throw here as the employee is already deleted
        }

        // Then delete from auth.users (requires admin privileges)
        // This would typically be done via a server function
        // For now, we'll just log that this would need to be done
        console.log("User auth record would need to be deleted via admin API:", employeeData.user_id)
      }

      toast({
        title: "Employee deleted",
        description: "The employee has been deleted successfully.",
      })

      // Refresh the data
      onDataChange()
    } catch (error) {
      console.error("Error deleting employee:", error)
      toast({
        title: "Error",
        description: "An error occurred while deleting the employee.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  if (employees.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No employees found. Add an employee to get started.</p>
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
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee.id}>
            <TableCell className="font-medium">{employee.name}</TableCell>
            <TableCell>{employee.position}</TableCell>
            <TableCell>{employee.department}</TableCell>
            <TableCell>{employee.email}</TableCell>
            <TableCell className="text-right">${Number(employee.salary).toFixed(2)}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleDelete(employee.id)} disabled={isDeleting === employee.id}>
                    {isDeleting === employee.id ? (
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
  )
}
