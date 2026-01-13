import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import Animated, {
  FadeInUp,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Icon components
const BuildingIcon = ({ size = 20, color = '#8E8E93' }) => (
  <Text style={{ fontSize: size, color }}>🏢</Text>
);

const IdBadgeIcon = ({ size = 20, color = '#8E8E93' }) => (
  <Text style={{ fontSize: size, color }}>🪪</Text>
);

const CalendarIcon = ({ size = 20, color = '#8E8E93' }) => (
  <Text style={{ fontSize: size, color }}>📅</Text>
);

const LocationIcon = ({ size = 20, color = '#8E8E93' }) => (
  <Text style={{ fontSize: size, color }}>📍</Text>
);

const ServerIcon = ({ size = 20, color = '#8E8E93' }) => (
  <Text style={{ fontSize: size, color }}>🖥️</Text>
);

const PencilIcon = ({ size = 18, color = '#1D1D1F' }) => (
  <Text style={{ fontSize: size, color }}>✏️</Text>
);

const LockIcon = ({ size = 18, color = '#1D1D1F' }) => (
  <Text style={{ fontSize: size, color }}>🔒</Text>
);

const LogoutIcon = ({ size = 18, color = '#FFFFFF' }) => (
  <Text style={{ fontSize: size, color }}>🚪</Text>
);

const CheckIcon = ({ size = 12, color = '#FFFFFF' }) => (
  <Text style={{ fontSize: size, color }}>✓</Text>
);

const EndUserProfileScreen = ({ navigation, onClose }) => {
  const userData = {
    name: 'Alex Morgan',
    title: 'Senior Systems Architect',
    company: 'TechNova Solutions',
    employeeId: 'TN-8821',
    joined: 'March 12, 2021',
    location: 'San Francisco, HQ',
    domain: 'Infrastructure & Security',
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Background Gradient */}
      <View style={styles.backgroundGradient} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onClose || (() => navigation?.goBack())}
          style={styles.headerButton}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Profile Picture Section */}
        <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.profileSection}>
          <View style={styles.profilePictureContainer}>
            <View style={styles.profilePicture}>
              <Image
                source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
                style={styles.profileImage}
                onError={() => {
                  // Handle image load error
                }}
              />
            </View>
            <View style={styles.verifiedBadge}>
              <CheckIcon size={10} />
            </View>
          </View>
          <Text style={styles.userName}>{userData.name}</Text>
          <Text style={styles.userTitle}>{userData.title}</Text>
        </Animated.View>

        {/* User Details Section */}
        <View style={styles.detailsSection}>
          {/* Company */}
          <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.detailComponent}>
            <View style={styles.detailContent}>
              <View style={styles.detailLeft}>
                <Text style={styles.detailLabel}>COMPANY</Text>
                <Text style={styles.detailValue}>{userData.company}</Text>
              </View>
              <BuildingIcon size={20} />
            </View>
          </Animated.View>

          {/* Employee ID */}
          <Animated.View entering={FadeInUp.delay(250).duration(400)} style={styles.detailComponent}>
            <View style={styles.detailContent}>
              <View style={styles.detailLeft}>
                <Text style={styles.detailLabel}>EMPLOYEE ID</Text>
                <Text style={styles.detailValue}>{userData.employeeId}</Text>
              </View>
              <IdBadgeIcon size={20} />
            </View>
          </Animated.View>

          {/* Joined */}
          <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.detailComponent}>
            <View style={styles.detailContent}>
              <View style={styles.detailLeft}>
                <Text style={styles.detailLabel}>JOINED</Text>
                <Text style={styles.detailValue}>{userData.joined}</Text>
              </View>
              <CalendarIcon size={20} />
            </View>
          </Animated.View>

          {/* Location */}
          <Animated.View entering={FadeInUp.delay(350).duration(400)} style={styles.detailComponent}>
            <View style={styles.detailContent}>
              <View style={styles.detailLeft}>
                <Text style={styles.detailLabel}>LOCATION</Text>
                <Text style={styles.detailValue}>{userData.location}</Text>
              </View>
              <LocationIcon size={20} />
            </View>
          </Animated.View>

          {/* Domain */}
          <Animated.View entering={FadeInUp.delay(400).duration(400)} style={styles.detailComponent}>
            <View style={styles.detailContent}>
              <View style={styles.detailLeft}>
                <Text style={styles.detailLabel}>DOMAIN</Text>
                <Text style={styles.detailValue}>{userData.domain}</Text>
              </View>
              <ServerIcon size={20} />
            </View>
          </Animated.View>
        </View>

        {/* Action Buttons Section */}
        <View style={styles.actionsSection}>
          {/* Edit Profile */}
          <Animated.View entering={FadeInUp.delay(500).duration(400)}>
            <TouchableOpacity style={styles.actionButton}>
              <PencilIcon size={18} />
              <Text style={styles.actionButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Change Password */}
          <Animated.View entering={FadeInUp.delay(550).duration(400)}>
            <TouchableOpacity style={styles.actionButton}>
              <LockIcon size={18} />
              <Text style={styles.actionButtonText}>Change Password</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Log Out */}
          <Animated.View entering={FadeInUp.delay(600).duration(400)}>
            <TouchableOpacity style={styles.logoutButton}>
              <LogoutIcon size={18} />
              <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={{ height: Spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F0',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFF5F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 32,
    color: '#1D1D1F',
    fontWeight: '300',
  },
  settingsIcon: {
    fontSize: 22,
    color: '#1D1D1F',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  profilePictureContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF6B35',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  userName: {
    ...Typography.h1,
    fontSize: 24,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: Spacing.xs,
  },
  userTitle: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: '400',
    color: '#1D1D1F',
  },
  detailsSection: {
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  detailComponent: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLeft: {
    flex: 1,
  },
  detailLabel: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: '600',
    color: '#8E8E93',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  detailValue: {
    ...Typography.h3,
    fontSize: 15,
    fontWeight: '700',
    color: '#1D1D1F',
  },
  actionsSection: {
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    ...Typography.h3,
    fontSize: 15,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutButtonText: {
    ...Typography.h3,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default EndUserProfileScreen;
