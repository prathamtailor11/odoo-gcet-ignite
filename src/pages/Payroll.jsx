import React from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { DollarSign, TrendingUp, FileText, Download } from 'lucide-react'
import { format } from 'date-fns'

const Payroll = () => {
  const { user } = useAuth()
  const { employees } = useData()
  const isAdmin = user?.role === 'HR'

  const currentUser = employees.find((e) => e.id === user?.id) || user

  const calculatePayroll = (employee) => {
    const baseSalary = employee.salary || 0
    const tax = baseSalary * 0.1 // 10% tax
    const netSalary = baseSalary - tax
    return {
      baseSalary,
      tax,
      netSalary,
    }
  }

  const userPayroll = calculatePayroll(currentUser)

  const allPayrolls = isAdmin
    ? employees.map((emp) => ({
        employee: emp,
        ...calculatePayroll(emp),
      }))
    : []

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Payroll</h1>
          <p className="mt-2 text-sm text-gray-600">
            {isAdmin
              ? 'View and manage employee payroll'
              : 'View your salary details and payslips'}
          </p>
        </div>

        {!isAdmin ? (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Salary Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Base Salary</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        ₹{userPayroll.baseSalary.toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Tax (10%)</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        ₹{userPayroll.tax.toLocaleString()}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Net Salary</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        ₹{userPayroll.netSalary.toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Salary Breakdown
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-700">Employee ID</span>
                  <span className="font-medium text-gray-900">
                    {currentUser?.employeeId || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-700">Employee Name</span>
                  <span className="font-medium text-gray-900">
                    {currentUser?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-700">Department</span>
                  <span className="font-medium text-gray-900">
                    {currentUser?.department || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-700">Position</span>
                  <span className="font-medium text-gray-900">
                    {currentUser?.position || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-700">Base Salary</span>
                  <span className="font-medium text-gray-900">
                    ₹{userPayroll.baseSalary.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                  <span className="text-gray-700">Tax Deduction (10%)</span>
                  <span className="font-medium text-red-600">
                    -₹{userPayroll.tax.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 bg-gray-50 rounded">
                  <span className="text-gray-900 font-semibold">Net Salary</span>
                  <span className="font-bold text-gray-900 text-lg">
                    ₹{userPayroll.netSalary.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Salary Slips
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Salary Slip - {format(new Date(), 'MMMM yyyy')}
                      </p>
                      <p className="text-xs text-gray-500">
                        Generated on {format(new Date(), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              All Employees Payroll
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Base Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tax (10%)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allPayrolls.length > 0 ? (
                    allPayrolls.map((payroll) => (
                      <tr key={payroll.employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {payroll.employee.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payroll.employee.employeeId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{payroll.baseSalary.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          ₹{payroll.tax.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          ₹{payroll.netSalary.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-primary-600 hover:text-primary-900">
                            <Download className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        No payroll records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Payroll

