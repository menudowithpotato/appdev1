export interface Employee {
  id: string
  name: string
  position: string
  department: string
  email: string
  salary: number
}

export interface Payroll {
  id: string
  employeeId: string
  employeeName: string
  payPeriod: string
  payDate: string
  basicSalary: number
  overtime: number
  bonus: number
  grossSalary: number
  tax: number
  insurance: number
  otherDeductions: number
  totalDeductions: number
  netSalary: number
  createdAt: string
}
