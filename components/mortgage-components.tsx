import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

/**
 * Reusable Input Field Component
 */
interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "decimal-pad";
  suffix?: string;
  error?: string;
}

export function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  suffix,
  error,
}: InputFieldProps) {
  const colors = useColors();

  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-foreground mb-2">{label}</Text>
      <View className="flex-row items-center bg-surface rounded-lg border border-border px-3 py-3">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder || label}
          placeholderTextColor={colors.muted}
          keyboardType={keyboardType}
          className="flex-1 text-base text-foreground"
          style={{ color: colors.foreground }}
        />
        {suffix && (
          <Text className="text-base text-muted ml-2">{suffix}</Text>
        )}
      </View>
      {error && <Text className="text-xs text-error mt-1">{error}</Text>}
    </View>
  );
}

/**
 * Metric Card Component
 */
interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  highlight?: boolean;
  icon?: React.ReactNode;
}

export function MetricCard({
  label,
  value,
  unit,
  highlight = false,
  icon,
}: MetricCardProps) {
  return (
    <View
      className={cn(
        "rounded-lg p-4 mb-3",
        highlight ? "bg-primary" : "bg-surface border border-border"
      )}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text
            className={cn(
              "text-xs font-medium mb-1",
              highlight ? "text-white opacity-80" : "text-muted"
            )}
          >
            {label}
          </Text>
          <View className="flex-row items-baseline">
            <Text
              className={cn(
                "text-2xl font-bold",
                highlight ? "text-white" : "text-foreground"
              )}
            >
              {value}
            </Text>
            {unit && (
              <Text
                className={cn(
                  "text-sm ml-1",
                  highlight ? "text-white opacity-80" : "text-muted"
                )}
              >
                {unit}
              </Text>
            )}
          </View>
        </View>
        {icon && <View className="ml-4">{icon}</View>}
      </View>
    </View>
  );
}

/**
 * Result Summary Component
 */
interface ResultSummaryProps {
  title: string;
  results: Array<{
    label: string;
    value: string;
    highlight?: boolean;
  }>;
}

export function ResultSummary({ title, results }: ResultSummaryProps) {
  return (
    <View className="bg-surface rounded-lg p-4 border border-border mb-4">
      <Text className="text-lg font-bold text-foreground mb-4">{title}</Text>
      {results.map((result, index) => (
        <View key={index} className="flex-row justify-between items-center mb-3">
          <Text className="text-sm text-muted">{result.label}</Text>
          <Text
            className={cn(
              "text-base font-semibold",
              result.highlight ? "text-success" : "text-foreground"
            )}
          >
            {result.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

/**
 * Primary Button Component
 */
interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
}

export function Button({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = "primary",
  size = "medium",
}: ButtonProps) {
  const colors = useColors();

  const getButtonStyle = () => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    };

    switch (size) {
      case "small":
        return { ...baseStyle, paddingVertical: 8, paddingHorizontal: 16 };
      case "large":
        return { ...baseStyle, paddingVertical: 16, paddingHorizontal: 24 };
      default:
        return { ...baseStyle, paddingVertical: 12, paddingHorizontal: 20 };
    }
  };

  const getBackgroundColor = () => {
    if (disabled) return colors.border;
    switch (variant) {
      case "secondary":
        return colors.surface;
      case "outline":
        return "transparent";
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.muted;
    switch (variant) {
      case "secondary":
        return colors.foreground;
      case "outline":
        return colors.primary;
      default:
        return "white";
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        getButtonStyle(),
        {
          backgroundColor: getBackgroundColor(),
          borderWidth: variant === "outline" ? 1.5 : 0,
          borderColor: variant === "outline" ? colors.primary : "transparent",
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <Text
        style={{
          color: getTextColor(),
          fontSize: size === "small" ? 14 : size === "large" ? 16 : 15,
          fontWeight: "600",
        }}
      >
        {loading ? "Loading..." : title}
      </Text>
    </TouchableOpacity>
  );
}

/**
 * Slider Component (using View for now, can be replaced with react-native-slider)
 */
interface SliderProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
}

export function Slider({
  label,
  value,
  onValueChange,
  min,
  max,
  step = 1,
  suffix,
}: SliderProps) {
  const colors = useColors();

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-sm font-semibold text-foreground">{label}</Text>
        <Text className="text-sm font-bold text-primary">
          {value.toFixed(0)} {suffix}
        </Text>
      </View>

      <View className="h-8 bg-surface rounded-lg border border-border justify-center px-2">
        <View
          className="h-1 bg-primary rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </View>

      <View className="flex-row justify-between mt-2">
        <TouchableOpacity
          onPress={() => onValueChange(Math.max(min, value - step * 10))}
          className="px-3 py-2 bg-surface rounded border border-border"
        >
          <Text className="text-sm font-semibold text-foreground">−</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onValueChange(Math.min(max, value + step * 10))}
          className="px-3 py-2 bg-surface rounded border border-border"
        >
          <Text className="text-sm font-semibold text-foreground">+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/**
 * Card Component
 */
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <View className={cn("bg-surface rounded-lg p-4 border border-border", className)}>
      {children}
    </View>
  );
}

/**
 * Section Header Component
 */
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <View className="mb-4">
      <Text className="text-xl font-bold text-foreground">{title}</Text>
      {subtitle && <Text className="text-sm text-muted mt-1">{subtitle}</Text>}
    </View>
  );
}

/**
 * Info Box Component
 */
interface InfoBoxProps {
  type: "info" | "warning" | "success" | "error";
  title: string;
  message: string;
}

export function InfoBox({ type, title, message }: InfoBoxProps) {
  const colors = useColors();

  const getBackgroundColor = () => {
    switch (type) {
      case "warning":
        return "#FEF3C7";
      case "success":
        return "#D1FAE5";
      case "error":
        return "#FEE2E2";
      default:
        return "#DBEAFE";
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "warning":
        return "#92400E";
      case "success":
        return "#065F46";
      case "error":
        return "#7F1D1D";
      default:
        return "#1E40AF";
    }
  };

  return (
    <View
      className="rounded-lg p-3 mb-4"
      style={{ backgroundColor: getBackgroundColor() }}
    >
      <Text style={{ color: getTextColor(), fontWeight: "600", fontSize: 14 }}>
        {title}
      </Text>
      <Text style={{ color: getTextColor(), fontSize: 13, marginTop: 4 }}>
        {message}
      </Text>
    </View>
  );
}

