import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { Typography } from '../constants/typography';

const SectionHeader = ({ title, menuIcon, onActionPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {onActionPress && (
        <TouchableOpacity
          onPress={onActionPress}
          style={styles.actionButton}
          activeOpacity={0.7}>
          {menuIcon ? (
            <View style={styles.menuIconContainer}>{menuIcon}</View>
          ) : (
            <Text style={styles.actionText}>View All</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h3,
    color: Colors.text,
    fontWeight: '700',
  },
  actionButton: {
    padding: Spacing.xs,
  },
  actionText: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '600',
  },
  menuIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SectionHeader;
