import { describe, it, expect } from "vitest";
import {
  calculateMonthlyEMI,
  calculateTotalInterestAndAmount,
  generateAmortizationSchedule,
  calculateOverpaymentImpact,
  calculatePartPaymentImpact,
  monthsToYearsMonths,
  formatCurrency,
} from "./mortgage-calculator";

describe("Mortgage Calculator", () => {
  describe("calculateMonthlyEMI", () => {
    it("should calculate EMI correctly for a standard mortgage", () => {
      // $300,000 loan at 5% for 30 years (360 months)
      const emi = calculateMonthlyEMI(300000, 5, 360);
      expect(Math.round(emi)).toBe(1610); // Approximately $1,610
    });

    it("should handle zero interest rate", () => {
      const emi = calculateMonthlyEMI(100000, 0, 120);
      expect(emi).toBe(100000 / 120); // Simple division
    });

    it("should calculate higher EMI for higher interest rates", () => {
      const emi5 = calculateMonthlyEMI(100000, 5, 120);
      const emi10 = calculateMonthlyEMI(100000, 10, 120);
      expect(emi10).toBeGreaterThan(emi5);
    });
  });

  describe("calculateTotalInterestAndAmount", () => {
    it("should calculate total interest and amount correctly", () => {
      const result = calculateTotalInterestAndAmount(100000, 1000, 120);
      expect(result.totalAmount).toBe(120000);
      expect(result.totalInterest).toBe(20000);
    });
  });

  describe("generateAmortizationSchedule", () => {
    it("should generate a schedule with correct number of payments", () => {
      const schedule = generateAmortizationSchedule(100000, 5, 120);
      expect(schedule.length).toBeLessThanOrEqual(120);
    });

    it("should have final balance close to zero", () => {
      const schedule = generateAmortizationSchedule(100000, 5, 120);
      const finalBalance = schedule[schedule.length - 1].balance;
      expect(finalBalance).toBeLessThan(1); // Rounding tolerance
    });

    it("should handle overpayments correctly", () => {
      const scheduleNoOverpay = generateAmortizationSchedule(100000, 5, 120);
      const scheduleWithOverpay = generateAmortizationSchedule(100000, 5, 120, 100);
      
      expect(scheduleWithOverpay.length).toBeLessThan(scheduleNoOverpay.length);
    });
  });

  describe("calculateOverpaymentImpact", () => {
    it("should show tenure reduction with overpayment", () => {
      const result = calculateOverpaymentImpact(100000, 5, 120, 100);
      expect(result.newTenureMonths).toBeLessThan(result.originalTenureMonths);
      expect(result.tenureSaved).toBeGreaterThan(0);
    });

    it("should show interest savings with overpayment", () => {
      const result = calculateOverpaymentImpact(100000, 5, 120, 100);
      expect(result.interestSaved).toBeGreaterThan(0);
      expect(result.newTotalInterest).toBeLessThan(result.originalTotalInterest);
    });

    it("should calculate interest saved percentage", () => {
      const result = calculateOverpaymentImpact(100000, 5, 120, 100);
      const expectedPercentage = (result.interestSaved / result.originalTotalInterest) * 100;
      expect(result.interestSavedPercentage).toBeCloseTo(expectedPercentage, 2);
    });
  });

  describe("calculatePartPaymentImpact", () => {
    it("should reduce balance and tenure with lump-sum payment", () => {
      const result = calculatePartPaymentImpact(100000, 120, 5, 10000, 100000);
      expect(result.newBalance).toBe(90000);
      expect(result.principalReduction).toBe(10000);
      expect(result.newTenureMonths).toBeLessThanOrEqual(result.originalTenureMonths);
    });

    it("should calculate interest savings from part payment", () => {
      const result = calculatePartPaymentImpact(100000, 120, 5, 10000, 100000);
      expect(result.interestSaved).toBeGreaterThan(0);
    });

    it("should handle full payment", () => {
      const result = calculatePartPaymentImpact(100000, 120, 5, 100000, 100000);
      expect(result.newBalance).toBe(0);
      expect(result.newTenureMonths).toBe(0);
      expect(result.interestSaved).toBe(result.originalTotalInterest);
    });

    it("should check payment limit", () => {
      const result = calculatePartPaymentImpact(100000, 120, 5, 15000, 100000);
      expect(result.maxAllowedPayment).toBeGreaterThan(0);
    });
  });

  describe("monthsToYearsMonths", () => {
    it("should convert months to years and months correctly", () => {
      const result = monthsToYearsMonths(25);
      expect(result.years).toBe(2);
      expect(result.months).toBe(1);
    });

    it("should handle exact years", () => {
      const result = monthsToYearsMonths(24);
      expect(result.years).toBe(2);
      expect(result.months).toBe(0);
    });

    it("should handle less than a year", () => {
      const result = monthsToYearsMonths(6);
      expect(result.years).toBe(0);
      expect(result.months).toBe(6);
    });
  });

  describe("formatCurrency", () => {
    it("should format currency with default decimal places", () => {
      const formatted = formatCurrency(1234.567);
      expect(formatted).toBe("1234.57");
    });

    it("should format currency with custom decimal places", () => {
      const formatted = formatCurrency(1234.567, 3);
      expect(formatted).toBe("1234.567");
    });

    it("should handle zero decimal places", () => {
      const formatted = formatCurrency(1234.567, 0);
      expect(formatted).toBe("1235");
    });
  });
});

