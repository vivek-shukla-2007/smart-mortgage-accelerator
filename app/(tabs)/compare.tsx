import React, { useMemo } from "react";
import { ScrollView, View, Text, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { ComparisonBannerAd } from "@/components/admob-banner";
import {
  Button,
  SectionHeader,
  InfoBox,
} from "@/components/mortgage-components";
import { useMortgage } from "@/lib/mortgage-context";
import {
  formatCurrency,
  monthsToYearsMonths,
} from "@/lib/mortgage-calculator";
import { ComparisonChart } from "@/components/chart-component";

/**
 * Scenario Comparison Screen
 * 
 * Compare multiple saved mortgage scenarios side-by-side
 */
export default function CompareScreen() {
  const { state, deleteScenario } = useMortgage();

  const scenarios = state.scenarios;

  // Prepare comparison data
  const comparisonData = useMemo(() => {
    return scenarios.map((scenario) => {
      const { years, months } = monthsToYearsMonths(scenario.tenureMonths);
      return {
        ...scenario,
        tenureDisplay: `${years}y ${months}m`,
      };
    });
  }, [scenarios]);

  // Chart data for EMI comparison
  const emiChartData = useMemo(() => {
    return scenarios.map((scenario, index) => ({
      label: scenario.name,
      value: Math.round(scenario.monthlyEMI),
      color: ["#1E3A8A", "#0D9488", "#F59E0B", "#EF4444"][index % 4],
    }));
  }, [scenarios]);

  // Chart data for total interest comparison
  const interestChartData = useMemo(() => {
    return scenarios.map((scenario, index) => ({
      label: scenario.name,
      value: Math.round(scenario.totalInterest),
      color: ["#1E3A8A", "#0D9488", "#F59E0B", "#EF4444"][index % 4],
    }));
  }, [scenarios]);

  const renderScenarioRow = ({ item, index }: { item: any; index: number }) => {
    return (
      <View className="bg-surface rounded-lg p-4 border border-border mb-3">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-lg font-bold text-foreground">{item.name}</Text>
            <Text className="text-xs text-muted mt-1">
              Created: {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <Button
            title="Delete"
            onPress={() => deleteScenario(item.id)}
            variant="outline"
            size="small"
          />
        </View>

        {/* Scenario Details */}
        <View className="space-y-2">
          <View className="flex-row justify-between">
            <Text className="text-sm text-muted">Loan Amount:</Text>
            <Text className="text-sm font-semibold text-foreground">
              {state.currency} {formatCurrency(item.loanAmount)}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-muted">Interest Rate:</Text>
            <Text className="text-sm font-semibold text-foreground">
              {item.annualRate}%
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-muted">Tenure:</Text>
            <Text className="text-sm font-semibold text-foreground">
              {item.tenureDisplay}
            </Text>
          </View>
          <View className="flex-row justify-between border-t border-border pt-2 mt-2">
            <Text className="text-sm text-muted">Monthly EMI:</Text>
            <Text className="text-sm font-bold text-primary">
              {state.currency} {formatCurrency(item.monthlyEMI)}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-muted">Total Interest:</Text>
            <Text className="text-sm font-bold text-warning">
              {state.currency} {formatCurrency(item.totalInterest)}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-muted">Total Amount:</Text>
            <Text className="text-sm font-bold text-foreground">
              {state.currency} {formatCurrency(item.totalAmount)}
            </Text>
          </View>

          {/* Overpayment Info */}
          {item.monthlyOverpayment && (
            <View className="flex-row justify-between border-t border-border pt-2 mt-2">
              <Text className="text-sm text-muted">Monthly Overpayment:</Text>
              <Text className="text-sm font-semibold text-success">
                {state.currency} {formatCurrency(item.monthlyOverpayment)}
              </Text>
            </View>
          )}

          {/* Lump Sum Info */}
          {item.lumpSumPayment && (
            <View className="flex-row justify-between border-t border-border pt-2 mt-2">
              <Text className="text-sm text-muted">Lump Sum Payment:</Text>
              <Text className="text-sm font-semibold text-success">
                {state.currency} {formatCurrency(item.lumpSumPayment)}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}>
        {/* Header */}
        <SectionHeader
          title="Compare Scenarios"
          subtitle={`${scenarios.length} scenario${scenarios.length !== 1 ? "s" : ""} saved`}
        />

        {/* Info Box */}
        <InfoBox
          type="info"
          title="How it works"
          message="View all your saved mortgage scenarios side-by-side and compare their key metrics."
        />

        {/* Empty State */}
        {scenarios.length === 0 && (
          <View className="mt-6 p-6 bg-surface rounded-lg border border-border">
            <Text className="text-center text-muted mb-4">
              No scenarios saved yet. Create a scenario to get started!
            </Text>
          </View>
        )}

        {/* Charts */}
        {scenarios.length > 0 && (
          <>
            {emiChartData.length > 0 && (
              <ComparisonChart
                data={emiChartData}
                title="Monthly EMI Comparison"
              />
            )}

            {interestChartData.length > 0 && (
              <ComparisonChart
                data={interestChartData}
                title="Total Interest Comparison"
              />
            )}
          </>
        )}

        {/* Scenario List */}
        {scenarios.length > 0 && (
          <View className="mt-6">
            <SectionHeader title="All Scenarios" />
            <FlatList
              data={comparisonData}
              renderItem={renderScenarioRow}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Summary Table */}
        {scenarios.length > 0 && (
          <View className="mt-6 bg-surface rounded-lg border border-border overflow-hidden">
            {/* Header Row */}
            <View className="flex-row px-3 py-3 bg-primary">
              <Text className="flex-1 text-xs font-bold text-white">Scenario</Text>
              <Text className="flex-1 text-xs font-bold text-white text-right">EMI</Text>
              <Text className="flex-1 text-xs font-bold text-white text-right">Interest</Text>
              <Text className="flex-1 text-xs font-bold text-white text-right">Tenure</Text>
            </View>

            {/* Data Rows */}
            {comparisonData.map((scenario, index) => (
              <View
                key={scenario.id}
                className={`flex-row px-3 py-2 border-b border-border ${
                  index % 2 === 0 ? "bg-surface" : "bg-background"
                }`}
              >
                <Text className="flex-1 text-xs text-foreground font-medium truncate">
                  {scenario.name}
                </Text>
                <Text className="flex-1 text-xs text-primary text-right">
                  {formatCurrency(scenario.monthlyEMI)}
                </Text>
                <Text className="flex-1 text-xs text-warning text-right">
                  {formatCurrency(scenario.totalInterest)}
                </Text>
                <Text className="flex-1 text-xs text-foreground text-right">
                  {scenario.tenureDisplay}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      <ComparisonBannerAd />
    </ScreenContainer>
  );
}

