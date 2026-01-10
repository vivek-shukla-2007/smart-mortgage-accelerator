import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { MetricCard, Button, SectionHeader, Card } from "@/components/mortgage-components";
import { useMortgage } from "@/lib/mortgage-context";
import { monthsToYearsMonths, formatCurrency } from "@/lib/mortgage-calculator";

/**
 * Home Screen - Dashboard
 * 
 * Shows a summary of the current mortgage scenario and quick action buttons
 * to navigate to different calculators.
 */
export default function HomeScreen() {
  const router = useRouter();
  const { state, getCurrentScenario } = useMortgage();
  const currentScenario = getCurrentScenario();

  const { years, months } = currentScenario
    ? monthsToYearsMonths(currentScenario.tenureMonths)
    : { years: 0, months: 0 };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground">
            Smart Mortgage
          </Text>
          <Text className="text-base text-muted mt-1">
            Optimize your mortgage strategy
          </Text>
        </View>

        {/* Current Scenario Summary */}
        {currentScenario ? (
          <>
            <SectionHeader title="Current Scenario" subtitle={currentScenario.name} />

            <MetricCard
              label="Monthly EMI"
              value={formatCurrency(currentScenario.monthlyEMI)}
              unit={state.currency}
              highlight
            />

            <View className="grid gap-3 mb-4">
              <MetricCard
                label="Remaining Tenure"
                value={`${years}y ${months}m`}
              />
              <MetricCard
                label="Total Interest"
                value={formatCurrency(currentScenario.totalInterest)}
                unit={state.currency}
              />
              <MetricCard
                label="Total Loan Amount"
                value={formatCurrency(currentScenario.loanAmount)}
                unit={state.currency}
              />
            </View>
          </>
        ) : (
          <Card className="mb-6">
            <Text className="text-base text-muted text-center">
              No mortgage scenario created yet. Start by creating a new scenario!
            </Text>
          </Card>
        )}

        {/* Quick Actions */}
        <SectionHeader title="Quick Actions" />

        <View className="gap-3 mb-6">
          <Button
            title="Basic Calculator"
            onPress={() => router.push("/calculator")}
            variant="primary"
            size="large"
          />
          <Button
            title="Overpayment Impact"
            onPress={() => router.push("/overpayment")}
            variant="secondary"
            size="large"
          />
          <Button
            title="Advanced Calculator"
            onPress={() => router.push("/advanced")}
            variant="secondary"
            size="large"
          />
          <Button
            title="Part Payment Calculator"
            onPress={() => router.push("/part-payment")}
            variant="secondary"
            size="large"
          />
          <Button
            title="Amortization Schedule"
            onPress={() => router.push("/schedule")}
            variant="secondary"
            size="large"
          />
          <Button
            title="Compare Scenarios"
            onPress={() => router.push("/compare")}
            variant="secondary"
            size="large"
          />
        </View>

        {/* Settings */}
        <View className="gap-2">
          <Button
            title="Settings"
            onPress={() => router.push("/settings")}
            variant="outline"
            size="medium"
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

