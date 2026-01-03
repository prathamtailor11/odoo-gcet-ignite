// Salary calculation utility based on requirements

export const calculateSalaryComponents = (wage, salaryStructure = null) => {
  const wageAmount = parseFloat(wage) || 0
  
  // Default salary structure if not provided
  const structure = salaryStructure || {
    basic: { type: 'percentage', value: 50 }, // 50% of wage
    hra: { type: 'percentage', value: 50 }, // 50% of basic
    standardAllowance: { type: 'fixed', value: 4167 },
    performanceBonus: { type: 'percentage', value: 8.33 }, // 8.33% of wage
    lta: { type: 'percentage', value: 8.333 }, // 8.333% of wage
    pfRate: 12, // 12% of basic
    professionalTax: 200, // Fixed
  }
  
  // Calculate Basic Salary (50% of wage)
  const basic = structure.basic.type === 'percentage'
    ? (wageAmount * structure.basic.value) / 100
    : structure.basic.value
  
  // Calculate HRA (50% of Basic)
  const hra = structure.hra.type === 'percentage'
    ? (basic * structure.hra.value) / 100
    : structure.hra.value
  
  // Calculate Standard Allowance (Fixed 4167)
  const standardAllowance = structure.standardAllowance.type === 'fixed'
    ? structure.standardAllowance.value
    : (wageAmount * structure.standardAllowance.value) / 100
  
  // Calculate Performance Bonus (8.33% of wage)
  const performanceBonus = structure.performanceBonus.type === 'percentage'
    ? (wageAmount * structure.performanceBonus.value) / 100
    : structure.performanceBonus.value
  
  // Calculate LTA (8.333% of wage)
  const lta = structure.lta.type === 'percentage'
    ? (wageAmount * structure.lta.value) / 100
    : structure.lta.value
  
  // Calculate Fixed Allowance (wage - total of all other components)
  const otherComponents = basic + hra + standardAllowance + performanceBonus + lta
  const fixedAllowance = Math.max(0, wageAmount - otherComponents)
  
  // Calculate PF (12% of basic)
  const pfEmployee = (basic * structure.pfRate) / 100
  const pfEmployer = (basic * structure.pfRate) / 100
  
  // Professional Tax (Fixed 200)
  const professionalTax = structure.professionalTax || 200
  
  // Calculate totals
  const totalComponents = basic + hra + standardAllowance + performanceBonus + lta + fixedAllowance
  const grossSalary = wageAmount
  const totalDeductions = pfEmployee + professionalTax
  const netSalary = grossSalary - totalDeductions
  
  return {
    wage: wageAmount,
    yearlyWage: wageAmount * 12,
    components: {
      basic: {
        amount: parseFloat(basic.toFixed(2)),
        percentage: structure.basic.type === 'percentage' ? structure.basic.value : (basic / wageAmount) * 100,
        type: structure.basic.type,
        value: structure.basic.value,
      },
      hra: {
        amount: parseFloat(hra.toFixed(2)),
        percentage: structure.hra.type === 'percentage' ? structure.hra.value : (hra / basic) * 100,
        type: structure.hra.type,
        value: structure.hra.value,
      },
      standardAllowance: {
        amount: parseFloat(standardAllowance.toFixed(2)),
        percentage: structure.standardAllowance.type === 'fixed' ? (standardAllowance / wageAmount) * 100 : structure.standardAllowance.value,
        type: structure.standardAllowance.type,
        value: structure.standardAllowance.value,
      },
      performanceBonus: {
        amount: parseFloat(performanceBonus.toFixed(2)),
        percentage: structure.performanceBonus.type === 'percentage' ? structure.performanceBonus.value : (performanceBonus / wageAmount) * 100,
        type: structure.performanceBonus.type,
        value: structure.performanceBonus.value,
      },
      lta: {
        amount: parseFloat(lta.toFixed(2)),
        percentage: structure.lta.type === 'percentage' ? structure.lta.value : (lta / wageAmount) * 100,
        type: structure.lta.type,
        value: structure.lta.value,
      },
      fixedAllowance: {
        amount: parseFloat(fixedAllowance.toFixed(2)),
        percentage: parseFloat(((fixedAllowance / wageAmount) * 100).toFixed(2)),
        type: 'calculated',
        value: fixedAllowance,
      },
    },
    deductions: {
      pfEmployee: {
        amount: parseFloat(pfEmployee.toFixed(2)),
        percentage: structure.pfRate,
      },
      pfEmployer: {
        amount: parseFloat(pfEmployer.toFixed(2)),
        percentage: structure.pfRate,
      },
      professionalTax: {
        amount: professionalTax,
        percentage: 0,
      },
    },
    totals: {
      totalComponents: parseFloat(totalComponents.toFixed(2)),
      grossSalary: parseFloat(grossSalary.toFixed(2)),
      totalDeductions: parseFloat(totalDeductions.toFixed(2)),
      netSalary: parseFloat(netSalary.toFixed(2)),
    },
    structure: structure,
  }
}

export const validateSalaryStructure = (wage, structure) => {
  const calculated = calculateSalaryComponents(wage, structure)
  const total = calculated.totals.totalComponents
  
  if (total > wage) {
    return {
      valid: false,
      error: `Total components (${total.toFixed(2)}) exceed wage (${wage})`,
    }
  }
  
  return {
    valid: true,
    calculated,
  }
}

