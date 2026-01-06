/**
 * Smart Mortgage Accelerator - Core Calculation Engine
 * 
 * This module provides all mortgage calculation functions:
 * - Basic EMI calculation
 * - Overpayment impact analysis
 * - Fixed-rate term handling
 * - Part payment (lump-sum) calculations
 * - Amortization schedule generation
 * - Scenario comparison
 */

/**
 * Represents a single mortgage payment record
 */
export interface PaymentRecord {
  month: number;
  year: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

/**
 * Represents a complete mortgage scenario
 */
export interface MortgageScenario {
  id: string;
  name: string;
  loanAmount: number;
  annualRate: number;
  tenureMonths: number;
  monthlyEMI: number;
  totalInterest: number;
  totalAmount: number;
  monthlyOverpayment?: number;
  lumpSumPayment?: number;
  lumpSumMonth?: number;
  fixedRateEndMonth?: number;
  postFixedRate?: number;
  createdAt: Date;
}

/**
 * Represents the result of an overpayment calculation
 */
export interface OverpaymentResult {
  originalTenureMonths: number;
  newTenureMonths: number;
  tenureSaved: number;
  originalTotalInterest: number;
  newTotalInterest: number;
  interestSaved: number;
  interestSavedPercentage: number;
  monthlyOverpayment: number;
  schedule: PaymentRecord[];
}

/**
 * Represents the result of a fixed-rate term calculation
 */
export interface FixedRateResult {
  originalTenureMonths: number;
  fixedRateEndMonth: number;
  principalAfterFixedPeriod: number;
  interestDuringFixedPeriod: number;
  remainingTenureAfterFixed: number;
  totalInterestSaved: number;
  schedule: PaymentRecord[];
}

/**
 * Represents the result of a part payment calculation
 */
export interface PartPaymentResult {
  originalBalance: number;
  lumpSumAmount: number;
  newBalance: number;
  principalReduction: number;
  originalTenureMonths: number;
  newTenureMonths: number;
  tenureSaved: number;
  originalTotalInterest: number;
  newTotalInterest: number;
  interestSaved: number;
  maxAllowedPayment: number;
  isWithinLimit: boolean;
  schedule: PaymentRecord[];
}

/**
 * Calculate monthly EMI using the standard amortization formula
 * EMI = P × [r(1+r)^n] / [(1+r)^n - 1]
 * 
 * @param principal - Loan amount in currency units
 * @param annualRate - Annual interest rate as a percentage (e.g., 5 for 5%)
 * @param tenureMonths - Loan tenure in months
 * @returns Monthly EMI amount
 */
export function calculateMonthlyEMI(
  principal: number,
  annualRate: number,
  tenureMonths: number
): number {
  const monthlyRate = annualRate / 12 / 100;
  
  if (monthlyRate === 0) {
    return principal / tenureMonths;
  }
  
  const numerator = monthlyRate * Math.pow(1 + monthlyRate, tenureMonths);
  const denominator = Math.pow(1 + monthlyRate, tenureMonths) - 1;
  
  return (principal * numerator) / denominator;
}

/**
 * Calculate total interest and total amount payable
 * 
 * @param principal - Loan amount
 * @param monthlyEMI - Monthly EMI
 * @param tenureMonths - Tenure in months
 * @returns Object with totalInterest and totalAmount
 */
export function calculateTotalInterestAndAmount(
  principal: number,
  monthlyEMI: number,
  tenureMonths: number
): { totalInterest: number; totalAmount: number } {
  const totalAmount = monthlyEMI * tenureMonths;
  const totalInterest = totalAmount - principal;
  
  return { totalInterest, totalAmount };
}

/**
 * Generate amortization schedule for a standard mortgage
 * 
 * @param principal - Loan amount
 * @param annualRate - Annual interest rate as a percentage
 * @param tenureMonths - Tenure in months
 * @param monthlyOverpayment - Optional extra monthly payment
 * @returns Array of payment records
 */
export function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  monthlyOverpayment: number = 0
): PaymentRecord[] {
  const monthlyEMI = calculateMonthlyEMI(principal, annualRate, tenureMonths);
  const monthlyRate = annualRate / 12 / 100;
  
  const schedule: PaymentRecord[] = [];
  let balance = principal;
  let month = 0;
  let year = 0;
  
  while (balance > 0 && month < tenureMonths * 2) {
    // Calculate interest for this month
    const interestPayment = balance * monthlyRate;
    
    // Calculate principal payment (EMI - Interest + Overpayment)
    let principalPayment = monthlyEMI - interestPayment + monthlyOverpayment;
    
    // If principal payment exceeds balance, pay only remaining balance
    if (principalPayment > balance) {
      principalPayment = balance;
    }
    
    // Total payment for this month
    const totalPayment = interestPayment + principalPayment;
    
    // Update balance
    balance -= principalPayment;
    
    // Add to schedule
    schedule.push({
      month: month + 1,
      year: year,
      payment: totalPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(0, balance),
    });
    
    // Increment month and year
    month++;
    if (month === 12) {
      month = 0;
      year++;
    }
  }
  
  return schedule;
}

