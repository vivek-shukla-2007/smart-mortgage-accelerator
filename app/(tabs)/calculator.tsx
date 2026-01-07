import React, { useState, useCallback } from "react";
import { ScrollView, View, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import {
  InputField,
  Button,
  ResultSummary,
  SectionHeader,
  InfoBox,
} from "@/components/mortgage-components";
import { useMortgage } from "@/lib/mortgage-context";
import {
  calculateMonthlyEMI,
  calculateTotalInterestAndAmount,
  monthsToYearsMonths,
  formatCurrency,
  MortgageScenario,
} from "@/lib/mortgage-calculator";

/**
 * Basic Calculator Screen
 * 
 * Allows users to enter loan amount, interest rate, and tenure
 * to calculate monthly EMI and total interest.
 */
export default function CalculatorScreen() {
  const { addScenario, state } = useMortgage();

  // Form state
  const [loanAmount, setLoanAmount] = useState("300000");
  const [annualRate, setAnnualRate] = useState("5");
  const [tenureYears, setTenureYears] = useState("30");
  const [scenarioName, setScenarioName] = useState("My Mortgage");
  const [loading, setLoading] = useState(false);

  // Results state
  const [results, setResults] = useState<{
    monthlyEMI: number;
    totalInterest: number;
    totalAmount: number;
    tenureMonths: number;
  } | null>(null);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateInputs = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    const loan = parseFloat(loanAmount);
    if (isNaN(loan) || loan <= 0) {
      newErrors.loanAmount = "Enter a valid loan amount";
    }

    const rate = parseFloat(annualRate);
    if (isNaN(rate) || rate < 0 || rate > 30) {
      newErrors.annualRate = "Enter a valid interest rate (0-30%)";
    }

    const years = parseFloat(tenureYears);
    if (isNaN(years) || years <= 0 || years > 50) {
      newErrors.tenureYears = "Enter a valid tenure (1-50 years)";
    }

    if (!scenarioName.trim()) {
      newErrors.scenarioName = "Enter a scenario name";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [loanAmount, annualRate, tenureYears, scenarioName]);

  const handleCalculate = useCallback(() => {
    if (!validateInputs()) {
      return;
    }

    setLoading(true);

    try {
      const loan = parseFloat(loanAmount);
      const rate = parseFloat(annualRate);
      const years = parseFloat(tenureYears);
      const tenureMonths = years * 12;

      const monthlyEMI = calculateMonthlyEMI(loan, rate, tenureMonths);
      const { totalInterest, totalAmount } = calculateTotalInterestAndAmount(
        loan,
        monthlyEMI,
        tenureMonths
      );

      setResults({
        monthlyEMI,
        totalInterest,
        totalAmount,
        tenureMonths,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to calculate. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  }, [loanAmount, annualRate, tenureYears, validateInputs]);

  const handleSaveScenario = useCallback(() => {
    if (!results) {
      return;
    }

    try {
      const scenario: MortgageScenario = {
        id: `scenario_${Date.now()}`,
        name: scenarioName,
        loanAmount: parseFloat(loanAmount),
        annualRate: parseFloat(annualRate),
        tenureMonths: results.tenureMonths,
        monthlyEMI: results.monthlyEMI,
        totalInterest: results.totalInterest,
        totalAmount: results.totalAmount,
        createdAt: new Date(),
      };

      addScenario(scenario);
      Alert.alert("Success", `Scenario "${scenarioName}" saved!`);

      // Reset form
      setResults(null);
      setScenarioName("My Mortgage");
    } catch (error) {
      Alert.alert("Error", "Failed to save scenario.");
    }
  }, [results, scenarioName, loanAmount, annualRate, addScenario]);

  const { years: resultYears, months: resultMonths } = results
    ? monthsToYearsMonths(results.tenureMonths)
    : { years: 0, months: 0 };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        {/* Header */}
        <SectionHeader
          title="Basic Calculator"
          subtitle="Calculate your monthly EMI and total interest"
        />

        {/* Info Box */}
        <InfoBox
          type="info"
          title="How it works"
          message="Enter your loan details to calculate the monthly payment (EMI) and total interest you'll pay over the loan period."
        />

        {/* Input Section */}
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
            label="Scenario Name"
            value={scenarioName}
            onChangeText={setScenarioName}
            placeholder="My Mortgage"
            error={errors.scenarioName}
          />
        </View>

        {/* Calculate Button */}
        <Button
          title="Calculate"
          onPress={handleCalculate}
          loading={loading}
          variant="primary"
          size="large"
        />

        {/* Results Section */}
        {results && (
          <View className="mt-6">
            <SectionHeader title="Results" />

            <ResultSummary
              title="Monthly Payment"
              results={[
                {
                  label: "Monthly EMI",
                  value: `${state.currency} ${formatCurrency(results.monthlyEMI)}`,
                  highlight: true,
                },
                {
                  label: "Tenure",
                  value: `${resultYears} years ${resultMonths} months`,
                },
                {
                  label: "Total Interest",
                  value: `${state.currency} ${formatCurrency(results.totalInterest)}`,
                },
                {
                  label: "Total Amount Payable",
                  value: `${state.currency} ${formatCurrency(results.totalAmount)}`,
                },
              ]}
            />

            {/* Breakdown */}
            <View className="bg-surface rounded-lg p-4 border border-border mb-4">
              <SectionHeader title="Loan Breakdown" />
              <View className="flex-row justify-between mb-3">
                <View className="flex-1">
                  <View className="h-2 bg-border rounded-full overflow-hidden mb-2">
                    <View
                      style={{
                        height: "100%",
                        width: `${(results.totalAmount - results.totalInterest) / results.totalAmount * 100}%`,
                        backgroundColor: "#1E3A8A",
                        borderRadius: 4,
                      }}
                    />
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 bg-primary rounded mr-2" />
                    <View>
                      <View className="flex-row justify-between">
                        <View>
                          <View className="text-xs text-muted">Principal</View>
                          <View className="text-sm font-semibold text-foreground">
                            {formatCurrency(results.totalAmount - results.totalInterest)}
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              <View className="flex-row justify-between mb-3">
                <View className="flex-1">
                  <View className="h-2 bg-border rounded-full overflow-hidden mb-2">
                    <View
                      style={{
                        height: "100%",
                        width: `${results.totalInterest / results.totalAmount * 100}%`,
                        backgroundColor: "#F59E0B",
                        borderRadius: 4,
                      }}
                    />
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 bg-warning rounded mr-2" />
                    <View>
                      <View className="text-xs text-muted">Interest</View>
                      <View className="text-sm font-semibold text-foreground">
                        {formatCurrency(results.totalInterest)}
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Save Button */}
            <Button
              title="Save This Scenario"
              onPress={handleSaveScenario}
              variant="primary"
              size="large"
            />
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

