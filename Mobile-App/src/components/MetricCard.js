import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';

const MetricCard = ({ icon: IconComponent, iconColor, title, value, trend, delay = 0, index }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withDelay(delay, withSpring(1, { damping: 15 })),
      transform: [
        {
          translateY: withDelay(
            delay,
            withSpring(0, { damping: 15, stiffness: 100 })
          ),
        },
      ],
    };
  });

  const getTrendColor = () => {
    if (trend?.includes('↑')) return Colors.success;
    if (trend?.includes('↓')) return Colors.danger;
    return Colors.gray;
  };

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor || Colors.primary }]}>
          <View style={styles.iconWrapper}>
            <IconComponent size={20} color={Colors.white} />
          </View>
        </View>
        {trend && (
          <Text style={[styles.trend, { color: getTrendColor() }]}>
            {trend}
          </Text>
        )}
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  trend: {
    ...Typography.caption,
    fontWeight: '600',
  },
  value: {
    ...Typography.h2,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  title: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
});

export default MetricCard;
