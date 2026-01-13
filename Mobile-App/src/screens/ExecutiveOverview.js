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
  FadeIn,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../components/Header';
import MetricCard from '../components/MetricCard';
import TimelineItem from '../components/TimelineItem';
import AlertCard from '../components/AlertCard';
import SectionHeader from '../components/SectionHeader';
import LineChart from '../components/LineChart';
import SegmentedControl from '../components/SegmentedControl';
import BottomSheet from '../components/BottomSheet';
import Dropdown from '../components/Dropdown';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';

// Simple icon components (using emoji for now, can be replaced with proper icons)
const DocumentIcon = ({ size = 20, color }) => <Text style={{ fontSize: size }}>📄</Text>;
const PersonIcon = ({ size = 20, color }) => <Text style={{ fontSize: size }}>👤</Text>;
const WrenchIcon = ({ size = 20, color }) => <Text style={{ fontSize: size }}>🔧</Text>;
const WarningIcon = ({ size = 20, color }) => <Text style={{ fontSize: size }}>⚠️</Text>;
const DollarIcon = ({ size = 20, color }) => <Text style={{ fontSize: size }}>💵</Text>;
const BuildingIcon = ({ size = 20, color }) => <Text style={{ fontSize: size }}>🏢</Text>;
const CartIcon = ({ size = 20, color }) => <Text style={{ fontSize: size }}>🛒</Text>;
const AlertWarningIcon = ({ size = 20, color }) => <Text style={{ fontSize: size }}>🚨</Text>;
const LicenseIcon = ({ size = 20, color }) => <Text style={{ fontSize: size }}>📜</Text>;

