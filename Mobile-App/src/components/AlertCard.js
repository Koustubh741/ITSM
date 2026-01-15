import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';

const AlertCard = ({ icon: IconComponent, iconColor, title, time, description, action, delay = 0 }) => {
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(400)}>
      <TouchableOpacity style={styles.card} activeOpacity={0.7}>
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: iconColor || Colors.primary }]}>
            <View style={styles.iconWrapper}>
              <IconComponent size={20} color={Colors.white} />
            </View>
          </View>
          <View style={styles.textContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{title}</Text>
              {time && <Text style={styles.time}>{time}</Text>}
            </View>
            {description && (
              <Text style={styles.description} numberOfLines={2}>
                {description}
              </Text>
            )}
            {action && (
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>{action}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '600',
    flex: 1,
  },
  time: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  description: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    lineHeight: 18,
  },
  actionButton: {
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
  },
  actionText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default AlertCard;
