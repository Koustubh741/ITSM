import React, { useState, useEffect } from 'react';
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
import ByodDeviceScreen from './ByodDeviceScreen';
import RequestAssetScreen from './RequestAssetScreen';
import RaiseTicketScreen from './RaiseTicketScreen';
import EndUserProfileScreen from './EndUserProfileScreen';

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

const PhoneIcon = ({ size = 20, color = '#8E8E93' }) => (
  <Text style={{ fontSize: size, color }}>📱</Text>
);

const TicketIcon = ({ size = 20, color = '#007AFF' }) => (
  <Text style={{ fontSize: size, color }}>🎫</Text>
);

const CheckIcon = ({ size = 20, color = '#34C759' }) => (
  <Text style={{ fontSize: size, color }}>✓</Text>
);

const CalendarIcon = ({ size = 16, color = '#8E8E93' }) => (
  <Text style={{ fontSize: size, color }}>📅</Text>
);

const PinIcon = ({ size = 16, color = '#8E8E93' }) => (
  <Text style={{ fontSize: size, color }}>📍</Text>
);

const AuditIcon = ({ size = 16, color = '#8E8E93' }) => (
  <Text style={{ fontSize: size, color }}>✓</Text>
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

const EndUserScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Active');
  const [showByodScreen, setShowByodScreen] = useState(false);
  const [showRequestAssetScreen, setShowRequestAssetScreen] = useState(false);
  const [showRaiseTicketScreen, setShowRaiseTicketScreen] = useState(false);
  const [showProfileScreen, setShowProfileScreen] = useState(false);

  // Header animation values (must be at top level, before any returns)
  const headerScale = useSharedValue(1);
  const supportIconScale = useSharedValue(1);
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

  const supportIconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: supportIconScale.value }],
  }));

  const handleSupportPress = () => {
    supportIconScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
    setShowRaiseTicketScreen(true);
  };

  // Sample data
  const myAsset = {
    name: 'iPhone 17',
    vendor: 'Apple Inc.',
    serialNumber: 'c9245dd0-285f-4e8a-9c3d-1a2b3c4d5e6f',
    status: 'In Use',
    assignedDate: 'Jan 03, 2026',
    location: 'Office',
    nextAudit: '15th Sept, 2026',
  };

  const requests = [
    {
      id: '82bf292e',
      type: 'Ticket Request',
      description: 'Screen crack on iPhone device...',
      category: 'IT_MANAGEMENT',
      date: '07/01/2026',
      status: 'IN PROGRESS',
      statusColor: '#007AFF',
      icon: TicketIcon,
      iconColor: '#007AFF',
      dotColor: '#FF3B30',
    },
    {
      id: 'be30d2d4',
      type: 'OS Update',
      description: 'System update stuck at 99%...',
      category: 'IT_MANAGEMENT',
      date: '05/01/2026',
      status: 'RESOLVED',
      statusColor: '#34C759',
      icon: CheckIcon,
      iconColor: '#34C759',
      dotColor: '#8E8E93',
    },
  ];

  const policies = [
    { name: 'Acceptable Use Policy', icon: ShieldIcon },
    { name: 'Data Security Guidelines', icon: LockIcon },
    { name: 'Remote Work Standards', icon: WifiIcon },
  ];

  if (showByodScreen) {
    return (
      <ByodDeviceScreen
        navigation={navigation}
        onClose={() => setShowByodScreen(false)}
      />
    );
  }

  if (showRequestAssetScreen) {
    return (
      <RequestAssetScreen
        navigation={navigation}
        onClose={() => setShowRequestAssetScreen(false)}
      />
    );
  }

  if (showRaiseTicketScreen) {
    return (
      <RaiseTicketScreen
        navigation={navigation}
        onClose={() => setShowRaiseTicketScreen(false)}
      />
    );
  }

  if (showProfileScreen) {
    return (
      <EndUserProfileScreen
        navigation={navigation}
        onClose={() => setShowProfileScreen(false)}
      />
    );
  }

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
              
              {/* Get Support Icon */}
              <TouchableOpacity 
                style={styles.supportIconContainer}
                onPress={handleSupportPress}
                activeOpacity={0.8}>
                <Animated.View style={[styles.supportIconWrapper, supportIconAnimatedStyle]}>
                  <SupportIcon size={24} color="#FF6B35" />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* My Assets Section */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.section}>
          <Text style={styles.sectionTitle}>My Assets</Text>
          <TouchableOpacity activeOpacity={0.8} style={styles.assetCard}>
            <View style={styles.assetHeader}>
              <View style={styles.assetIconContainer}>
                <PhoneIcon size={24} color="#007AFF" />
              </View>
              <View style={styles.assetInfo}>
                <Text style={styles.assetName}>{myAsset.name}</Text>
                <Text style={styles.assetVendor}>{myAsset.vendor}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: '#E8F5E9' }]}>
                <Text style={[styles.statusText, { color: '#34C759' }]}>{myAsset.status}</Text>
              </View>
            </View>
            <View style={styles.assetDetails}>
              <View style={styles.assetDetailRow}>
                <CalendarIcon size={14} />
                <Text style={styles.assetDetailText}>Assigned: {myAsset.assignedDate}</Text>
              </View>
              <View style={styles.assetDetailRow}>
                <PinIcon size={14} />
                <Text style={styles.assetDetailText}>Location: {myAsset.location}</Text>
              </View>
              <View style={styles.assetDetailRow}>
                <AuditIcon size={14} />
                <Text style={styles.assetDetailText}>Next Audit: {myAsset.nextAudit}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Requests Section */}
        <View style={styles.section}>
          <View style={styles.requestsHeader}>
            <Text style={styles.sectionTitle}>Requests</Text>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'Active' && styles.tabActive]}
                onPress={() => setActiveTab('Active')}>
                <Text style={[styles.tabText, activeTab === 'Active' && styles.tabTextActive]}>
                  Active
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'History' && styles.tabActive]}
                onPress={() => setActiveTab('History')}>
                <Text style={[styles.tabText, activeTab === 'History' && styles.tabTextActive]}>
                  History
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {requests.map((request, index) => (
            <TouchableOpacity
              key={request.id}
              activeOpacity={0.7}
              style={styles.requestCard}
            >
              <Animated.View
                entering={FadeInUp.delay(200 + index * 100)}
                style={styles.requestContent}>
                <View style={[styles.requestIconContainer, { backgroundColor: `${request.iconColor}20` }]}>
                  <request.icon size={20} color={request.iconColor} />
                </View>
                <View style={styles.requestDetails}>
                  <Text style={styles.requestType}>{request.type}</Text>
                  <Text style={styles.requestDescription}>{request.description}</Text>
                  <Text style={styles.requestDate}>{request.date}</Text>
                </View>
                <View style={styles.requestRight}>
                  <View style={[styles.requestStatusBadge, { backgroundColor: `${request.statusColor}20` }]}>
                    <Text style={[styles.requestStatusText, { color: request.statusColor }]}>
                      {request.status}
                    </Text>
                  </View>
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
                <policy.icon size={20} />
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
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => setShowRequestAssetScreen(true)}>
          <Text style={styles.navButtonIcon}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setShowByodScreen(true)}>
          <Text style={styles.navIcon}>🎫</Text>
          <Text style={styles.navLabel}>Tickets</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setShowProfileScreen(true)}>
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
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
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
  supportIconContainer: {
    marginLeft: Spacing.md,
  },
  supportIconWrapper: {
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
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: Spacing.md,
  },
  assetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  assetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  assetIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 3,
  },
  assetVendor: {
    fontSize: 12,
    color: '#8E8E93',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  assetDetails: {
    gap: Spacing.xs,
  },
  assetDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  assetDetailText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  requestsHeader: {
    marginBottom: Spacing.md,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: BorderRadius.md,
    padding: 4,
    marginTop: Spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  requestCard: {
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
  requestContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  requestDetails: {
    flex: 1,
  },
  requestType: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 3,
  },
  requestDescription: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 3,
    lineHeight: 16,
  },
  requestDate: {
    fontSize: 11,
    color: '#8E8E93',
  },
  requestRight: {
    alignItems: 'flex-end',
  },
  requestStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  requestStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  policyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
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

export default EndUserScreen;
