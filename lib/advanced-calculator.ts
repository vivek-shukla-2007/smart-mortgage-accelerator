/**
 * Advanced Mortgage Calculator
 * 
 * Handles complex scenarios with:
 * - Fixed-rate periods with variable rates after
 * - Lump-sum payments on specific dates
 * - Extra monthly payments for specific periods
 * - EMI payment date tracking
 */

export interface AdvancedMortgageInput {
  loanAmount: number;
  annualRate: number;
  tenureMonths: number;
  emiPaymentDate: number; // Day of month (1-31)
  loanStartDate: Date;
  
  // Fixed-rate period
  hasFixedRatePeriod: boolean;
  fixedRateMonths?: number;
  fixedRate?: number;
  variableRate?: number;
  fixedRateEndDate?: Date;
  
  // Lump-sum payment
  hasLumpSum: boolean;
  lumpSumAmount?: number;
  lumpSumDate?: Date;
  
  // Extra monthly payments
  hasExtraPayments: boolean;
  extraPaymentAmount?: number;
  extraPaymentStartDate?: Date;
  extraPaymentEndDate?: Date;
}

export interface PaymentDetail {
  date: Date;
  monthNumber: number;
  principalPayment: number;
  interestPayment: number;
  totalPayment: number;
  balance: number;
  isLumpSumMonth: boolean;
  isExtraPaymentMonth: boolean;
  interestRate: number;
}

export interface AdvancedCalculationResult {
  schedule: PaymentDetail[];
  originalTenureMonths: number;
  newTenureMonths: number;
  tenureSaved: number;
  originalTotalInterest: number;
  newTotalInterest: number;
  interestSaved: number;
  interestSavedPercentage: number;
  totalLumpSum: number;
  totalExtraPayments: number;
  originalMonthlyEMI: number;
  newMonthlyEMI: number;
}

/**
 * Calculate monthly interest rate
 */
function getMonthlyRate(annualRate: number): number {
  return annualRate / 100 / 12;
}

/**
 * Calculate EMI using standard formula
 */
function calculateEMI(principal: number, monthlyRate: number, months: number): number {
  if (monthlyRate === 0) {
    return principal / months;
  }
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);
}

/**
 * Check if a date falls within a specific month
 */
function isSameMonth(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth();
}

/**
 * Add months to a date
 */
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Get the payment date for a given month
 */
function getPaymentDate(startDate: Date, monthOffset: number, paymentDay: number): Date {
  const date = addMonths(startDate, monthOffset);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const day = Math.min(paymentDay, lastDay);
  return new Date(date.getFullYear(), date.getMonth(), day);
}

/**
 * Advanced mortgage calculation with complex scenarios
 */
export function calculateAdvancedMortgage(input: AdvancedMortgageInput): AdvancedCalculationResult {
  const schedule: PaymentDetail[] = [];
  
  let balance = input.loanAmount;
  let totalInterestPaid = 0;
  let totalLumpSum = 0;
  let totalExtraPayments = 0;
  let month = 0;
  
  // Calculate original EMI (without any extra payments)
  const monthlyRate = getMonthlyRate(input.annualRate);
  const originalEMI = calculateEMI(input.loanAmount, monthlyRate, input.tenureMonths);
  
  // Process each month
  while (balance > 0 && month < input.tenureMonths * 2) {
    const paymentDate = getPaymentDate(input.loanStartDate, month, input.emiPaymentDate);
    
    // Determine interest rate (fixed or variable)
    let currentRate = input.annualRate;
    if (input.hasFixedRatePeriod && input.fixedRateEndDate) {
      if (paymentDate <= input.fixedRateEndDate && input.fixedRate !== undefined) {
        currentRate = input.fixedRate;
      } else if (input.variableRate !== undefined) {
        currentRate = input.variableRate;
      }
    }
    
    const currentMonthlyRate = getMonthlyRate(currentRate);
    
    // Calculate interest for this month
    const interestPayment = balance * currentMonthlyRate;
    totalInterestPaid += interestPayment;
    
    // Determine principal payment
    let principalPayment = originalEMI - interestPayment;
    let totalPayment = originalEMI;
    let isExtraPaymentMonth = false;
    let isLumpSumMonth = false;
    
    // Check for extra monthly payments
    if (input.hasExtraPayments && input.extraPaymentStartDate && input.extraPaymentEndDate && input.extraPaymentAmount) {
      if (paymentDate >= input.extraPaymentStartDate && paymentDate <= input.extraPaymentEndDate) {
        totalPayment += input.extraPaymentAmount;
        principalPayment += input.extraPaymentAmount;
        totalExtraPayments += input.extraPaymentAmount;
        isExtraPaymentMonth = true;
      }
    }
    
    // Check for lump-sum payment
    if (input.hasLumpSum && input.lumpSumDate && input.lumpSumAmount) {
      if (isSameMonth(paymentDate, input.lumpSumDate)) {
        totalPayment += input.lumpSumAmount;
        principalPayment += input.lumpSumAmount;
        totalLumpSum += input.lumpSumAmount;
        isLumpSumMonth = true;
      }
    }
    
    // Adjust principal payment if it exceeds balance
    if (principalPayment > balance) {
      principalPayment = balance;
      totalPayment = balance + interestPayment;
    }
    
    balance -= principalPayment;
    
    schedule.push({
      date: paymentDate,
      monthNumber: month + 1,
      principalPayment,
      interestPayment,
      totalPayment,
      balance: Math.max(0, balance),
      isLumpSumMonth,
      isExtraPaymentMonth,
      interestRate: currentRate,
    });
    
    month++;
    
    // Safety check to prevent infinite loops
    if (month > input.tenureMonths * 2) {
      break;
    }
  }
  
  // Calculate new tenure
  const newTenureMonths = schedule.length;
  const tenureSaved = input.tenureMonths - newTenureMonths;
  
  // Calculate original total interest (without any modifications)
  const originalTotalInterest = (originalEMI * input.tenureMonths) - input.loanAmount;
  const newTotalInterest = totalInterestPaid;
  const interestSaved = originalTotalInterest - newTotalInterest;
  const interestSavedPercentage = (interestSaved / originalTotalInterest) * 100;
  
  return {
    schedule,
    originalTenureMonths: input.tenureMonths,
    newTenureMonths,
    tenureSaved,
    originalTotalInterest,
    newTotalInterest,
    interestSaved,
    interestSavedPercentage,
    totalLumpSum,
    totalExtraPayments,
    originalMonthlyEMI: originalEMI,
    newMonthlyEMI: originalEMI, // EMI remains same, tenure changes
  };
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get month and year string
 */
export function getMonthYearString(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });
}

/**
 * Calculate days until date
 */
export function daysUntilDate(fromDate: Date, toDate: Date): number {
  const diffTime = toDate.getTime() - fromDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

