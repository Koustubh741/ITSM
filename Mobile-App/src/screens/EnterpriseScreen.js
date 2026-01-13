import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';

const features = [
  {
    id: '1',
    title: 'Smart Filters & Search',
    description: 'Advanced asset filtering with category, department, and...',
    icon: '🔍',
    iconColor: '#E3F2FD',
  },
  {
    id: '2',
    title: 'Saved Views',
    description: 'Access and manage your custom saved views for asset lists.',
    icon: '👁️',
    iconColor: '#F3E5F5',
  },
  {
    id: '3',
    title: 'Asset Comparison',
    description: 'Compare two assets side-by-side to analyze specifications.',
    icon: '⚖️',
    iconColor: '#E3F2FD',
  },
  {
    id: '4',
    title: 'Renewals Calendar',
    description: 'Visual calendar view for upcoming asset and contract renewals.',
    icon: '📅',
    iconColor: '#E8F5E9',
  },
  {
    id: '5',
    title: 'Ticketing System',
    description: 'Manage support tickets and service requests.',
    icon: '🎫',
    iconColor: '#FFEBEE',
  },
  {
    id: '6',
    title: 'User Inventory',
    description: 'View assets and software assigned to specific users.',
    icon: '👥',
    iconColor: '#E3F2FD',
  },
];

const EnterpriseScreen = ({ navigation }) => {
  const handleFeaturePress = (feature) => {
    console.log('Feature pressed:', feature.title);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View entering={FadeInUp.delay(50).duration(400)} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Enterprise Features Portal</Text>
          <Text style={styles.subtitle}>
            Access the new enterprise-grade modules and tools.
          </Text>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(100).duration(400)}>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                onPress={() => handleFeaturePress(feature)}
                delay={index * 50}
              />
            ))}
          </View>
        </Animated.View>
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const FeatureCard = ({ feature, onPress, delay }) => {
  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(400)}>
      <TouchableOpacity
        style={styles.featureCard}
        onPress={onPress}
        activeOpacity={0.8}>
        <View style={[styles.iconContainer, { backgroundColor: feature.iconColor }]}>
          <Text style={styles.icon}>{feature.icon}</Text>
        </View>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDescription}>{feature.description}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.warmBackground,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.warmBackground,
  },
  headerContent: {
    marginTop: 22,
  },
  title: {
    ...Typography.h1,
    color: Colors.warmText,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.warmTextSecondary,
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  featureCard: {
    width: '48%',
    backgroundColor: Colors.warmCardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    minHeight: 200,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  icon: {
    fontSize: 24,
  },
  featureTitle: {
    ...Typography.h3,
    color: Colors.warmText,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  featureDescription: {
    ...Typography.bodySmall,
    color: Colors.warmTextSecondary,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
});

export default EnterpriseScreen;
