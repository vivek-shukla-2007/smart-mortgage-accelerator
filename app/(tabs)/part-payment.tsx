import React, { useState, useCallback, useMemo } from "react";
import { ScrollView, View, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { CalculatorBannerAd } from "@/components/admob-banner";
import {
  InputField,
  Button,
  ResultSummary,
  SectionHeader,
  InfoBox,
} from "@/components/mortgage-components";
import { useMortgage } from "@/lib/mortgage-context";
import {
  calculatePartPaymentImpact,
  formatCurrency,
  monthsToYearsMonths,
  MortgageScenario,
} from "@/lib/mortgage-calculator";
import { ComparisonChart } from "@/components/chart-component";

/**
 * Part Payment (Lump Sum) Calculator Screen
 * 
 * Calculates the impact of one-time lump-sum payments on mortgage
 */
export default function PartPaymentScreen() {
  const { addScenario, state, getCurrentScenario } = useMortgage();
  const currentScenario = getCurrentScenario();

  // Form state
  const [currentBalance, setCurrentBalance] = useState(
    currentScenario?.loanAmount.toString() || "250000"
  );
  const [remainingTenureYears, setRemainingTenureYears] = useState(
    (currentScenario?.tenureMonths || 360) / 12
  );
  const [annualRate, setAnnualRate] = useState(
    currentScenario?.annualRate.toString() || "5"
  );
  const [lumpSumAmount, setLumpSumAmount] = useState("50000");
  const [originalLoanAmount, setOriginalLoanAmount] = useState(
    currentScenario?.loanAmount.toString() || "300000"
  );
  const [scenarioName, setScenarioName] = useState("Lump Sum Payment");

  // Results state
  const [results, setResults] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateInputs = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    const balance = parseFloat(currentBalance);
    if (isNaN(balance) || balance <= 0) {
      newErrors.currentBalance = "Enter a valid current balance";
    }

    const rate = parseFloat(annualRate);
    if (isNaN(rate) || rate < 0 || rate > 30) {
      newErrors.annualRate = "Enter a valid interest rate (0-30%)";
    }

    const years = parseFloat(remainingTenureYears.toString());
    if (isNaN(years) || years <= 0 || years > 50) {
      newErrors.remainingTenureYears = "Enter a valid tenure (1-50 years)";
    }

    const lumpSum = parseFloat(lumpSumAmount);
    if (isNaN(lumpSum) || lumpSum < 0) {
      newErrors.lumpSumAmount = "Enter a valid lump sum amount";
    }

    const origLoan = parseFloat(originalLoanAmount);
    if (isNaN(origLoan) || origLoan <= 0) {
      newErrors.originalLoanAmount = "Enter a valid original loan amount";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentBalance, annualRate, remainingTenureYears, lumpSumAmount, originalLoanAmount]);

  // Calculate results whenever inputs change
  useMemo(() => {
    if (!validateInputs()) {
      setResults(null);
      return;
    }

    try {
      const balance = parseFloat(currentBalance);
      const rate = parseFloat(annualRate);
      const years = parseFloat(remainingTenureYears.toString());
      const tenureMonths = years * 12;
      const lumpSum = parseFloat(lumpSumAmount);
      const origLoan = parseFloat(originalLoanAmount);

      const result = calculatePartPaymentImpact(
        balance,
        tenureMonths,
        rate,
        lumpSum,
        origLoan
      );

      setResults(result);
    } catch (error) {
      setResults(null);
    }
  }, [currentBalance, annualRate, remainingTenureYears, lumpSumAmount, originalLoanAmount, validateInputs]);

  const handleSaveScenario = useCallback(() => {
    if (!results) {
      return;
    }

    try {
      const scenario: MortgageScenario = {
        id: `scenario_${Date.now()}`,
        name: scenarioName,
        loanAmount: parseFloat(currentBalance),
        annualRate: parseFloat(annualRate),
        tenureMonths: results.newTenureMonths,
        monthlyEMI: results.schedule[0]?.payment || 0,
        totalInterest: results.newTotalInterest,
        totalAmount: results.newBalance + results.newTotalInterest,
        lumpSumPayment: parseFloat(lumpSumAmount),
        createdAt: new Date(),
      };

      addScenario(scenario);
      Alert.alert("Success", `Scenario "${scenarioName}" saved!`);

      // Reset form
      setScenarioName("Lump Sum Payment");
      setLumpSumAmount("50000");
    } catch (error) {
      Alert.alert("Error", "Failed to save scenario.");
    }
  }, [results, scenarioName, currentBalance, annualRate, lumpSumAmount, addScenario]);

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
          label: "After Lump Sum",
          value: Math.round(results.newTotalInterest),
          color: "#10B981",
        },
      ]
    : [];

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}>
        {/* Header */}
        <SectionHeader
          title="Part Payment Calculator"
          subtitle="Calculate impact of one-time lump-sum payments"
        />

        {/* Info Box */}
        <InfoBox
          type="info"
          title="How it works"
          message="Enter your current loan balance and the lump-sum amount to see how it reduces your remaining tenure and interest."
        />

        {/* Input Section */}
        <View className="mb-6">
          <SectionHeader title="Loan Details" />

          <InputField
            label="Original Loan Amount"
            value={originalLoanAmount}
            onChangeText={setOriginalLoanAmount}
            placeholder="300000"
            keyboardType="decimal-pad"
            suffix={state.currency}
            error={errors.originalLoanAmount}
          />

          <InputField
            label="Current Balance"
            value={currentBalance}
            onChangeText={setCurrentBalance}
            placeholder="250000"
            keyboardType="decimal-pad"
            suffix={state.currency}
            error={errors.currentBalance}
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
            label="Remaining Tenure (Years)"
            value={remainingTenureYears.toString()}
            onChangeText={(val) => setRemainingTenureYears(parseFloat(val) || 0)}
            placeholder="25"
            keyboardType="decimal-pad"
            suffix="years"
            error={errors.remainingTenureYears}
          />
        </View>

        {/* Lump Sum Input */}
        <View className="mb-6">
          <SectionHeader title="Lump Sum Payment" />

          <InputField
            label="Lump Sum Amount"
            value={lumpSumAmount}
            onChangeText={setLumpSumAmount}
            placeholder="50000"
            keyboardType="decimal-pad"
            suffix={state.currency}
            error={errors.lumpSumAmount}
          />

          {results && !results.isWithinLimit && (
            <InfoBox
              type="warning"
              title="Payment Limit"
              message={`Maximum allowed: ${state.currency} ${formatCurrency(results.maxAllowedPayment)} (10% of original loan)`}
            />
          )}
        </View>

        {/* Results Section */}
        {results && (
          <View className="mb-6">
            <SectionHeader title="Impact Analysis" />

            <ResultSummary
              title="Balance & Tenure"
              results={[
                {
                  label: "Original Balance",
                  value: `${state.currency} ${formatCurrency(results.originalBalance)}`,
                },
                {
                  label: "New Balance",
                  value: `${state.currency} ${formatCurrency(results.newBalance)}`,
                  highlight: true,
                },
                {
                  label: "Principal Reduction",
                  value: `${state.currency} ${formatCurrency(results.principalReduction)}`,
                  highlight: true,
                },
              ]}
            />

            <ResultSummary
              title="Tenure Reduction"
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
              ]}
            />

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
              placeholder="Lump Sum Payment"
            />

            <Button
              title="Save This Scenario"
              onPress={handleSaveScenario}
              variant="primary"
              size="large"
            />
          </View>
        )}
      </ScrollView>
      <CalculatorBannerAd />
    </ScreenContainer>
  );
}

