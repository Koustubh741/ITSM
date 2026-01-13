import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Icon components
const BuildingIcon = ({ size = 16, color = '#FFFFFF' }) => (
  <Text style={{ fontSize: size, color }}>🏢</Text>
);

const LocationIcon = ({ size = 16, color = '#FFFFFF' }) => (
  <Text style={{ fontSize: size, color }}>📍</Text>
);

const SupportIcon = ({ size = 20, color = '#FF6B35' }) => (
  <Text style={{ fontSize: size, color }}>🎧</Text>
);

const ChecklistIcon = ({ size = 24, color = '#8B6FCF' }) => (
  <Text style={{ fontSize: size, color }}>✓</Text>
);

const MonitorIcon = ({ size = 24, color = '#007AFF' }) => (
  <Text style={{ fontSize: size, color }}>🖥️</Text>
);

const LaptopIcon = ({ size = 24, color = '#007AFF' }) => (
  <Text style={{ fontSize: size, color }}>💻</Text>
);

const BYODIcon = ({ size = 24, color = '#34C759' }) => (
  <Text style={{ fontSize: size, color }}>📱</Text>
);

const ShieldIcon = ({ size = 20, color = '#8E8E93' }) => (
  <Text style={{ fontSize: size, color }}>🛡️</Text>
);

const LockIcon = ({ size = 20, color = '#8E8E93' }) => (
  <Text style={{ fontSize: size, color }}>🔒</Text>
);

const WifiIcon = ({ size = 20, color = '#8E8E93' }) => (
  <Text style={{ fontSize: size, color }}>📶</Text>
);

const ChevronDownIcon = ({ size = 16, color = '#8E8E93' }) => (
  <Text style={{ fontSize: size, color }}>⌄</Text>
);

