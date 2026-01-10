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
  Slider,
} from "@/components/mortgage-components";
import { useMortgage } from "@/lib/mortgage-context";
import {
  calculateOverpaymentImpact,
  formatCurrency,
  monthsToYearsMonths,
  MortgageScenario,
} from "@/lib/mortgage-calculator";
import { ComparisonChart } from "@/components/chart-component";

/**
 * Overpayment Impact Screen
 * 
 * Shows how extra monthly payments reduce tenure and interest
 * with real-time slider adjustment.
 */
export default function OverpaymentScreen() {
  const { addScenario, state, getCurrentScenario } = useMortgage();
  const currentScenario = getCurrentScenario();

  // Form state
  const [loanAmount, setLoanAmount] = useState(
    currentScenario?.loanAmount.toString() || "300000"
  );
  const [annualRate, setAnnualRate] = useState(
    currentScenario?.annualRate.toString() || "5"
  );
  const [tenureYears, setTenureYears] = useState(
    (currentScenario?.tenureMonths || 360) / 12
  );
  const [monthlyOverpayment, setMonthlyOverpayment] = useState(500);
  const [scenarioName, setScenarioName] = useState("Overpayment Scenario");

  // Results state
  const [results, setResults] = useState<any>(null);
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

    const years = parseFloat(tenureYears.toString());
    if (isNaN(years) || years <= 0 || years > 50) {
      newErrors.tenureYears = "Enter a valid tenure (1-50 years)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [loanAmount, annualRate, tenureYears]);

  // Calculate results whenever inputs change
  useMemo(() => {
    if (!validateInputs()) {
      setResults(null);
      return;
    }

    try {
      const loan = parseFloat(loanAmount);
      const rate = parseFloat(annualRate);
      const years = parseFloat(tenureYears.toString());
      const tenureMonths = years * 12;

      const result = calculateOverpaymentImpact(
        loan,
        rate,
        tenureMonths,
        monthlyOverpayment
      );

      setResults(result);
    } catch (error) {
      setResults(null);
    }
  }, [loanAmount, annualRate, tenureYears, monthlyOverpayment, validateInputs]);

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
        tenureMonths: results.newTenureMonths,
        monthlyEMI: results.schedule[0]?.payment || 0,
        totalInterest: results.newTotalInterest,
        totalAmount: parseFloat(loanAmount) + results.newTotalInterest,
        monthlyOverpayment,
        createdAt: new Date(),
      };

      addScenario(scenario);
      Alert.alert("Success", `Scenario "${scenarioName}" saved!`);

      // Reset form
      setScenarioName("Overpayment Scenario");
      setMonthlyOverpayment(500);
    } catch (error) {
      Alert.alert("Error", "Failed to save scenario.");
    }
  }, [results, scenarioName, loanAmount, annualRate, monthlyOverpayment, addScenario]);

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
          label: "With Overpayment",
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
          title="Overpayment Impact"
          subtitle="See how extra payments accelerate your payoff"
        />

        {/* Info Box */}
        <InfoBox
          type="info"
          title="How it works"
          message="Adjust the monthly overpayment amount using the slider to see how it reduces your loan tenure and total interest paid."
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
            value={tenureYears.toString()}
            onChangeText={(val) => setTenureYears(parseFloat(val) || 0)}
            placeholder="30"
            keyboardType="decimal-pad"
            suffix="years"
            error={errors.tenureYears}
          />
        </View>

        {/* Slider Section */}
        {results && (
          <View className="mb-6">
            <SectionHeader title="Overpayment Amount" />

            <Slider
              label="Monthly Extra Payment"
              value={monthlyOverpayment}
              onValueChange={setMonthlyOverpayment}
              min={0}
              max={Math.round(parseFloat(loanAmount) / 120)}
              step={100}
              suffix={state.currency}
            />
          </View>
        )}

        {/* Results Section */}
        {results && (
          <View className="mb-6">
            <SectionHeader title="Impact Analysis" />

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
                {
                  label: "Savings Percentage",
                  value: `${results.interestSavedPercentage.toFixed(1)}%`,
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
              placeholder="Overpayment Scenario"
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

