import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - Spacing.md * 3;
const CHART_HEIGHT = 300;
const Y_AXIS_WIDTH = 20; // Space for Y-axis labels (reduced)
const X_AXIS_HEIGHT = 35; // Space for X-axis labels (increased for better spacing)
const TOP_PADDING = 10;
const RIGHT_PADDING = 5; // Reduced right padding to use more space
const LEFT_PADDING = -10; // No extra left padding, start from Y-axis
const GRAPH_WIDTH = CHART_WIDTH - Y_AXIS_WIDTH - RIGHT_PADDING;
const GRAPH_HEIGHT = CHART_HEIGHT - X_AXIS_HEIGHT - TOP_PADDING;

const LineChart = ({ repairedData, renewedData, labels, repairedColor, renewedColor }) => {
  const maxValue = Math.max(
    ...repairedData,
    ...renewedData,
    16 // Minimum max value for better scaling
  );

  const scaleY = GRAPH_HEIGHT / maxValue;
  // Calculate stepX to distribute labels evenly across the full width
  const stepX = labels.length > 1 ? GRAPH_WIDTH / (labels.length - 1) : 0;
  const graphStartX = Y_AXIS_WIDTH + LEFT_PADDING;
  const graphStartY = TOP_PADDING;

  // Generate path for repaired line
  const generateRepairedPath = () => {
    let path = '';
    repairedData.forEach((value, index) => {
      const x = graphStartX + index * stepX;
      const y = graphStartY + GRAPH_HEIGHT - value * scaleY;
      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });
    return path;
  };

  // Generate path for renewed line
  const generateRenewedPath = () => {
    let path = '';
    renewedData.forEach((value, index) => {
      const x = graphStartX + index * stepX;
      const y = graphStartY + GRAPH_HEIGHT - value * scaleY;
      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });
    return path;
  };

  // Generate area path for gradient fill
  const generateRepairedAreaPath = () => {
    let path = generateRepairedPath();
    const lastX = graphStartX + (repairedData.length - 1) * stepX;
    const lastY = graphStartY + GRAPH_HEIGHT;
    const firstX = graphStartX;
    const firstY = graphStartY + GRAPH_HEIGHT;
    path += ` L ${lastX} ${lastY} L ${firstX} ${firstY} Z`;
    return path;
  };

  const generateRenewedAreaPath = () => {
    let path = generateRenewedPath();
    const lastX = graphStartX + (renewedData.length - 1) * stepX;
    const lastY = graphStartY + GRAPH_HEIGHT;
    const firstX = graphStartX;
    const firstY = graphStartY + GRAPH_HEIGHT;
    path += ` L ${lastX} ${lastY} L ${firstX} ${firstY} Z`;
    return path;
  };

  const repairedPath = generateRepairedPath();
  const renewedPath = generateRenewedPath();
  const repairedAreaPath = generateRepairedAreaPath();
  const renewedAreaPath = generateRenewedAreaPath();

  return (
    <View style={styles.container}>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: repairedColor }]} />
          <Text style={styles.legendText}>Repaired</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: renewedColor }]} />
          <Text style={styles.legendText}>Renewed</Text>
        </View>
      </View>
      <View style={styles.chartContainer}>
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT} style={styles.svg}>
          {/* Grid lines */}
          {[0, 4, 8, 12, 16].map((value) => {
            const y = graphStartY + GRAPH_HEIGHT - (value * scaleY);
            return (
              <Path
                key={value}
                d={`M ${graphStartX} ${y} L ${graphStartX + GRAPH_WIDTH} ${y}`}
                stroke={Colors.border}
                strokeWidth="1"
                strokeDasharray="4,4"
                opacity={0.15}
              />
            );
          })}

          {/* Y-axis line */}
          <Path
            d={`M ${graphStartX} ${graphStartY} L ${graphStartX} ${graphStartY + GRAPH_HEIGHT}`}
            stroke={Colors.border}
            strokeWidth="1.5"
            opacity={0.4}
          />
          
          {/* X-axis line */}
          <Path
            d={`M ${graphStartX} ${graphStartY + GRAPH_HEIGHT} L ${graphStartX + GRAPH_WIDTH} ${graphStartY + GRAPH_HEIGHT}`}
            stroke={Colors.border}
            strokeWidth="1.5"
            opacity={0.4}
          />

          {/* Area fills - using solid colors with opacity instead of gradients */}
          <Path
            d={repairedAreaPath}
            fill={repairedColor}
            opacity={0.15}
          />
          <Path
            d={renewedAreaPath}
            fill={renewedColor}
            opacity={0.15}
          />

          {/* Repaired line */}
          <Path
            d={repairedPath}
            stroke={repairedColor}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Renewed line */}
          <Path
            d={renewedPath}
            stroke={renewedColor}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points for Repaired */}
          {repairedData.map((value, index) => {
            const x = graphStartX + index * stepX;
            const y = graphStartY + GRAPH_HEIGHT - value * scaleY;
            return (
              <Circle
                key={`repaired-${index}`}
                cx={x}
                cy={y}
                r="5"
                fill={repairedColor}
                stroke={Colors.white}
                strokeWidth="2.5"
              />
            );
          })}

          {/* Data points for Renewed */}
          {renewedData.map((value, index) => {
            const x = graphStartX + index * stepX;
            const y = graphStartY + GRAPH_HEIGHT - value * scaleY;
            return (
              <Circle
                key={`renewed-${index}`}
                cx={x}
                cy={y}
                r="5"
                fill={renewedColor}
                stroke={Colors.white}
                strokeWidth="2.5"
              />
            );
          })}
        </Svg>
        
        {/* Y-axis labels */}
        <View style={styles.yAxisLabels}>
          {[0, 4, 8, 12, 16].map((value) => {
            const y = graphStartY + GRAPH_HEIGHT - (value * scaleY);
            return (
              <Text
                key={value}
                style={[styles.yAxisLabel, { top: y - 8 }]}>
                {value}
              </Text>
            );
          })}
        </View>

        {/* X-axis labels */}
        <View style={styles.xAxisLabels}>
          {labels.map((label, index) => {
            const x = graphStartX + index * stepX;
            // Calculate label width to ensure even spacing
            const availableWidth = GRAPH_WIDTH;
            const labelWidth = availableWidth / labels.length;
            
            // Adjust positioning based on number of labels
            // For Monthly (12) and Weekly (7), use current alignment
            // For Quarterly (4) and Yearly (4), center them better
            let leftOffset;
            if (labels.length <= 4) {
              // For Quarterly and Yearly: center the label under the data point
              leftOffset = x - labelWidth / 1.5;
            } else {
              // For Monthly and Weekly: use the current alignment (left-aligned)
              leftOffset = x - labelWidth;
            }
            
            return (
              <View
                key={label}
                style={[styles.xAxisLabelContainer, { left: leftOffset, width: labelWidth }]}>
                <Text
                  style={styles.xAxisLabelText}
                  numberOfLines={1}
                  adjustsFontSizeToFit={true}
                  minimumFontScale={0.75}>
                  {label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.md,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingLeft: 0,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.xs,
  },
  legendText: {
    ...Typography.bodySmall,
    color: Colors.text,
    fontSize: 12,
  },
  chartContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
    minHeight: CHART_HEIGHT,
  },
  svg: {
    backgroundColor: 'transparent',
  },
  yAxisLabels: {
    position: 'absolute',
    left: 0,
    top: TOP_PADDING,
    width: Y_AXIS_WIDTH - 5,
    height: GRAPH_HEIGHT,
    justifyContent: 'flex-start',
  },
  yAxisLabel: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'right',
    position: 'absolute',
    fontWeight: '500',
    width: Y_AXIS_WIDTH - 5,
  },
  xAxisLabels: {
    position: 'absolute',
    bottom: 5,
    left: 30, // Y_AXIS_WIDTH (20) + LEFT_PADDING (-10) = 10
    width: CHART_WIDTH - 90, // Adjusted based on user's changes
    height: X_AXIS_HEIGHT,
    flexDirection: 'row',
  },
  xAxisLabelContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    height: X_AXIS_HEIGHT,
  },
  xAxisLabelText: {
    ...Typography.caption,
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default LineChart;