const EndUserManagerScreen = () => {
  // Header animation values
  const headerScale = useSharedValue(1);
  const gradientOpacity = useSharedValue(1);

  // Animate header on mount
  useEffect(() => {
    headerScale.value = withSpring(1, {
      damping: 15,
      stiffness: 150,
    });
    gradientOpacity.value = withSequence(
      withTiming(0.8, { duration: 300 }),
      withTiming(1, { duration: 500 })
    );
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
    opacity: gradientOpacity.value,
  }));

  // Sample data
  const teamApprovals = {
    hasPending: false,
    message: 'No pending approvals for your team.',
  };

  const requestHistory = [
    {
      id: 'monitor-001',
      type: 'Monitor Request',
      sentBy: 'End User',
      status: 'FULFILLED',
      icon: MonitorIcon,
      iconColor: '#007AFF',
      iconBgColor: '#E3F2FD',
    },
    {
      id: 'laptop-001',
      type: 'Laptop Request',
      sentBy: 'End User',
      status: 'FULFILLED',
      icon: LaptopIcon,
      iconColor: '#007AFF',
      iconBgColor: '#E3F2FD',
    },
    {
      id: 'byod-001',
      type: 'BYOD Request',
      sentBy: 'End User',
      status: 'FULFILLED',
      icon: BYODIcon,
      iconColor: '#34C759',
      iconBgColor: '#E8F5E9',
    },
  ];

  const policies = [
    { name: 'Acceptable Use Policy', icon: ShieldIcon },
    { name: 'Data Security Guidelines', icon: LockIcon },
    { name: 'Remote Work Standards', icon: WifiIcon },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Light Orange Gradient Glass Effect */}
      <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
        <View style={styles.headerGradient}>
          {/* Enhanced gradient layers for depth */}
          <View style={styles.gradientBase} />
          <View style={styles.gradientAccent} />
          {/* Glass effect overlay */}
          <View style={styles.glassOverlay} />
          {/* Subtle pattern overlay */}
          <View style={styles.patternOverlay} />
          <View style={styles.headerContent}>
            {/* Top Row */}
            <View style={styles.headerTopRow}>
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.userName}>End User</Text>
                <View style={styles.userDetails}>
                  <View style={styles.userDetailItem}>
                    <BuildingIcon size={14} color="#8B5A3C" />
                    <Text style={styles.userDetailText}>Cache Digitech</Text>
                  </View>
                  <Text style={styles.userDetailText}> • </Text>
                  <View style={styles.userDetailItem}>
                    <LocationIcon size={14} color="#8B5A3C" />
                    <Text style={styles.userDetailText}>New York HQ</Text>
                  </View>
                </View>
              </View>
              
              {/* Profile Icon */}
              <TouchableOpacity style={styles.profileContainer}>
                <View style={styles.profileImage}>
                  <View style={styles.profilePlaceholder}>
                    <Text style={styles.profileEmoji}>👤</Text>
                  </View>
                  <View style={styles.onlineIndicator} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Get Support Button */}
            <TouchableOpacity style={styles.supportButton}>
              <View style={styles.supportButtonContent}>
                <SupportIcon size={18} color="#FF6B35" />
                <Text style={styles.supportButtonText}>Get Support</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Team Approvals Needed Section */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.section}>
          <TouchableOpacity activeOpacity={0.8} style={styles.approvalCard}>
            <View style={styles.approvalIconContainer}>
              <View style={styles.approvalIconBackground}>
                <ChecklistIcon size={24} color="#8B6FCF" />
              </View>
            </View>
            <View style={styles.approvalContent}>
              <Text style={styles.approvalTitle}>Team Approvals Needed</Text>
              <Text style={styles.approvalMessage}>{teamApprovals.message}</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Request History Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Request History</Text>
          
          {requestHistory.map((request, index) => (
            <TouchableOpacity
              key={request.id}
              activeOpacity={0.7}
              style={styles.requestHistoryCard}
            >
              <Animated.View
                entering={FadeInUp.delay(200 + index * 100)}
                style={styles.requestHistoryContent}>
                <View style={[styles.requestHistoryIconContainer, { backgroundColor: request.iconBgColor }]}>
                  <request.icon size={20} color={request.iconColor} />
                </View>
                <View style={styles.requestHistoryDetails}>
                  <Text style={styles.requestHistoryType}>{request.type}</Text>
                  <Text style={styles.requestHistorySentBy}>Sent by: {request.sentBy}</Text>
                </View>
                <View style={styles.requestHistoryRight}>
                  <View style={styles.requestHistoryStatusBadge}>
                    <Text style={styles.requestHistoryStatusText}>{request.status}</Text>
                  </View>
                  <TouchableOpacity>
                    <ChevronDownIcon size={16} />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </TouchableOpacity>
          ))}
        </View>

        {/* IT Policies Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>IT Policies</Text>
          {policies.map((policy, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              style={styles.policyItem}
            >
              <Animated.View
                entering={FadeInUp.delay(400 + index * 100)}
                style={styles.policyItemContent}>
                <View style={styles.policyIconContainer}>
                  <policy.icon size={18} />
                </View>
                <Text style={styles.policyName}>{policy.name}</Text>
                <Text style={styles.arrowIcon}>›</Text>
              </Animated.View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navIcon, styles.navIconActive]}>🏠</Text>
          <Text style={[styles.navLabel, styles.navLabelActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🖥️</Text>
          <Text style={styles.navLabel}>Assets</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonIcon}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🎫</Text>
          <Text style={styles.navLabel}>Tickets</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFCFB',
  },
  headerContainer: {
    overflow: 'hidden',
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    backgroundColor: '#FFF5F0',
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  headerGradient: {
    paddingTop: Spacing.md + 4,
    paddingBottom: Spacing.lg + 4,
    paddingHorizontal: Spacing.md,
    position: 'relative',
    minHeight: 140,
  },
  gradientBase: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFE8D6',
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  gradientAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '70%',
    backgroundColor: '#FFD4B8',
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    opacity: 0.6,
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  patternOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerContent: {
    paddingTop: Spacing.sm,
    zIndex: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 12,
    color: '#8B4513',
    marginBottom: 4,
    fontWeight: '600',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  userName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#5C2E0A',
    marginBottom: Spacing.xs,
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.3,
  },
  userDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  userDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userDetailText: {
    fontSize: 11,
    color: '#8B5A3C',
    fontWeight: '600',
    textShadowColor: 'rgba(255, 255, 255, 0.7)',
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 1,
  },
  profileContainer: {
    marginLeft: Spacing.md,
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    position: 'relative',
  },
  profilePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFE8D6',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  profileEmoji: {
    fontSize: 24,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#34C759',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  supportButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.round,
    borderWidth: 2,
    borderColor: '#FFE8D6',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    alignSelf: 'center',
    width: '100%',
    marginTop: Spacing.sm,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  supportButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  supportButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF6B35',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: Spacing.sm,
  },
  approvalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  approvalIconContainer: {
    marginRight: Spacing.sm,
  },
  approvalIconBackground: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F3EFF9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  approvalContent: {
    flex: 1,
  },
  approvalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 3,
  },
  approvalMessage: {
    fontSize: 12,
    color: '#8E8E93',
    lineHeight: 16,
  },
  requestHistoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  requestHistoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestHistoryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  requestHistoryDetails: {
    flex: 1,
  },
  requestHistoryType: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 3,
  },
  requestHistorySentBy: {
    fontSize: 12,
    color: '#8E8E93',
  },
  requestHistoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  requestHistoryStatusBadge: {
    backgroundColor: '#F2F2F7',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  requestHistoryStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E93',
  },
  policyItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  policyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  policyName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1D1D1F',
  },
  arrowIcon: {
    fontSize: 20,
    color: '#8E8E93',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FEFCFB',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
  },
  navIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  navIconActive: {
    opacity: 1,
  },
  navLabel: {
    fontSize: 11,
    color: '#8E8E93',
  },
  navLabelActive: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  navButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  navButtonIcon: {
    fontSize: 28,
    fontWeight: '300',
    color: '#FFFFFF',
  },
});

export default EndUserManagerScreen;
