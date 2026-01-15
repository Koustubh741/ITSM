import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';

const SimpleBarChart = ({ data }) => {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <View style={styles.container}>
      {data.map((item, index) => {
        const barHeight = (item.value / maxValue) * 120;
        return (
          <View key={index} style={styles.barContainer}>
            <View style={styles.barWrapper}>
              <View style={[styles.bar, { height: barHeight }]} />
            </View>
            <Text style={styles.barLabel}>{item.label}</Text>
            <Text style={styles.barValue}>{item.value}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingVertical: Spacing.sm,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barWrapper: {
    width: '80%',
    height: 120,
    justifyContent: 'flex-end',
    marginBottom: Spacing.xs,
  },
  bar: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    minHeight: 4,
  },
  barLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  barValue: {
    ...Typography.caption,
    color: Colors.text,
    fontWeight: '600',
    marginTop: 2,
  },
});

export default SimpleBarChart;
