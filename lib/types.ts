export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "employee"
  created_at?: string
}

export interface Employee {
  id: string
  user_id: string | null
  name: string
  position: string
  department: string
  email: string
  salary: number
  created_at?: string
}

export interface Payroll {
  id: string
  employee_id: string
  employee_name: string
  pay_period: string
  pay_date: string
  basic_salary: number
  overtime: number
  bonus: number
  gross_salary: number
  tax: number
  insurance: number
  other_deductions: number
  total_deductions: number
  net_salary: number
  created_at?: string
}
