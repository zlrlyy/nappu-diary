import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Svg, { Rect, Text as SvgText, Line, G } from "react-native-svg";

const screenWidth = Dimensions.get("window").width;

interface BarChartProps {
  data: { label: string; value: number }[];
  width?: number;
  height?: number;
  barColor: string;
  textColor?: string;
  axisColor?: string;
}

export function BarChart({
  data,
  width = screenWidth - 64,
  height = 200,
  barColor,
  textColor = "#333",
  axisColor = "#ccc",
}: BarChartProps) {
  const padding = { top: 25, bottom: 35, left: 30, right: 10 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate Y-axis
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const yMax = maxValue <= 5 ? 5 : Math.ceil(maxValue / 5) * 5;
  const step = yMax <= 5 ? 1 : 5;

  // Generate Y-axis tick values
  const yTicks: number[] = [];
  for (let i = 0; i <= yMax; i += step) {
    yTicks.push(i);
  }

  // Calculate bar dimensions - adjust for data density
  const barCount = data.length;
  const isDense = barCount > 10; // Monthly view has more bars
  const totalBarSpace = isDense ? chartWidth * 0.9 : chartWidth * 0.85;
  const totalGapSpace = isDense ? chartWidth * 0.1 : chartWidth * 0.15;
  const barWidth = totalBarSpace / barCount;
  const barGap = totalGapSpace / barCount;

  // Scale function
  const scaleY = (value: number) => {
    return chartHeight - (value / yMax) * chartHeight;
  };

  // Determine label frequency based on density
  const labelInterval = isDense ? Math.ceil(barCount / 7) : 1;

  return (
    <Svg width={width} height={height}>
      {/* Y-axis */}
      <Line
        x1={padding.left}
        y1={padding.top}
        x2={padding.left}
        y2={height - padding.bottom}
        stroke={axisColor}
        strokeWidth={1}
      />

      {/* X-axis */}
      <Line
        x1={padding.left}
        y1={height - padding.bottom}
        x2={width - padding.right}
        y2={height - padding.bottom}
        stroke={axisColor}
        strokeWidth={1}
      />

      {/* Y-axis labels and grid lines */}
      {yTicks.map((tick) => {
        const y = padding.top + scaleY(tick);
        return (
          <G key={tick}>
            <SvgText
              x={padding.left - 8}
              y={y + 4}
              fontSize={11}
              fill={textColor}
              textAnchor="end"
            >
              {tick}
            </SvgText>
            {tick > 0 && (
              <Line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke={axisColor}
                strokeWidth={0.5}
                strokeDasharray="3,3"
                opacity={0.5}
              />
            )}
          </G>
        );
      })}

      {/* Bars */}
      {data.map((item, index) => {
        if (item.value === 0) return null;

        const x = padding.left + index * (barWidth + barGap) + barGap / 2;
        const barHeight = (item.value / yMax) * chartHeight;
        const y = height - padding.bottom - barHeight;

        return (
          <G key={index}>
            <Rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={barColor}
              rx={isDense ? 2 : 4}
              ry={isDense ? 2 : 4}
            />
            {/* Value label on top of bar */}
            <SvgText
              x={x + barWidth / 2}
              y={y - 5}
              fontSize={isDense ? 9 : 11}
              fill={barColor}
              fontWeight="600"
              textAnchor="middle"
            >
              {item.value}
            </SvgText>
          </G>
        );
      })}

      {/* X-axis labels */}
      {data.map((item, index) => {
        // Skip some labels in dense view
        if (isDense && index % labelInterval !== 0) return null;

        const x = padding.left + index * (barWidth + barGap) + barGap / 2 + barWidth / 2;
        return (
          <SvgText
            key={index}
            x={x}
            y={height - padding.bottom + 18}
            fontSize={isDense ? 9 : 11}
            fill={textColor}
            textAnchor="middle"
          >
            {item.label}
          </SvgText>
        );
      })}
    </Svg>
  );
}

const styles = StyleSheet.create({});