/**
 * Calculate the impact of monthly overpayments
 * 
 * @param principal - Loan amount
 * @param annualRate - Annual interest rate as a percentage
 * @param tenureMonths - Original tenure in months
 * @param monthlyOverpayment - Extra monthly payment amount
 * @returns OverpaymentResult with new tenure, interest saved, and schedule
 */
export function calculateOverpaymentImpact(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  monthlyOverpayment: number
): OverpaymentResult {
  // Calculate original scenario
  const originalEMI = calculateMonthlyEMI(principal, annualRate, tenureMonths);
  const { totalInterest: originalTotalInterest } = calculateTotalInterestAndAmount(
    principal,
    originalEMI,
    tenureMonths
  );
  
  // Generate schedule with overpayment
  const schedule = generateAmortizationSchedule(
    principal,
    annualRate,
    tenureMonths,
    monthlyOverpayment
  );
  
  // Calculate new tenure and interest
  const newTenureMonths = schedule.length;
  const newTotalInterest = schedule.reduce((sum, record) => sum + record.interest, 0);
  const interestSaved = originalTotalInterest - newTotalInterest;
  const interestSavedPercentage = (interestSaved / originalTotalInterest) * 100;
  
  return {
    originalTenureMonths: tenureMonths,
    newTenureMonths: newTenureMonths,
    tenureSaved: tenureMonths - newTenureMonths,
    originalTotalInterest: originalTotalInterest,
    newTotalInterest: newTotalInterest,
    interestSaved: interestSaved,
    interestSavedPercentage: interestSavedPercentage,
    monthlyOverpayment: monthlyOverpayment,
    schedule: schedule,
  };
}

/**
 * Calculate the impact of a fixed-rate period with overpayment
 * 
 * @param principal - Loan amount
 * @param fixedRate - Fixed interest rate as a percentage
 * @param fixedRateMonths - Duration of fixed rate period in months
 * @param postFixedRate - Interest rate after fixed period ends
 * @param totalTenureMonths - Total tenure of the loan
 * @param monthlyOverpayment - Extra monthly payment during fixed period
 * @returns FixedRateResult with principal after fixed period and schedule
 */
export function calculateFixedRateImpact(
  principal: number,
  fixedRate: number,
  fixedRateMonths: number,
  postFixedRate: number,
  totalTenureMonths: number,
  monthlyOverpayment: number = 0
): FixedRateResult {
  const monthlyRate = fixedRate / 12 / 100;
  const schedule: PaymentRecord[] = [];
  let balance = principal;
  let month = 0;
  let year = 0;
  
  // Calculate EMI for the entire loan at fixed rate (for reference)
  const fixedEMI = calculateMonthlyEMI(principal, fixedRate, totalTenureMonths);
  
  // Generate schedule for fixed period
  for (let i = 0; i < fixedRateMonths && balance > 0; i++) {
    const interestPayment = balance * monthlyRate;
    let principalPayment = fixedEMI - interestPayment + monthlyOverpayment;
    
    if (principalPayment > balance) {
      principalPayment = balance;
    }
    
    const totalPayment = interestPayment + principalPayment;
    balance -= principalPayment;
    
    schedule.push({
      month: month + 1,
      year: year,
      payment: totalPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(0, balance),
    });
    
    month++;
    if (month === 12) {
      month = 0;
      year++;
    }
  }
  
  const principalAfterFixedPeriod = balance;
  const interestDuringFixedPeriod = schedule.reduce((sum, record) => sum + record.interest, 0);
  
  // Calculate remaining tenure after fixed period
  const remainingMonths = totalTenureMonths - fixedRateMonths;
  const postFixedEMI = calculateMonthlyEMI(balance, postFixedRate, remainingMonths);
  
  // Generate schedule for post-fixed period
  const postFixedRate_monthly = postFixedRate / 12 / 100;
  let postFixedBalance = balance;
  
  for (let i = 0; i < remainingMonths && postFixedBalance > 0; i++) {
    const interestPayment = postFixedBalance * postFixedRate_monthly;
    let principalPayment = postFixedEMI - interestPayment;
    
    if (principalPayment > postFixedBalance) {
      principalPayment = postFixedBalance;
    }
    
    const totalPayment = interestPayment + principalPayment;
    postFixedBalance -= principalPayment;
    
    schedule.push({
      month: month + 1,
      year: year,
      payment: totalPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(0, postFixedBalance),
    });
    
    month++;
    if (month === 12) {
      month = 0;
      year++;
    }
  }
  
  // Calculate total interest saved vs. original scenario
  const originalEMI = calculateMonthlyEMI(principal, fixedRate, totalTenureMonths);
  const { totalInterest: originalTotalInterest } = calculateTotalInterestAndAmount(
    principal,
    originalEMI,
    totalTenureMonths
  );
  
  const newTotalInterest = schedule.reduce((sum, record) => sum + record.interest, 0);
  const totalInterestSaved = originalTotalInterest - newTotalInterest;
  
  return {
    originalTenureMonths: totalTenureMonths,
    fixedRateEndMonth: fixedRateMonths,
    principalAfterFixedPeriod: principalAfterFixedPeriod,
    interestDuringFixedPeriod: interestDuringFixedPeriod,
    remainingTenureAfterFixed: remainingMonths,
    totalInterestSaved: totalInterestSaved,
    schedule: schedule,
  };
}

