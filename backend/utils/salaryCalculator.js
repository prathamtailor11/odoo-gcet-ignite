// Salary calculation utility (same as frontend)
export const calculateSalaryComponents = (wage, salaryStructure = null) => {
  const wageAmount = parseFloat(wage) || 0

  const structure = salaryStructure || {
    basic: { type: 'percentage', value: 50 },
    hra: { type: 'percentage', value: 50 },
    standardAllowance: { type: 'fixed', value: 4167 },
    performanceBonus: { type: 'percentage', value: 8.33 },
    lta: { type: 'percentage', value: 8.333 },
    pfRate: 12,
    professionalTax: 200,
  }

  const basic =
    structure.basic.type === 'percentage'
      ? (wageAmount * structure.basic.value) / 100
      : structure.basic.value

  const hra =
    structure.hra.type === 'percentage'
      ? (basic * structure.hra.value) / 100
      : structure.hra.value

  const standardAllowance =
    structure.standardAllowance.type === 'fixed'
      ? structure.standardAllowance.value
      : (wageAmount * structure.standardAllowance.value) / 100

  const performanceBonus =
    structure.performanceBonus.type === 'percentage'
      ? (wageAmount * structure.performanceBonus.value) / 100
      : structure.performanceBonus.value

  const lta =
    structure.lta.type === 'percentage'
      ? (wageAmount * structure.lta.value) / 100
      : structure.lta.value

  const otherComponents = basic + hra + standardAllowance + performanceBonus + lta
  const fixedAllowance = Math.max(0, wageAmount - otherComponents)

  const pfEmployee = (basic * structure.pfRate) / 100
  const pfEmployer = (basic * structure.pfRate) / 100

  const professionalTax = structure.professionalTax || 200

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
        percentage:
          structure.basic.type === 'percentage'
            ? structure.basic.value
            : (basic / wageAmount) * 100,
        type: structure.basic.type,
        value: structure.basic.value,
      },
      hra: {
        amount: parseFloat(hra.toFixed(2)),
        percentage:
          structure.hra.type === 'percentage'
            ? structure.hra.value
            : (hra / basic) * 100,
        type: structure.hra.type,
        value: structure.hra.value,
      },
      standardAllowance: {
        amount: parseFloat(standardAllowance.toFixed(2)),
        percentage:
          structure.standardAllowance.type === 'fixed'
            ? (standardAllowance / wageAmount) * 100
            : structure.standardAllowance.value,
        type: structure.standardAllowance.type,
        value: structure.standardAllowance.value,
      },
      performanceBonus: {
        amount: parseFloat(performanceBonus.toFixed(2)),
        percentage:
          structure.performanceBonus.type === 'percentage'
            ? structure.performanceBonus.value
            : (performanceBonus / wageAmount) * 100,
        type: structure.performanceBonus.type,
        value: structure.performanceBonus.value,
      },
      lta: {
        amount: parseFloat(lta.toFixed(2)),
        percentage:
          structure.lta.type === 'percentage'
            ? structure.lta.value
            : (lta / wageAmount) * 100,
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

