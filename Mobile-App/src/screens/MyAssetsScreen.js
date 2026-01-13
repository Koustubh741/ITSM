import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInUp,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import AssetCard from '../components/AssetCard';
import Dropdown from '../components/Dropdown';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';

const SettingsIcon = () => <Text style={styles.settingsIcon}>⚙️</Text>;
const SearchIcon = () => <Text style={styles.searchIcon}>🔍</Text>;
const PlusIcon = () => <Text style={styles.plusIcon}>+</Text>;

const mockAssets = [
  {
    id: '1',
    name: 'MacBook Pro 16"',
    tag: 'TAG-2049',
    type: 'Laptop',
    segment: 'IT',
    assignedTo: 'John Doe',
    cost: '$2,499.00',
    assignedBy: 'Admin',
    status: 'In Use',
  },
  {
    id: '2',
    name: 'iPhone 14 Pro',
    tag: 'TAG-2055',
    type: 'Mobile',
    segment: 'Non IT',
    assignedTo: null,
    cost: '$999.00',
    assignedBy: null,
    status: 'InStock',
  },
  {
    id: '3',
    name: 'Dell PowerEdge R750',
    tag: 'TAG-1082',
    type: 'Server',
    segment: 'IT',
    assignedTo: 'Jane Smith',
    cost: '$3,499.00',
    assignedBy: 'Admin',
    status: 'In Use',
  },
  {
    id: '4',
    name: 'Logitech MX Keys',
    tag: 'TAG-3301',
    type: 'Peripheral',
    segment: 'Non IT',
    assignedTo: null,
    cost: '$99.99',
    assignedBy: null,
    status: 'InStock',
  },
  {
    id: '5',
    name: 'iPad Pro 12.9"',
    tag: 'TAG-2101',
    type: 'Tablet',
    segment: 'IT',
    assignedTo: 'Bob Johnson',
    cost: '$1,099.00',
    assignedBy: 'Admin',
    status: 'In Use',
  },
];

const MyAssetsScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [assets, setAssets] = useState(mockAssets);

  const segmentOptions = ['All', 'IT', 'Non IT'];
  const statusOptions = [
    'All',
    'InStock',
    'Repaired',
    'Damaged',
    'In Use',
    'Decommissioned',
  ];

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      searchQuery === '' ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tag.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSegment =
      selectedSegment === 'All' || asset.segment === selectedSegment;

    const matchesStatus =
      selectedStatus === 'All' || asset.status === selectedStatus;

    return matchesSearch && matchesSegment && matchesStatus;
  });

  const handleAssetPress = (asset, action) => {
    if (action === 'viewDetails') {
      if (navigation) {
        navigation.navigate('AssetDetails', { asset });
      }
    } else {
      console.log('Asset pressed:', asset.id);
    }
  };

  const handleAddAsset = () => {
    if (navigation) {
      navigation.navigate('AddAsset');
    } else {
      console.log('Navigate to Add Asset screen');
    }
  };

  const handleSettings = () => {
    console.log('Settings pressed');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View entering={FadeInUp.delay(50).duration(600)} style={styles.header}>
        <Text style={styles.headerTitle}>My Assets</Text>
        <TouchableOpacity
          onPress={handleSettings}
          style={styles.settingsButton}
          activeOpacity={0.7}>
          <SettingsIcon />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(100).duration(600)}>
          <View style={styles.searchContainer}>
            <SearchIcon />
            <TextInput
              style={styles.searchInput}
              placeholder="Search tag, serial, or name..."
              placeholderTextColor={Colors.warmTextSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(150).duration(600)}>
          <View style={styles.filtersContainer}>
            <View style={styles.dropdownWrapper}>
              <Text style={styles.dropdownLabel}>Segment Type</Text>
              <Dropdown
                options={segmentOptions}
                selected={selectedSegment}
                onSelect={setSelectedSegment}
                style={styles.dropdown}
              />
            </View>
            <View style={styles.dropdownWrapper}>
              <Text style={styles.dropdownLabel}>Status</Text>
              <Dropdown
                options={statusOptions}
                selected={selectedStatus}
                onSelect={setSelectedStatus}
                style={styles.dropdown}
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(600)}>
          <View style={styles.assetsList}>
            {filteredAssets.length > 0 ? (
              filteredAssets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  onPress={handleAssetPress}
                  onViewDetails={(asset) => handleAssetPress(asset, 'viewDetails')}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>📦</Text>
                <Text style={styles.emptyStateText}>No assets found</Text>
                <Text style={styles.emptyStateSubtext}>
                  Try adjusting your filters
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Animated.View entering={FadeInUp.delay(300).duration(600)}>
        <AnimatedFAB onPress={handleAddAsset} />
      </Animated.View>
    </SafeAreaView>
  );
};

const AnimatedFAB = ({ onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, {
      damping: 15,
      stiffness: 200,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 200,
    });
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.fab}
      activeOpacity={1}>
      <Animated.View style={[styles.fabContent, animatedStyle]}>
        <PlusIcon />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.warmBackground,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.warmBackground,
  },
  headerTitle: {
    ...Typography.h1,
    color: Colors.warmText,
    fontWeight: '700',
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 24,
    color: Colors.warmText,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warmCardBackground,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
    color: Colors.warmTextSecondary,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.warmText,
    paddingVertical: 0,
  },
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  dropdownWrapper: {
    flex: 1,
  },
  dropdownLabel: {
    ...Typography.bodySmall,
    color: Colors.warmText,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  dropdown: {
    width: '100%',
  },
  assetsList: {
    marginTop: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
    opacity: 0.3,
  },
  emptyStateText: {
    ...Typography.h3,
    color: Colors.warmText,
    marginBottom: Spacing.xs,
  },
  emptyStateSubtext: {
    ...Typography.bodySmall,
    color: Colors.warmTextSecondary,
  },
  bottomSpacer: {
    height: 100,
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.xl + 60,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.orange,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIcon: {
    fontSize: 28,
    color: Colors.white,
    fontWeight: '300',
  },
});

export default MyAssetsScreen;
