import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { Edit, Save, X, User, Mail, Phone, MapPin, Briefcase, DollarSign, Camera, Upload, FileText, Settings } from 'lucide-react'
import { calculateSalaryComponents, validateSalaryStructure } from '../utils/salaryCalculator'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    department: user?.department || '',
    position: user?.position || '',
    salary: user?.salary || 0,
    employeeId: user?.employeeId || '',
    profilePicture: user?.profilePicture || '',
  })
  const [previewImage, setPreviewImage] = useState(user?.profilePicture || '')
  const [showSalaryInfo, setShowSalaryInfo] = useState(false)
  const [isEditingSalary, setIsEditingSalary] = useState(false)
  const [salaryStructure, setSalaryStructure] = useState(user?.salaryStructure || null)
  const [salaryError, setSalaryError] = useState('')

  const isAdmin = user?.role === 'HR'

  // Calculate salary breakdown using utility
  const calculateSalaryInfo = () => {
    const monthlyWage = user?.salary || 0
    return calculateSalaryComponents(monthlyWage, salaryStructure)
  }

  const salaryInfo = calculateSalaryInfo()

  // Handle wage change - auto-update components
  const handleWageChange = (newWage) => {
    const updatedFormData = { ...formData, salary: parseFloat(newWage) || 0 }
    setFormData(updatedFormData)
    
    // Recalculate salary components automatically
    const validation = validateSalaryStructure(updatedFormData.salary, salaryStructure)
    if (!validation.valid) {
      setSalaryError(validation.error)
    } else {
      setSalaryError('')
    }
  }

  // Handle salary structure change
  const handleSalaryStructureChange = (component, field, value) => {
    const newStructure = {
      ...salaryStructure,
      [component]: {
        ...(salaryStructure?.[component] || {}),
        [field]: field === 'value' ? parseFloat(value) || 0 : value,
      },
    }
    setSalaryStructure(newStructure)
    
    // Validate
    const validation = validateSalaryStructure(formData.salary, newStructure)
    if (!validation.valid) {
      setSalaryError(validation.error)
    } else {
      setSalaryError('')
    }
  }

  // Save salary structure
  const handleSaveSalaryStructure = () => {
    const validation = validateSalaryStructure(formData.salary, salaryStructure)
    if (!validation.valid) {
      setSalaryError(validation.error)
      return
    }
    
    const updatedUser = {
      ...user,
      ...formData,
      salaryStructure: salaryStructure,
    }
    updateUser(updatedUser)
    setIsEditingSalary(false)
    setSalaryError('')
  }

  useEffect(() => {
    if (user) {
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        department: user?.department || '',
        position: user?.position || '',
        salary: user?.salary || 0,
        employeeId: user?.employeeId || '',
        profilePicture: user?.profilePicture || '',
      })
      setPreviewImage(user?.profilePicture || '')
      
      // Initialize salary structure if not exists
      if (!user?.salaryStructure) {
        setSalaryStructure({
          basic: { type: 'percentage', value: 50 },
          hra: { type: 'percentage', value: 50 },
          standardAllowance: { type: 'fixed', value: 4167 },
          performanceBonus: { type: 'percentage', value: 8.33 },
          lta: { type: 'percentage', value: 8.333 },
          pfRate: 12,
          professionalTax: 200,
        })
      } else {
        setSalaryStructure(user.salaryStructure)
      }
    }
  }, [user])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result
        setPreviewImage(base64String)
        setFormData({ ...formData, profilePicture: base64String })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setPreviewImage('')
    setFormData({ ...formData, profilePicture: '' })
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSave = () => {
    const updatedUser = { ...user, ...formData }
    updateUser(updatedUser)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      department: user?.department || '',
      position: user?.position || '',
      salary: user?.salary || 0,
      employeeId: user?.employeeId || '',
      profilePicture: user?.profilePicture || '',
    })
    setPreviewImage(user?.profilePicture || '')
    setIsEditing(false)
  }

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="mt-2 text-sm text-gray-600">Manage your personal information</p>
          </div>
          {!isEditing ? (
            <div className="flex space-x-2">
              <button
                onClick={() => setShowSalaryInfo(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 transform hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <FileText className="h-4 w-4 mr-2" />
                Salary Info
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transform hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col items-center mb-6 pb-6 border-b border-gray-200">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-lg overflow-hidden">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt={user?.name || 'Profile'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(user?.name || user?.email)
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 shadow-lg">
                  <Camera className="h-5 w-5" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              {user?.name || 'User'}
            </h2>
            <p className="text-sm text-gray-500">{user?.role}</p>
            {isEditing && (
              <div className="mt-4 flex space-x-2">
                <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  {previewImage ? 'Change Photo' : 'Upload Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
                {previewImage && (
                  <button
                    onClick={handleRemoveImage}
                    className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="h-4 w-4 inline mr-1" />
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              ) : (
                <p className="mt-1 text-gray-900">{user?.name || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="h-4 w-4 inline mr-1" />
                Email
              </label>
              {isEditing && isAdmin ? (
                <input
                  type="email"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              ) : (
                <p className="mt-1 text-gray-900">{user?.email || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="h-4 w-4 inline mr-1" />
                Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              ) : (
                <p className="mt-1 text-gray-900">{user?.phone || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="h-4 w-4 inline mr-1" />
                Address
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              ) : (
                <p className="mt-1 text-gray-900">{user?.address || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Briefcase className="h-4 w-4 inline mr-1" />
                Department
              </label>
              {isEditing && isAdmin ? (
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              ) : (
                <p className="mt-1 text-gray-900">{user?.department || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Briefcase className="h-4 w-4 inline mr-1" />
                Position
              </label>
              {isEditing && isAdmin ? (
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                />
              ) : (
                <p className="mt-1 text-gray-900">{user?.position || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="h-4 w-4 inline mr-1" />
                Employee ID
              </label>
              <p className="mt-1 text-gray-900">{user?.employeeId || 'Not set'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Salary
              </label>
              {isEditing && isAdmin ? (
                <input
                  type="number"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={formData.salary}
                  onChange={(e) => handleWageChange(e.target.value)}
                />
              ) : (
                <p className="mt-1 text-gray-900">
                  ₹{user?.salary?.toLocaleString() || '0'} / Month
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Salary Info Modal */}
        {showSalaryInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-gray-800 rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Salary Info</h2>
                <div className="flex space-x-2">
                  {isAdmin && (
                    <button
                      onClick={() => setIsEditingSalary(!isEditingSalary)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-600 rounded-md text-sm font-medium text-white hover:bg-gray-700"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {isEditingSalary ? 'View Mode' : 'Edit Structure'}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowSalaryInfo(false)
                      setIsEditingSalary(false)
                      setSalaryError('')
                    }}
                    className="text-white hover:text-gray-300"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 text-white">
                {/* Top Section */}
                <div className="mb-6 border-b border-gray-700 pb-4">
                  {salaryError && (
                    <div className="mb-4 p-3 bg-red-900 bg-opacity-50 border border-red-700 rounded text-red-200 text-sm">
                      {salaryError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-gray-400 text-sm">Wage Type</p>
                      <p className="text-xl font-semibold">Fixed Wage</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Month Wage</p>
                      {isEditingSalary && isAdmin ? (
                        <input
                          type="number"
                          value={formData.salary}
                          onChange={(e) => handleWageChange(e.target.value)}
                          className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        />
                      ) : (
                        <p className="text-xl font-semibold">{salaryInfo.wage.toLocaleString()} ₹ / Month</p>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Yearly wage</p>
                      <p className="text-xl font-semibold">{salaryInfo.yearlyWage.toLocaleString()} ₹ / Yearly</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Components</p>
                      <p className={`text-xl font-semibold ${salaryInfo.totals.totalComponents > salaryInfo.wage ? 'text-red-400' : 'text-green-400'}`}>
                        {salaryInfo.totals.totalComponents.toLocaleString()} ₹
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">No of working days in a week</p>
                      <p className="text-lg border-b border-gray-600 pb-1">5</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Break Time</p>
                      <p className="text-lg border-b border-gray-600 pb-1">1 /hrs</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Salary Components */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Salary Components</h3>
                    
                    <div className="space-y-4">
                      {/* Basic Salary */}
                      <div className="border-b border-gray-700 pb-3">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold">Basic Salary:</p>
                          <div className="text-right">
                            <p className="font-semibold">{salaryInfo.components.basic.amount.toLocaleString()} ₹ / month</p>
                            <p className="text-sm text-gray-400">{salaryInfo.components.basic.percentage.toFixed(2)} %</p>
                          </div>
                        </div>
                        {isEditingSalary && isAdmin && (
                          <div className="mt-2 space-y-2">
                            <select
                              value={salaryInfo.components.basic.type}
                              onChange={(e) => handleSalaryStructureChange('basic', 'type', e.target.value)}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                            >
                              <option value="percentage">Percentage of Wage</option>
                              <option value="fixed">Fixed Amount</option>
                            </select>
                            <input
                              type="number"
                              value={salaryInfo.components.basic.value}
                              onChange={(e) => handleSalaryStructureChange('basic', 'value', e.target.value)}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                              placeholder={salaryInfo.components.basic.type === 'percentage' ? 'Percentage' : 'Amount'}
                            />
                          </div>
                        )}
                        <p className="text-sm text-gray-400 mt-1">Define Basic salary from company cost compute it based on monthly Wages</p>
                      </div>

                      {/* HRA */}
                      <div className="border-b border-gray-700 pb-3">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold">House Rent Allowance (HRA):</p>
                          <div className="text-right">
                            <p className="font-semibold">{salaryInfo.components.hra.amount.toLocaleString()} ₹ / month</p>
                            <p className="text-sm text-gray-400">{salaryInfo.components.hra.percentage.toFixed(2)} %</p>
                          </div>
                        </div>
                        {isEditingSalary && isAdmin && (
                          <div className="mt-2 space-y-2">
                            <select
                              value={salaryInfo.components.hra.type}
                              onChange={(e) => handleSalaryStructureChange('hra', 'type', e.target.value)}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                            >
                              <option value="percentage">Percentage of Basic</option>
                              <option value="fixed">Fixed Amount</option>
                            </select>
                            <input
                              type="number"
                              value={salaryInfo.components.hra.value}
                              onChange={(e) => handleSalaryStructureChange('hra', 'value', e.target.value)}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                              placeholder={salaryInfo.components.hra.type === 'percentage' ? 'Percentage' : 'Amount'}
                            />
                          </div>
                        )}
                        <p className="text-sm text-gray-400 mt-1">HRA provided to employees 50% of the basic salary</p>
                      </div>

                      {/* Standard Allowance */}
                      <div className="border-b border-gray-700 pb-3">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold">Standard Allowance:</p>
                          <div className="text-right">
                            <p className="font-semibold">{salaryInfo.components.standardAllowance.amount.toLocaleString()} ₹ / month</p>
                            <p className="text-sm text-gray-400">{salaryInfo.components.standardAllowance.percentage.toFixed(2)} %</p>
                          </div>
                        </div>
                        {isEditingSalary && isAdmin && (
                          <div className="mt-2 space-y-2">
                            <select
                              value={salaryInfo.components.standardAllowance.type}
                              onChange={(e) => handleSalaryStructureChange('standardAllowance', 'type', e.target.value)}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                            >
                              <option value="fixed">Fixed Amount</option>
                              <option value="percentage">Percentage of Wage</option>
                            </select>
                            <input
                              type="number"
                              value={salaryInfo.components.standardAllowance.value}
                              onChange={(e) => handleSalaryStructureChange('standardAllowance', 'value', e.target.value)}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                              placeholder={salaryInfo.components.standardAllowance.type === 'fixed' ? 'Amount' : 'Percentage'}
                            />
                          </div>
                        )}
                        <p className="text-sm text-gray-400 mt-1">A standard allowance is a predetermined, fixed amount provided to employee as part of their salary</p>
                      </div>

                      {/* Performance Bonus */}
                      <div className="border-b border-gray-700 pb-3">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold">Performance Bonus:</p>
                          <div className="text-right">
                            <p className="font-semibold">{salaryInfo.components.performanceBonus.amount.toLocaleString()} ₹ / month</p>
                            <p className="text-sm text-gray-400">{salaryInfo.components.performanceBonus.percentage.toFixed(2)} %</p>
                          </div>
                        </div>
                        {isEditingSalary && isAdmin && (
                          <div className="mt-2 space-y-2">
                            <select
                              value={salaryInfo.components.performanceBonus.type}
                              onChange={(e) => handleSalaryStructureChange('performanceBonus', 'type', e.target.value)}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                            >
                              <option value="percentage">Percentage of Wage</option>
                              <option value="fixed">Fixed Amount</option>
                            </select>
                            <input
                              type="number"
                              value={salaryInfo.components.performanceBonus.value}
                              onChange={(e) => handleSalaryStructureChange('performanceBonus', 'value', e.target.value)}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                              placeholder={salaryInfo.components.performanceBonus.type === 'percentage' ? 'Percentage' : 'Amount'}
                            />
                          </div>
                        )}
                        <p className="text-sm text-gray-400 mt-1">Variable amount paid during payroll. The value defined by the company and calculated as a % of the wage</p>
                      </div>

                      {/* LTA */}
                      <div className="border-b border-gray-700 pb-3">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold">Leave Travel Allowance (LTA):</p>
                          <div className="text-right">
                            <p className="font-semibold">{salaryInfo.components.lta.amount.toLocaleString()} ₹ / month</p>
                            <p className="text-sm text-gray-400">{salaryInfo.components.lta.percentage.toFixed(2)} %</p>
                          </div>
                        </div>
                        {isEditingSalary && isAdmin && (
                          <div className="mt-2 space-y-2">
                            <select
                              value={salaryInfo.components.lta.type}
                              onChange={(e) => handleSalaryStructureChange('lta', 'type', e.target.value)}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                            >
                              <option value="percentage">Percentage of Wage</option>
                              <option value="fixed">Fixed Amount</option>
                            </select>
                            <input
                              type="number"
                              value={salaryInfo.components.lta.value}
                              onChange={(e) => handleSalaryStructureChange('lta', 'value', e.target.value)}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                              placeholder={salaryInfo.components.lta.type === 'percentage' ? 'Percentage' : 'Amount'}
                            />
                          </div>
                        )}
                        <p className="text-sm text-gray-400 mt-1">LTA is paid by the company to employees to cover their travel expenses. and calculated as a % of the wage</p>
                      </div>

                      {/* Fixed Allowance */}
                      <div className="pb-3">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold">Fixed Allowance:</p>
                          <div className="text-right">
                            <p className="font-semibold">{salaryInfo.components.fixedAllowance.amount.toLocaleString()} ₹ / month</p>
                            <p className="text-sm text-gray-400">{salaryInfo.components.fixedAllowance.percentage.toFixed(2)} %</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">Fixed allowance portion of wages is determined after calculating all salary components (wage - total of all other components).</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Deductions */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Deductions</h3>
                    
                    {/* Provident Fund */}
                    <div className="mb-6">
                      <h4 className="font-semibold mb-3">Provident Fund (PF) Contribution:</h4>
                      
                      <div className="space-y-3 mb-4">
                        <div className="border-b border-gray-700 pb-3">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-semibold">Employee:</p>
                            <div className="text-right">
                              <p className="font-semibold">{salaryInfo.deductions.pfEmployee.amount.toLocaleString()} ₹ / month</p>
                              <p className="text-sm text-gray-400">{salaryInfo.deductions.pfEmployee.percentage.toFixed(2)} %</p>
                            </div>
                          </div>
                          {isEditingSalary && isAdmin && (
                            <div className="mt-2">
                              <input
                                type="number"
                                value={salaryInfo.structure.pfRate}
                                onChange={(e) => {
                                  const newStructure = { ...salaryStructure, pfRate: parseFloat(e.target.value) || 0 }
                                  setSalaryStructure(newStructure)
                                }}
                                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                                placeholder="PF Rate %"
                              />
                            </div>
                          )}
                          <p className="text-sm text-gray-400 mt-1">PF is calculated based on the basic salary</p>
                        </div>

                        <div className="border-b border-gray-700 pb-3">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-semibold">Employer:</p>
                            <div className="text-right">
                              <p className="font-semibold">{salaryInfo.deductions.pfEmployer.amount.toLocaleString()} ₹ / month</p>
                              <p className="text-sm text-gray-400">{salaryInfo.deductions.pfEmployer.percentage.toFixed(2)} %</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">PF is calculated based on the basic salary</p>
                        </div>
                      </div>
                    </div>

                    {/* Tax Deductions */}
                    <div>
                      <h4 className="font-semibold mb-3">Tax Deductions:</h4>
                      <div className="border-b border-gray-700 pb-3">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-semibold">Professional Tax:</p>
                          <div className="text-right">
                            <p className="font-semibold">{salaryInfo.deductions.professionalTax.amount.toLocaleString()} ₹ / month</p>
                          </div>
                        </div>
                        {isEditingSalary && isAdmin && (
                          <div className="mt-2">
                            <input
                              type="number"
                              value={salaryInfo.structure.professionalTax}
                              onChange={(e) => {
                                const newStructure = { ...salaryStructure, professionalTax: parseFloat(e.target.value) || 0 }
                                setSalaryStructure(newStructure)
                              }}
                              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                              placeholder="Professional Tax Amount"
                            />
                          </div>
                        )}
                        <p className="text-sm text-gray-400 mt-1">Professional Tax deducted from the Gross salary</p>
                      </div>
                      
                      {isEditingSalary && isAdmin && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                          <button
                            onClick={handleSaveSalaryStructure}
                            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                          >
                            Save Salary Structure
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Profile



