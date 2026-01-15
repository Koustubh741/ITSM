import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { Typography } from '../constants/typography';

const BottomNavigation = ({ activeTab, onTabPress }) => {
  const tabs = [
    { id: 'overview', label: 'Home', icon: '📊' },
    { id: 'assets', label: 'Assets', icon: '📋' },
    { id: 'reports', label: 'Scan', icon: '📷' },
    { id: 'settings', label: 'More', icon: '⋯' },
  ];

  const getActiveColor = (tabId) => {
    if (tabId === 'assets') {
      return Colors.orange || Colors.primary;
    }
    return Colors.primary;
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => onTabPress(tab.id)}>
            <Text style={styles.icon}>{tab.icon}</Text>
            <Text
              style={[
                styles.label,
                isActive && [styles.labelActive, { color: getActiveColor(tab.id) }],
              ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 20,
    marginBottom: 4,
  },
  label: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  labelActive: {
    fontWeight: '600',
  },
});

export default BottomNavigation;
