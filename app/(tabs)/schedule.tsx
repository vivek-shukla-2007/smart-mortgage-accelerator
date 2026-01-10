import React, { useState, useCallback } from "react";
import { ScrollView, View, Text, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { CalculatorBannerAd } from "@/components/admob-banner";
import {
  InputField,
  Button,
  SectionHeader,
  InfoBox,
} from "@/components/mortgage-components";
import { useMortgage } from "@/lib/mortgage-context";
import {
  generateAmortizationSchedule,
  formatCurrency,
  PaymentRecord,
} from "@/lib/mortgage-calculator";

/**
 * Amortization Schedule Screen
 * 
 * Shows detailed month-by-month or year-by-year breakdown of payments
 */
export default function ScheduleScreen() {
  const { state, getCurrentScenario } = useMortgage();
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
  const [viewMode, setViewMode] = useState<"monthly" | "yearly">("yearly");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Results state
  const [schedule, setSchedule] = useState<PaymentRecord[]>([]);

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

  const handleGenerateSchedule = useCallback(() => {
    if (!validateInputs()) {
      return;
    }

    try {
      const loan = parseFloat(loanAmount);
      const rate = parseFloat(annualRate);
      const years = parseFloat(tenureYears.toString());
      const tenureMonths = years * 12;

      const fullSchedule = generateAmortizationSchedule(loan, rate, tenureMonths);

      // Filter based on view mode
      if (viewMode === "yearly") {
        const yearlySchedule = fullSchedule.filter((record) => record.month === 12 || record === fullSchedule[fullSchedule.length - 1]);
        setSchedule(yearlySchedule);
      } else {
        setSchedule(fullSchedule);
      }
    } catch (error) {
      setSchedule([]);
    }
  }, [loanAmount, annualRate, tenureYears, viewMode, validateInputs]);

  const renderScheduleRow = ({ item, index }: { item: PaymentRecord; index: number }) => {
    const isLastRow = index === schedule.length - 1;
    const monthLabel = viewMode === "yearly" 
      ? `Year ${item.year + 1}` 
      : `Month ${item.month}`;

    return (
      <View
        className={`flex-row px-3 py-2 border-b border-border ${
          isLastRow ? "bg-success/10" : index % 2 === 0 ? "bg-surface" : "bg-background"
        }`}
      >
        <Text className="flex-1 text-xs text-foreground font-medium">{monthLabel}</Text>
        <Text className="flex-1 text-xs text-foreground text-right">
          {formatCurrency(item.payment)}
        </Text>
        <Text className="flex-1 text-xs text-primary text-right">
          {formatCurrency(item.principal)}
        </Text>
        <Text className="flex-1 text-xs text-warning text-right">
          {formatCurrency(item.interest)}
        </Text>
        <Text className="flex-1 text-xs text-foreground text-right">
          {formatCurrency(item.balance)}
        </Text>
      </View>
    );
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}>
        {/* Header */}
        <SectionHeader
          title="Amortization Schedule"
          subtitle="Detailed payment breakdown over time"
        />

        {/* Info Box */}
        <InfoBox
          type="info"
          title="How it works"
          message="View your complete payment schedule showing principal, interest, and remaining balance for each period."
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

        {/* View Mode Toggle */}
        <View className="flex-row gap-2 mb-6">
          <Button
            title={`Monthly View (${schedule.length})`}
            onPress={() => setViewMode("monthly")}
            variant={viewMode === "monthly" ? "primary" : "secondary"}
            size="small"
          />
          <Button
            title={`Yearly View (${schedule.length})`}
            onPress={() => setViewMode("yearly")}
            variant={viewMode === "yearly" ? "primary" : "secondary"}
            size="small"
          />
        </View>

        {/* Generate Button */}
        <Button
          title="Generate Schedule"
          onPress={handleGenerateSchedule}
          variant="primary"
          size="large"
        />

        {/* Schedule Table */}
        {schedule.length > 0 && (
          <View className="mt-6 bg-surface rounded-lg border border-border overflow-hidden">
            {/* Header Row */}
            <View className="flex-row px-3 py-3 bg-primary">
              <Text className="flex-1 text-xs font-bold text-white">Period</Text>
              <Text className="flex-1 text-xs font-bold text-white text-right">Payment</Text>
              <Text className="flex-1 text-xs font-bold text-white text-right">Principal</Text>
              <Text className="flex-1 text-xs font-bold text-white text-right">Interest</Text>
              <Text className="flex-1 text-xs font-bold text-white text-right">Balance</Text>
            </View>

            {/* Data Rows */}
            <FlatList
              data={schedule}
              renderItem={renderScheduleRow}
              keyExtractor={(item, index) => `${item.month}-${item.year}-${index}`}
              scrollEnabled={false}
            />

            {/* Summary Footer */}
            <View className="flex-row px-3 py-3 bg-primary/10 border-t border-border">
              <Text className="flex-1 text-xs font-bold text-foreground">Total</Text>
              <Text className="flex-1 text-xs font-bold text-foreground text-right">
                {formatCurrency(
                  schedule.reduce((sum, record) => sum + record.payment, 0)
                )}
              </Text>
              <Text className="flex-1 text-xs font-bold text-primary text-right">
                {formatCurrency(
                  schedule.reduce((sum, record) => sum + record.principal, 0)
                )}
              </Text>
              <Text className="flex-1 text-xs font-bold text-warning text-right">
                {formatCurrency(
                  schedule.reduce((sum, record) => sum + record.interest, 0)
                )}
              </Text>
              <Text className="flex-1 text-xs font-bold text-foreground text-right">
                {formatCurrency(schedule[schedule.length - 1]?.balance || 0)}
              </Text>
            </View>
          </View>
        )}

        {/* Empty State */}
        {schedule.length === 0 && (
          <View className="mt-6 p-6 bg-surface rounded-lg border border-border">
            <Text className="text-center text-muted">
              Generate a schedule to see the detailed payment breakdown
            </Text>
          </View>
        )}
      </ScrollView>
      <CalculatorBannerAd />
    </ScreenContainer>
  );
}