const ExecutiveOverview = () => {
  const [selectedSegment, setSelectedSegment] = useState('Location');
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('Monthly');
  const [showNotificationBadge, setShowNotificationBadge] = useState(true);

  const metrics = [
    {
      icon: DocumentIcon,
      iconColor: Colors.primary,
      title: 'Total Assets',
      value: '2,450',
      trend: '↑ 5%',
    },
    {
      icon: PersonIcon,
      iconColor: Colors.success,
      title: 'Active Usage',
      value: '1,892',
      trend: '↑ 12%',
    },
    {
      icon: WrenchIcon,
      iconColor: Colors.warning,
      title: 'In Repair',
      value: '45',
      trend: '→ 0%',
    },
    {
      icon: WarningIcon,
      iconColor: Colors.danger,
      title: 'Warranty Risk',
      value: '12 Items',
      trend: '↑ 1%',
    },
    {
      icon: DollarIcon,
      iconColor: '#64B5F6',
      title: 'Asset Value',
      value: '$1.2M',
      trend: '↑ 2%',
    },
    {
      icon: BuildingIcon,
      iconColor: '#BA68C8',
      title: 'Net Asset Value',
      value: '$980k',
      trend: '↓ 3%',
    },
    {
      icon: CartIcon,
      iconColor: Colors.primary,
      title: 'YTD Purchases',
      value: '$45k',
      trend: '↓ 8%',
    },
  ];

  const timelineData = [
    {
      title: 'Procurement',
      description: 'Approved by finance',
      date: 'Oct 12',
      isCompleted: true,
      isActive: false,
    },
    {
      title: 'Receiving',
      description: 'Arrived at warehouse',
      date: 'Oct 14',
      isCompleted: true,
      isActive: false,
    },
    {
      title: 'Configuration',
      description:
        'Software imaging in progress. Estimated completion: 2 hours.',
      date: null,
      isCompleted: false,
      isActive: true,
    },
    {
      title: 'Assignment',
      description: 'Waiting for completion.',
      date: null,
      isCompleted: false,
      isActive: false,
    },
  ];

  const alerts = [
    {
      icon: AlertWarningIcon,
      iconColor: Colors.danger,
      title: 'Server Outage - US East',
      time: '10m ago',
      description: 'Critical connectivity loss reported in Data Center 4.',
      action: 'View Incident →',
    },
    {
      icon: LicenseIcon,
      iconColor: Colors.warning,
      title: 'License Expiry',
      time: '2h ago',
      description: 'Adobe Creative Suite licenses expiring for 5 users.',
      action: 'Renew Now →',
    },
  ];

  // Mock data for line chart - will be replaced with backend data
  const getChartData = (timeRange) => {
    switch (timeRange) {
      case 'Monthly':
        return {
          repaired: [5, 7, 9, 6, 8, 6, 8, 2, 3, 4, 5, 5],
          renewed: [16, 15, 12, 10, 12.5, 6, 8, 9, 10, 11, 11.5, 12],
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        };
      case 'Quarterly':
        return {
          repaired: [7, 7.3, 3.3, 4.7],
          renewed: [14.3, 9.5, 9, 11.2],
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        };
      case 'Yearly':
        return {
          repaired: [6.2, 7.1, 5.8, 6.5],
          renewed: [12.5, 11.8, 13.2, 12.9],
          labels: ['2021', '2022', '2023', '2024'],
        };
      case 'Weekly':
        return {
          repaired: [5, 6, 7, 5.5, 6.5, 7.5, 6],
          renewed: [12, 13, 11, 12.5, 13.5, 12, 13],
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        };
      default:
        return {
          repaired: [5, 7, 9, 6, 8, 6, 8, 2, 3, 4, 5, 5],
          renewed: [16, 15, 12, 10, 12.5, 6, 8, 9, 10, 11, 11.5, 12],
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        };
    }
  };

  const chartData = getChartData(selectedTimeRange);
  
  // Colors for the lines
  const repairedColor = '#FF6B35'; // Orange Red
  const renewedColor = '#4ECDC4'; // Blue Light Green (Turquoise)

  const handleNotificationPress = () => {
    setIsBottomSheetVisible(true);
  };

  const handleCloseBottomSheet = () => {
    setIsBottomSheetVisible(false);
    setShowNotificationBadge(false); // Hide badge after closing
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        onNotificationPress={handleNotificationPress}
        alertCount={alerts.length}
        showBadge={showNotificationBadge}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Performance Metrics Section */}
        <Animated.View entering={FadeInUp.delay(100).duration(600)}>
          <SectionHeader
            title="Performance Metrics"
            onActionPress={() => {}}
          />
          <View style={styles.metricsGrid}>
            {metrics.map((metric, index) => (
              <View key={index} style={styles.metricCard}>
                <MetricCard
                  icon={metric.icon}
                  iconColor={metric.iconColor}
                  title={metric.title}
                  value={metric.value}
                  trend={metric.trend}
                  delay={index * 50}
                  index={index}
                />
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Lifecycle Tracking Section */}
        <Animated.View entering={FadeInUp.delay(200).duration(600)}>
          <SectionHeader
            title="Lifecycle Tracking"
            menuIcon={<Text style={styles.menuIcon}>⋯</Text>}
            onActionPress={() => {}}
          />
          <View style={styles.timelineContainer}>
            {timelineData.map((item, index) => (
              <TimelineItem
                key={index}
                title={item.title}
                description={item.description}
                date={item.date}
                isActive={item.isActive}
                isCompleted={item.isCompleted}
                isLast={index === timelineData.length - 1}
                delay={index * 100}
              />
            ))}
          </View>
        </Animated.View>

        {/* Cost & Renewal Trends Section */}
        <Animated.View entering={FadeInUp.delay(300).duration(600)}>
          <View style={styles.trendsHeader}>
            <View style={styles.trendsTitleContainer}>
              <Text style={styles.trendsTitle}>Cost & Renewal Trends</Text>
              <Text style={styles.trendsSubtitle}>
                {selectedTimeRange === 'Monthly'
                  ? 'Monthly Overview'
                  : selectedTimeRange === 'Quarterly'
                  ? 'Quarterly Overview'
                  : selectedTimeRange === 'Yearly'
                  ? 'Yearly Overview'
                  : 'Weekly Overview'}
              </Text>
            </View>
            <Dropdown
              options={['Monthly', 'Quarterly', 'Yearly', 'Weekly']}
              selected={selectedTimeRange}
              onSelect={setSelectedTimeRange}
            />
          </View>
          <LineChart
            repairedData={chartData.repaired}
            renewedData={chartData.renewed}
            labels={chartData.labels}
            repairedColor={repairedColor}
            renewedColor={renewedColor}
          />
        </Animated.View>

        {/* Live Alerts Section - Removed from main view, now in bottom sheet */}

        {/* Asset Analytics Section */}
        <Animated.View entering={FadeInUp.delay(500).duration(600)} style={styles.assetAnalyticsSection}>
          <SectionHeader title="Asset Analytics" />
          <SegmentedControl
            options={['Location', 'Type', 'Segment', 'Status']}
            selected={selectedSegment}
            onSelect={setSelectedSegment}
          />
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataIcon}>📊</Text>
            <Text style={styles.noDataTitle}>No Data Available</Text>
            <Text style={styles.noDataDescription}>
              There isn't enough data to generate analytics for this location
              yet.
            </Text>
            <TouchableOpacity style={styles.changeFiltersButton}>
              <Text style={styles.changeFiltersText}>Change Filters</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
      <BottomSheet
        visible={isBottomSheetVisible}
        onClose={handleCloseBottomSheet}>
        <View style={styles.bottomSheetHeader}>
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>2 New</Text>
          </View>
        </View>
        {alerts.map((alert, index) => (
          <AlertCard
            key={index}
            icon={alert.icon}
            iconColor={alert.iconColor}
            title={alert.title}
            time={alert.time}
            description={alert.description}
            action={alert.action}
            delay={index * 100}
          />
        ))}
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  metricCard: {
    width: '48%',
  },
  timelineContainer: {
    marginBottom: Spacing.lg,
    paddingLeft: Spacing.xs,
  },
  menuIcon: {
    fontSize: 20,
    color: Colors.textSecondary,
  },
  alertsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  alertsTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  newBadge: {
    backgroundColor: Colors.danger,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.round,
    marginLeft: Spacing.sm,
  },
  newBadgeText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600',
  },
  noDataContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    marginBottom: Spacing.lg,
  },
  noDataIcon: {
    fontSize: 48,
    opacity: 0.3,
    marginBottom: Spacing.md,
  },
  noDataTitle: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  noDataDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  changeFiltersButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  changeFiltersText: {
    ...Typography.bodySmall,
    color: Colors.text,
    fontWeight: '500',
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: Spacing.sm,
  },
  trendsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  trendsTitleContainer: {
    flex: 1,
  },
  trendsTitle: {
    ...Typography.h3,
    color: Colors.text,
  },
  trendsSubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  assetAnalyticsSection: {
    marginTop: Spacing.lg,
  },
});

export default ExecutiveOverview;
