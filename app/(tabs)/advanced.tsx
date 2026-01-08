import React, { useState, useCallback, useMemo } from "react";
import { ScrollView, View, Text, Alert, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import {
  InputField,
  Button,
  ResultSummary,
  SectionHeader,
  InfoBox,
  Card,
} from "@/components/mortgage-components";
import { useMortgage } from "@/lib/mortgage-context";
import {
  formatCurrency,
  monthsToYearsMonths,
  MortgageScenario,
} from "@/lib/mortgage-calculator";
import {
  calculateAdvancedMortgage,
  formatDate,
  getMonthYearString,
  AdvancedMortgageInput,
} from "@/lib/advanced-calculator";
import { ComparisonChart } from "@/components/chart-component";

/**
 * Advanced Calculator Screen
 * 
 * Complex mortgage scenarios with:
 * - Fixed-rate periods
 * - Lump-sum payments on specific dates
 * - Extra monthly payments for specific periods
 * - EMI payment date tracking
 */
export default function AdvancedCalculatorScreen() {
  const { addScenario, state } = useMortgage();

  // Basic loan details
  const [loanAmount, setLoanAmount] = useState("300000");
  const [annualRate, setAnnualRate] = useState("5");
  const [tenureYears, setTenureYears] = useState("30");
  const [loanStartDate, setLoanStartDate] = useState(new Date());
  const [emiPaymentDate, setEmiPaymentDate] = useState("1");

  // Fixed-rate period
  const [hasFixedRate, setHasFixedRate] = useState(false);
  const [fixedRateMonths, setFixedRateMonths] = useState("24");
  const [fixedRate, setFixedRate] = useState("4");
  const [variableRate, setVariableRate] = useState("5.5");

  // Lump-sum payment
  const [hasLumpSum, setHasLumpSum] = useState(false);
  const [lumpSumAmount, setLumpSumAmount] = useState("50000");
  const [lumpSumDate, setLumpSumDate] = useState(new Date());

  // Extra monthly payments
  const [hasExtraPayments, setHasExtraPayments] = useState(false);
  const [extraPaymentAmount, setExtraPaymentAmount] = useState("5000");
  const [extraPaymentStartDate, setExtraPaymentStartDate] = useState(new Date());
  const [extraPaymentEndDate, setExtraPaymentEndDate] = useState(
    new Date(new Date().setFullYear(new Date().getFullYear() + 2))
  );

  // Results
  const [results, setResults] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [scenarioName, setScenarioName] = useState("Advanced Scenario");

  const validateInputs = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    const loan = parseFloat(loanAmount);
    if (isNaN(loan) || loan <= 0) {
      newErrors.loanAmount = "Enter a valid loan amount";
    }

    const rate = parseFloat(annualRate);
    if (isNaN(rate) || rate < 0 || rate > 30) {
      newErrors.annualRate = "Enter a valid interest rate";
    }

    const years = parseFloat(tenureYears);
    if (isNaN(years) || years <= 0 || years > 50) {
      newErrors.tenureYears = "Enter a valid tenure";
    }

    const emiDay = parseInt(emiPaymentDate);
    if (isNaN(emiDay) || emiDay < 1 || emiDay > 31) {
      newErrors.emiPaymentDate = "Enter a valid day (1-31)";
    }

    if (hasFixedRate) {
      const fixedMonths = parseInt(fixedRateMonths);
      if (isNaN(fixedMonths) || fixedMonths <= 0) {
        newErrors.fixedRateMonths = "Enter valid fixed rate months";
      }

      const fRate = parseFloat(fixedRate);
      if (isNaN(fRate) || fRate < 0 || fRate > 30) {
        newErrors.fixedRate = "Enter valid fixed rate";
      }

      const vRate = parseFloat(variableRate);
      if (isNaN(vRate) || vRate < 0 || vRate > 30) {
        newErrors.variableRate = "Enter valid variable rate";
      }
    }

    if (hasLumpSum) {
      const lumpSum = parseFloat(lumpSumAmount);
      if (isNaN(lumpSum) || lumpSum <= 0) {
        newErrors.lumpSumAmount = "Enter valid lump sum amount";
      }
    }

    if (hasExtraPayments) {
      const extra = parseFloat(extraPaymentAmount);
      if (isNaN(extra) || extra <= 0) {
        newErrors.extraPaymentAmount = "Enter valid extra payment amount";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    loanAmount,
    annualRate,
    tenureYears,
    emiPaymentDate,
    hasFixedRate,
    fixedRateMonths,
    fixedRate,
    variableRate,
    hasLumpSum,
    lumpSumAmount,
    hasExtraPayments,
    extraPaymentAmount,
  ]);

  // Calculate results
  useMemo(() => {
    if (!validateInputs()) {
      setResults(null);
      return;
    }

    try {
      const input: AdvancedMortgageInput = {
        loanAmount: parseFloat(loanAmount),
        annualRate: parseFloat(annualRate),
        tenureMonths: parseFloat(tenureYears) * 12,
        emiPaymentDate: parseInt(emiPaymentDate),
        loanStartDate,
        hasFixedRatePeriod: hasFixedRate,
        fixedRateMonths: hasFixedRate ? parseInt(fixedRateMonths) : undefined,
        fixedRate: hasFixedRate ? parseFloat(fixedRate) : undefined,
        variableRate: hasFixedRate ? parseFloat(variableRate) : undefined,
        fixedRateEndDate: hasFixedRate
          ? new Date(loanStartDate.getTime() + parseInt(fixedRateMonths) * 30 * 24 * 60 * 60 * 1000)
          : undefined,
        hasLumpSum,
        lumpSumAmount: hasLumpSum ? parseFloat(lumpSumAmount) : undefined,
        lumpSumDate: hasLumpSum ? lumpSumDate : undefined,
        hasExtraPayments,
        extraPaymentAmount: hasExtraPayments ? parseFloat(extraPaymentAmount) : undefined,
        extraPaymentStartDate: hasExtraPayments ? extraPaymentStartDate : undefined,
        extraPaymentEndDate: hasExtraPayments ? extraPaymentEndDate : undefined,
      };

      const result = calculateAdvancedMortgage(input);
      setResults(result);
    } catch (error) {
      console.error("Calculation error:", error);
      setResults(null);
    }
  }, [
    loanAmount,
    annualRate,
    tenureYears,
    loanStartDate,
    emiPaymentDate,
    hasFixedRate,
    fixedRateMonths,
    fixedRate,
    variableRate,
    hasLumpSum,
    lumpSumAmount,
    lumpSumDate,
    hasExtraPayments,
    extraPaymentAmount,
    extraPaymentStartDate,
    extraPaymentEndDate,
    validateInputs,
  ]);

  const { years: resultYears, months: resultMonths } = results
    ? monthsToYearsMonths(results.newTenureMonths)
    : { years: 0, months: 0 };

  const { years: origYears, months: origMonths } = results
    ? monthsToYearsMonths(results.originalTenureMonths)
    : { years: 0, months: 0 };

  const comparisonData = results
    ? [
        {
          label: "Original",
          value: Math.round(results.originalTotalInterest),
          color: "#F59E0B",
        },
        {
          label: "Advanced Plan",
          value: Math.round(results.newTotalInterest),
          color: "#10B981",
        },
      ]
    : [];

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        {/* Header */}
        <SectionHeader
          title="Advanced Calculator"
          subtitle="Complex scenarios with fixed rates, lump sums & extra payments"
        />

        {/* Info Box */}
        <InfoBox
          type="info"
          title="Advanced Features"
          message="Plan complex mortgage scenarios with fixed-rate periods, lump-sum payments, and flexible extra payment schedules."
        />

        {/* Basic Loan Details */}
        <View className="mb-6">
          <SectionHeader title="Loan Details" />

          <InputField
            label="Loan Amount"
            value={loanAmount}
            onChangeText={setLoanAmount}
            placeholder="300000"
            keyboardType="decimal-pad"
            suffix={state.currency}
            error={errors.loanAmount}
          />

          <InputField
            label="Annual Interest Rate"
            value={annualRate}
            onChangeText={setAnnualRate}
            placeholder="5"
            keyboardType="decimal-pad"
            suffix="%"
            error={errors.annualRate}
          />

          <InputField
            label="Tenure (Years)"
            value={tenureYears}
            onChangeText={setTenureYears}
            placeholder="30"
            keyboardType="decimal-pad"
            suffix="years"
            error={errors.tenureYears}
          />

          <InputField
            label="EMI Payment Date (Day of Month)"
            value={emiPaymentDate}
            onChangeText={setEmiPaymentDate}
            placeholder="1"
            keyboardType="numeric"
            suffix="day"
            error={errors.emiPaymentDate}
          />

          <Card>
            <Text className="text-sm text-muted mb-2">Loan Start Date</Text>
            <Text className="text-lg font-semibold text-foreground">
              {formatDate(loanStartDate)}
            </Text>
          </Card>
        </View>

        {/* Fixed-Rate Period */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <SectionHeader title="Fixed-Rate Period" />
            <TouchableOpacity
              onPress={() => setHasFixedRate(!hasFixedRate)}
              className={`px-4 py-2 rounded-lg ${
                hasFixedRate ? "bg-primary" : "bg-surface border border-border"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  hasFixedRate ? "text-white" : "text-foreground"
                }`}
              >
                {hasFixedRate ? "Enabled" : "Disabled"}
              </Text>
            </TouchableOpacity>
          </View>

          {hasFixedRate && (
            <>
              <InputField
                label="Fixed Rate Period (Months)"
                value={fixedRateMonths}
                onChangeText={setFixedRateMonths}
                placeholder="24"
                keyboardType="numeric"
                suffix="months"
                error={errors.fixedRateMonths}
              />

              <InputField
                label="Fixed Interest Rate"
                value={fixedRate}
                onChangeText={setFixedRate}
                placeholder="4"
                keyboardType="decimal-pad"
                suffix="%"
                error={errors.fixedRate}
              />

              <InputField
                label="Variable Interest Rate (After Fixed)"
                value={variableRate}
                onChangeText={setVariableRate}
                placeholder="5.5"
                keyboardType="decimal-pad"
                suffix="%"
                error={errors.variableRate}
              />
            </>
          )}
        </View>

        {/* Lump-Sum Payment */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <SectionHeader title="Lump-Sum Payment" />
            <TouchableOpacity
              onPress={() => setHasLumpSum(!hasLumpSum)}
              className={`px-4 py-2 rounded-lg ${
                hasLumpSum ? "bg-primary" : "bg-surface border border-border"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  hasLumpSum ? "text-white" : "text-foreground"
                }`}
              >
                {hasLumpSum ? "Enabled" : "Disabled"}
              </Text>
            </TouchableOpacity>
          </View>

          {hasLumpSum && (
            <>
              <InputField
                label="Lump-Sum Amount"
                value={lumpSumAmount}
                onChangeText={setLumpSumAmount}
                placeholder="50000"
                keyboardType="decimal-pad"
                suffix={state.currency}
                error={errors.lumpSumAmount}
              />

              <Card>
                <Text className="text-sm text-muted mb-2">Payment Date</Text>
                <Text className="text-lg font-semibold text-foreground">
                  {formatDate(lumpSumDate)}
                </Text>
                <Button
                  title="Change Date"
                  onPress={() => {
                    const newDate = new Date(lumpSumDate);
                    newDate.setMonth(newDate.getMonth() + 6);
                    setLumpSumDate(newDate);
                  }}
                  variant="outline"
                  size="small"
                />
              </Card>
            </>
          )}
        </View>

        {/* Extra Monthly Payments */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <SectionHeader title="Extra Monthly Payments" />
            <TouchableOpacity
              onPress={() => setHasExtraPayments(!hasExtraPayments)}
              className={`px-4 py-2 rounded-lg ${
                hasExtraPayments ? "bg-primary" : "bg-surface border border-border"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  hasExtraPayments ? "text-white" : "text-foreground"
                }`}
              >
                {hasExtraPayments ? "Enabled" : "Disabled"}
              </Text>
            </TouchableOpacity>
          </View>

          {hasExtraPayments && (
            <>
              <InputField
                label="Extra Payment Amount"
                value={extraPaymentAmount}
                onChangeText={setExtraPaymentAmount}
                placeholder="5000"
                keyboardType="decimal-pad"
                suffix={state.currency}
                error={errors.extraPaymentAmount}
              />

              <Card>
                <Text className="text-sm text-muted mb-2">Start Date</Text>
                <Text className="text-base font-semibold text-foreground mb-3">
                  {formatDate(extraPaymentStartDate)}
                </Text>

                <Text className="text-sm text-muted mb-2">End Date</Text>
                <Text className="text-base font-semibold text-foreground">
                  {formatDate(extraPaymentEndDate)}
                </Text>
              </Card>
            </>
          )}
        </View>

        {/* Results */}
        {results && (
          <View className="mb-6">
            <SectionHeader title="Calculation Results" />

            <ResultSummary
              title="Tenure Impact"
              results={[
                {
                  label: "Original Tenure",
                  value: `${origYears}y ${origMonths}m`,
                },
                {
                  label: "New Tenure",
                  value: `${resultYears}y ${resultMonths}m`,
                  highlight: true,
                },
                {
                  label: "Time Saved",
                  value: `${results.tenureSaved} months`,
                  highlight: true,
                },
              ]}
            />

            <ResultSummary
              title="Interest Savings"
              results={[
                {
                  label: "Original Total Interest",
                  value: `${state.currency} ${formatCurrency(results.originalTotalInterest)}`,
                },
                {
                  label: "New Total Interest",
                  value: `${state.currency} ${formatCurrency(results.newTotalInterest)}`,
                  highlight: true,
                },
                {
                  label: "Interest Saved",
                  value: `${state.currency} ${formatCurrency(results.interestSaved)}`,
                  highlight: true,
                },
                {
                  label: "Savings %",
                  value: `${results.interestSavedPercentage.toFixed(1)}%`,
                  highlight: true,
                },
              ]}
            />

            {/* Payment Summary */}
            <Card>
              <Text className="text-base font-bold text-foreground mb-3">
                Payment Summary
              </Text>
              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">Monthly EMI</Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {state.currency} {formatCurrency(results.originalMonthlyEMI)}
                  </Text>
                </View>
                {results.totalLumpSum > 0 && (
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Total Lump Sum</Text>
                    <Text className="text-sm font-semibold text-success">
                      {state.currency} {formatCurrency(results.totalLumpSum)}
                    </Text>
                  </View>
                )}
                {results.totalExtraPayments > 0 && (
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted">Total Extra Payments</Text>
                    <Text className="text-sm font-semibold text-success">
                      {state.currency} {formatCurrency(results.totalExtraPayments)}
                    </Text>
                  </View>
                )}
              </View>
            </Card>

            {/* Comparison Chart */}
            <ComparisonChart
              data={comparisonData}
              title="Interest Paid Comparison"
            />

            {/* Save Scenario */}
            <InputField
              label="Scenario Name"
              value={scenarioName}
              onChangeText={setScenarioName}
              placeholder="Advanced Scenario"
            />

            <Button
              title="Save This Scenario"
              onPress={() => {
                try {
                  const scenario: MortgageScenario = {
                    id: `scenario_${Date.now()}`,
                    name: scenarioName,
                    loanAmount: parseFloat(loanAmount),
                    annualRate: parseFloat(annualRate),
                    tenureMonths: results.newTenureMonths,
                    monthlyEMI: results.originalMonthlyEMI,
                    totalInterest: results.newTotalInterest,
                    totalAmount: parseFloat(loanAmount) + results.newTotalInterest,
                    createdAt: new Date(),
                  };

                  addScenario(scenario);
                  Alert.alert("Success", `Scenario "${scenarioName}" saved!`);
                  setScenarioName("Advanced Scenario");
                } catch (error) {
                  Alert.alert("Error", "Failed to save scenario.");
                }
              }}
              variant="primary"
              size="large"
            />
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

