import React from "react";
import { View, Text, Dimensions } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { ChartDataPoint } from "@/lib/chart-utils";

/**
 * Simple Bar Chart Component
 */
interface BarChartProps {
  data: ChartDataPoint[];
  title: string;
  yAxisLabel: string;
  color?: string;
  height?: number;
}

export function BarChart({
  data,
  title,
  yAxisLabel,
  color = "#1E3A8A",
  height = 250,
}: BarChartProps) {
  const colors = useColors();
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - 32; // Account for padding
  const barWidth = Math.max(20, chartWidth / (data.length || 1) * 0.7);
  const spacing = chartWidth / (data.length || 1);

  if (data.length === 0) {
    return (
      <View className="bg-surface rounded-lg p-4 border border-border" style={{ height }}>
        <Text className="text-center text-muted">No data available</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.y), 1);
  const minValue = Math.min(...data.map((d) => d.y), 0);
  const range = maxValue - minValue || 1;

  return (
    <View className="bg-surface rounded-lg p-4 border border-border mb-4">
      <Text className="text-lg font-bold text-foreground mb-4">{title}</Text>

      <View style={{ height, position: "relative" }}>
        {/* Y-axis labels */}
        <View style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 40 }}>
          <Text className="text-xs text-muted text-right pr-2" style={{ height: "25%" }}>
            {Math.round(maxValue)}
          </Text>
          <Text className="text-xs text-muted text-right pr-2" style={{ height: "25%" }}>
            {Math.round((maxValue + minValue) / 2)}
          </Text>
          <Text className="text-xs text-muted text-right pr-2" style={{ height: "25%" }}>
            {Math.round(minValue)}
          </Text>
        </View>

        {/* Chart area */}
        <View
          style={{
            marginLeft: 40,
            height: "100%",
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-around",
            borderLeftWidth: 1,
            borderBottomWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 8,
          }}
        >
          {data.map((point, index) => {
            const normalizedValue = (point.y - minValue) / range;
            const barHeight = Math.max(2, normalizedValue * height * 0.85);

            return (
              <View
                key={index}
                style={{
                  width: barWidth,
                  height: barHeight,
                  backgroundColor: color,
                  borderRadius: 4,
                  opacity: 0.8,
                }}
              />
            );
          })}
        </View>
      </View>

      <Text className="text-xs text-muted text-center mt-3">{yAxisLabel}</Text>
    </View>
  );
}

/**
 * Simple Line Chart Component
 */
interface LineChartProps {
  data: ChartDataPoint[];
  title: string;
  yAxisLabel: string;
  color?: string;
  height?: number;
}

export function LineChart({
  data,
  title,
  yAxisLabel,
  color = "#0D9488",
  height = 250,
}: LineChartProps) {
  const colors = useColors();
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - 32;

  if (data.length === 0) {
    return (
      <View className="bg-surface rounded-lg p-4 border border-border" style={{ height }}>
        <Text className="text-center text-muted">No data available</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.y), 1);
  const minValue = Math.min(...data.map((d) => d.y), 0);
  const range = maxValue - minValue || 1;

  // Generate SVG path
  let pathData = "";
  data.forEach((point, index) => {
    const x = (index / (data.length - 1 || 1)) * chartWidth;
    const normalizedY = (point.y - minValue) / range;
    const y = height * 0.85 - normalizedY * height * 0.85;

    if (index === 0) {
      pathData += `M ${x} ${y}`;
    } else {
      pathData += ` L ${x} ${y}`;
    }
  });

  return (
    <View className="bg-surface rounded-lg p-4 border border-border mb-4">
      <Text className="text-lg font-bold text-foreground mb-4">{title}</Text>

      <View style={{ height, position: "relative", marginLeft: 40 }}>
        {/* Y-axis labels */}
        <View style={{ position: "absolute", left: -40, top: 0, bottom: 0, width: 40 }}>
          <Text className="text-xs text-muted text-right pr-2" style={{ height: "25%" }}>
            {Math.round(maxValue)}
          </Text>
          <Text className="text-xs text-muted text-right pr-2" style={{ height: "25%" }}>
            {Math.round((maxValue + minValue) / 2)}
          </Text>
          <Text className="text-xs text-muted text-right pr-2" style={{ height: "25%" }}>
            {Math.round(minValue)}
          </Text>
        </View>

        {/* Simplified line representation using bars */}
        <View
          style={{
            height: "100%",
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-around",
            borderLeftWidth: 1,
            borderBottomWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 8,
          }}
        >
          {data.map((point, index) => {
            const normalizedValue = (point.y - minValue) / range;
            const barHeight = Math.max(1, normalizedValue * height * 0.85);

            return (
              <View
                key={index}
                style={{
                  width: 2,
                  height: barHeight,
                  backgroundColor: color,
                  borderRadius: 1,
                }}
              />
            );
          })}
        </View>
      </View>

      <Text className="text-xs text-muted text-center mt-3">{yAxisLabel}</Text>
    </View>
  );
}

/**
 * Pie Chart Component (simplified)
 */
interface PieSlice {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieSlice[];
  title: string;
  size?: number;
}

export function PieChart({ data, title, size = 200 }: PieChartProps) {
  const total = data.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <View className="bg-surface rounded-lg p-4 border border-border mb-4">
      <Text className="text-lg font-bold text-foreground mb-4">{title}</Text>

      <View className="flex-row justify-between items-center">
        {/* Pie representation using stacked bars */}
        <View
          style={{
            width: size,
            height: size / 4,
            flexDirection: "row",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          {data.map((slice, index) => (
            <View
              key={index}
              style={{
                flex: slice.value / total,
                backgroundColor: slice.color,
              }}
            />
          ))}
        </View>

        {/* Legend */}
        <View className="flex-1 ml-4">
          {data.map((slice, index) => (
            <View key={index} className="flex-row items-center mb-2">
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 2,
                  backgroundColor: slice.color,
                  marginRight: 8,
                }}
              />
              <Text className="text-sm text-foreground flex-1">{slice.label}</Text>
              <Text className="text-sm font-semibold text-foreground">{slice.value}%</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

/**
 * Comparison Chart Component
 */
interface ComparisonItem {
  label: string;
  value: number;
  color?: string;
}

interface ComparisonChartProps {
  data: ComparisonItem[];
  title: string;
  height?: number;
}

export function ComparisonChart({
  data,
  title,
  height = 200,
}: ComparisonChartProps) {
  const colors = useColors();

  if (data.length === 0) {
    return (
      <View className="bg-surface rounded-lg p-4 border border-border" style={{ height }}>
        <Text className="text-center text-muted">No data available</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <View className="bg-surface rounded-lg p-4 border border-border mb-4">
      <Text className="text-lg font-bold text-foreground mb-4">{title}</Text>

      {data.map((item, index) => {
        const percentage = (item.value / maxValue) * 100;
        const itemColor = item.color || "#1E3A8A";

        return (
          <View key={index} className="mb-4">
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm font-medium text-foreground">{item.label}</Text>
              <Text className="text-sm font-semibold text-foreground">
                {item.value.toLocaleString()}
              </Text>
            </View>
            <View
              className="h-2 bg-border rounded-full overflow-hidden"
              style={{ backgroundColor: colors.border }}
            >
              <View
                style={{
                  height: "100%",
                  width: `${percentage}%`,
                  backgroundColor: itemColor,
                  borderRadius: 4,
                }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

