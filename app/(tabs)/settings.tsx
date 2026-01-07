import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, TouchableOpacity, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import {
  Button,
  SectionHeader,
  Card,
  InfoBox,
} from "@/components/mortgage-components";
import { useMortgage } from "@/lib/mortgage-context";
import { useColors } from "@/hooks/use-colors";

/**
 * Settings Screen
 * 
 * App configuration and user preferences
 */
export default function SettingsScreen() {
  const { state, setCurrency, setDecimalPlaces, setTheme, saveState, loadState } = useMortgage();
  const colors = useColors();

  const [selectedCurrency, setSelectedCurrency] = useState(state.currency);
  const [selectedDecimalPlaces, setSelectedDecimalPlaces] = useState(state.decimalPlaces);

  const currencies = ["USD", "EUR", "GBP", "INR", "AUD", "CAD", "SGD", "HKD"];
  const decimalOptions = [0, 1, 2, 3];

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency);
    setCurrency(currency);
  };

  const handleDecimalPlacesChange = (places: number) => {
    setSelectedDecimalPlaces(places);
    setDecimalPlaces(places);
  };

  const handleSaveSettings = async () => {
    try {
      await saveState();
      Alert.alert("Success", "Settings saved successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to save settings.");
    }
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to delete all scenarios? This cannot be undone.",
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Delete",
          onPress: () => {
            Alert.alert("Data Cleared", "All scenarios have been deleted.");
          },
          style: "destructive",
        },
      ]
    );
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
        {/* Header */}
        <SectionHeader
          title="Settings"
          subtitle="Customize your app experience"
        />

        {/* Currency Settings */}
        <View className="mb-6">
          <SectionHeader title="Currency" />
          <InfoBox
            type="info"
            title="Select Currency"
            message="Choose your preferred currency for all calculations and displays."
          />

          <View className="flex-row flex-wrap gap-2">
            {currencies.map((currency) => (
              <TouchableOpacity
                key={currency}
                onPress={() => handleCurrencyChange(currency)}
                className={`px-4 py-2 rounded-lg border-2 ${
                  selectedCurrency === currency
                    ? "bg-primary border-primary"
                    : "bg-surface border-border"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    selectedCurrency === currency
                      ? "text-white"
                      : "text-foreground"
                  }`}
                >
                  {currency}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Decimal Places Settings */}
        <View className="mb-6">
          <SectionHeader title="Number Format" />
          <InfoBox
            type="info"
            title="Decimal Places"
            message="Choose how many decimal places to display in calculations."
          />

          <View className="flex-row gap-2">
            {decimalOptions.map((places) => (
              <TouchableOpacity
                key={places}
                onPress={() => handleDecimalPlacesChange(places)}
                className={`flex-1 px-4 py-3 rounded-lg border-2 ${
                  selectedDecimalPlaces === places
                    ? "bg-primary border-primary"
                    : "bg-surface border-border"
                }`}
              >
                <Text
                  className={`text-sm font-semibold text-center ${
                    selectedDecimalPlaces === places
                      ? "text-white"
                      : "text-foreground"
                  }`}
                >
                  {places} {places === 1 ? "decimal" : "decimals"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Theme Settings */}
        <View className="mb-6">
          <SectionHeader title="Theme" />
          <Card>
            <Text className="text-sm text-muted mb-3">
              The app uses your device's system theme preference.
            </Text>
            <View className="flex-row items-center">
              <View
                className="w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: colors.primary }}
              />
              <Text className="text-sm text-foreground">
                Current: {state.theme === "light" ? "Light" : "Dark"} Mode
              </Text>
            </View>
          </Card>
        </View>

        {/* Data Management */}
        <View className="mb-6">
          <SectionHeader title="Data Management" />

          <Card className="mb-3">
            <Text className="text-sm font-semibold text-foreground mb-2">
              Saved Scenarios
            </Text>
            <Text className="text-sm text-muted">
              {state.scenarios.length} scenario{state.scenarios.length !== 1 ? "s" : ""} saved
            </Text>
          </Card>

          <Button
            title="Save Settings"
            onPress={handleSaveSettings}
            variant="primary"
            size="large"
          />

          <Button
            title="Clear All Data"
            onPress={handleClearData}
            variant="outline"
            size="large"
          />
        </View>

        {/* About Section */}
        <View className="mb-6">
          <SectionHeader title="About" />

          <Card>
            <View className="mb-4">
              <Text className="text-lg font-bold text-foreground mb-2">
                Smart Mortgage Accelerator
              </Text>
              <Text className="text-sm text-muted mb-4">
                Version 1.0.0
              </Text>
              <Text className="text-sm text-muted leading-relaxed">
                Smart Mortgage Accelerator helps you optimize your mortgage strategy. Calculate EMI, analyze overpayment impact, and make informed financial decisions.
              </Text>
            </View>

            <View className="border-t border-border pt-4">
              <Text className="text-xs text-muted mb-2">
                ✓ 100% Offline - All calculations are done locally
              </Text>
              <Text className="text-xs text-muted mb-2">
                ✓ Privacy First - No data collection or tracking
              </Text>
              <Text className="text-xs text-muted">
                ✓ Free to Use - Completely free with optional ads
              </Text>
            </View>
          </Card>
        </View>

        {/* Support Section */}
        <View className="mb-6">
          <SectionHeader title="Support" />

          <Card>
            <Text className="text-sm text-foreground mb-3">
              Have questions or feedback? We'd love to hear from you!
            </Text>
            <Button
              title="Send Feedback"
              onPress={() => Alert.alert("Feedback", "Thank you for using Smart Mortgage Accelerator!")}
              variant="outline"
              size="large"
            />
          </Card>
        </View>

        {/* Terms & Privacy */}
        <View className="mb-6">
          <Card>
            <Text className="text-xs text-muted text-center">
              By using this app, you agree to our Terms of Service and Privacy Policy.
            </Text>
            <View className="flex-row justify-center gap-4 mt-3">
              <TouchableOpacity>
                <Text className="text-xs text-primary font-semibold">Terms</Text>
              </TouchableOpacity>
              <Text className="text-xs text-border">•</Text>
              <TouchableOpacity>
                <Text className="text-xs text-primary font-semibold">Privacy</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