/**
 * Calculate the impact of a lump-sum (part) payment
 * Regulatory limit: typically 10% of original loan per year
 * 
 * @param currentBalance - Current loan balance
 * @param remainingTenureMonths - Remaining tenure in months
 * @param annualRate - Annual interest rate as a percentage
 * @param lumpSumAmount - One-time payment amount
 * @param originalLoanAmount - Original loan amount (for calculating max allowed payment)
 * @returns PartPaymentResult with new balance, tenure, and interest saved
 */
export function calculatePartPaymentImpact(
  currentBalance: number,
  remainingTenureMonths: number,
  annualRate: number,
  lumpSumAmount: number,
  originalLoanAmount: number
): PartPaymentResult {
  // Calculate max allowed payment (10% of original loan per year, typically)
  // For simplicity, we allow up to 10% of the original loan as a one-time payment
  const maxAllowedPayment = originalLoanAmount * 0.1;
  const isWithinLimit = lumpSumAmount <= maxAllowedPayment;
  
  // Calculate original scenario
  const originalEMI = calculateMonthlyEMI(currentBalance, annualRate, remainingTenureMonths);
  const { totalInterest: originalTotalInterest } = calculateTotalInterestAndAmount(
    currentBalance,
    originalEMI,
    remainingTenureMonths
  );
  
  // Apply lump-sum payment
  const newBalance = Math.max(0, currentBalance - lumpSumAmount);
  
  if (newBalance === 0) {
    return {
      originalBalance: currentBalance,
      lumpSumAmount,
      newBalance: 0,
      principalReduction: currentBalance,
      originalTenureMonths: remainingTenureMonths,
      newTenureMonths: 0,
      tenureSaved: remainingTenureMonths,
      originalTotalInterest,
      newTotalInterest: 0,
      interestSaved: originalTotalInterest,
      maxAllowedPayment,
      isWithinLimit,
      schedule: [],
    };
  }
  
  // Calculate new EMI and tenure
  const newEMI = calculateMonthlyEMI(newBalance, annualRate, remainingTenureMonths);
  
  // Generate schedule for new scenario
  const schedule = generateAmortizationSchedule(newBalance, annualRate, remainingTenureMonths);
  
  const newTenureMonths = schedule.length;
  const newTotalInterest = schedule.reduce((sum, record) => sum + record.interest, 0);
  const interestSaved = originalTotalInterest - newTotalInterest;
  
  return {
    originalBalance: currentBalance,
    lumpSumAmount,
    newBalance,
    principalReduction: lumpSumAmount,
    originalTenureMonths: remainingTenureMonths,
    newTenureMonths,
    tenureSaved: remainingTenureMonths - newTenureMonths,
    originalTotalInterest,
    newTotalInterest,
    interestSaved,
    maxAllowedPayment,
    isWithinLimit,
    schedule,
  };
}

/**
 * Compare multiple mortgage scenarios
 * 
 * @param scenarios - Array of mortgage scenarios to compare
 * @returns Comparison data for visualization
 */
export function compareScenarios(scenarios: MortgageScenario[]): {
  scenarios: MortgageScenario[];
  metrics: {
    monthlyEMI: number[];
    totalInterest: number[];
    totalAmount: number[];
    tenure: number[];
  };
} {
  return {
    scenarios,
    metrics: {
      monthlyEMI: scenarios.map((s) => s.monthlyEMI),
      totalInterest: scenarios.map((s) => s.totalInterest),
      totalAmount: scenarios.map((s) => s.totalAmount),
      tenure: scenarios.map((s) => s.tenureMonths),
    },
  };
}

/**
 * Convert months to years and months format
 * 
 * @param months - Total months
 * @returns Object with years and remaining months
 */
export function monthsToYearsMonths(months: number): { years: number; months: number } {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return { years, months: remainingMonths };
}

/**
 * Format currency value with proper decimal places
 * 
 * @param value - Numeric value
 * @param decimalPlaces - Number of decimal places (default: 2)
 * @returns Formatted string
 */
export function formatCurrency(value: number, decimalPlaces: number = 2): string {
  return value.toFixed(decimalPlaces);
}

