import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { Typography } from '../constants/typography';

const TimelineItem = ({
  title,
  description,
  date,
  isCompleted,
  isActive,
  isLast,
  delay = 0,
}) => {
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(400)} style={styles.container}>
      <View style={styles.timeline}>
        <View style={[styles.dot, isCompleted && styles.dotCompleted, isActive && styles.dotActive]} />
        {!isLast && <View style={[styles.line, isCompleted && styles.lineCompleted]} />}
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, isActive && styles.titleActive]}>
            {title}
          </Text>
          {date && (
            <Text style={styles.date}>{date}</Text>
          )}
        </View>
        {description && (
          <Text style={[styles.description, isActive && styles.descriptionActive]}>
            {description}
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  timeline: {
    width: 24,
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.border,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  dotCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  dotActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginTop: 4,
    minHeight: 40,
  },
  lineCompleted: {
    backgroundColor: Colors.success,
  },
  content: {
    flex: 1,
    paddingBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    ...Typography.body,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  titleActive: {
    color: Colors.text,
    fontWeight: '600',
  },
  date: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  description: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  descriptionActive: {
    color: Colors.text,
  },
});

export default TimelineItem;
