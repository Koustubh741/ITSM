import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import RenewalRequestBottomSheet from '../components/RenewalRequestBottomSheet';
import DigitalIdentityBottomSheet from '../components/DigitalIdentityBottomSheet';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';

const BackIcon = () => <Text style={styles.backIcon}>←</Text>;
const InfoIcon = () => <Text style={styles.sectionIcon}>ℹ️</Text>;
const UserIcon = () => <Text style={styles.sectionIcon}>👤</Text>;
const ChipIcon = () => <Text style={styles.sectionIcon}>🔲</Text>;
const LocationIcon = () => <Text style={styles.sectionIcon}>📍</Text>;
const SettingsIcon = () => <Text style={styles.sectionIcon}>⚙️</Text>;
const ArrowIcon = () => <Text style={styles.arrowIcon}>›</Text>;
const DeleteIcon = () => <Text style={styles.deleteIcon}>🗑️</Text>;
const CheckIcon = () => <Text style={styles.checkIcon}>✓</Text>;
const ShieldIcon = () => <Text style={styles.shieldIcon}>🛡️</Text>;
const PlaneIcon = () => <Text style={styles.planeIcon}>✈️</Text>;

const AssetDetailsScreen = ({ navigation, route }) => {
  const [isRenewalSheetVisible, setIsRenewalSheetVisible] = useState(false);
  const [isDigitalIdentityVisible, setIsDigitalIdentityVisible] = useState(false);

  const asset = route?.params?.asset || {
    id: 'IT-2023-0045',
    name: 'MacBook Pro 16"',
    status: 'Deployed',
    segment: 'Engineering',
    type: 'Laptop',
    vendor: 'Apple',
    model: 'M2 Max (2023)',
    serialNumber: 'C02XYZ123ABC',
    assignedTo: 'Alex Morgan',
    assignedBy: 'IT Administration',
    cpu: '12-Core',
    ram: '32 GB',
    storage: '1 TB SSD',
    assignedLocation: 'San Francisco HQ',
    currentLocation: 'HQ - Floor 3',
    purchaseDate: 'Oct 12, 2023',
    warrantyExpiry: 'Oct 12, 2026',
  };

  const handleEdit = () => {
    console.log('Edit asset:', asset.id);
    if (navigation) {
      navigation.navigate('AddAsset', { asset, isEdit: true });
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Asset',
      'Are you sure you want to delete this asset? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            console.log('Delete asset:', asset.id);
            if (navigation) {
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  const handleManagementOption = (option) => {
    if (option === 'digitalIdentity') {
      setIsDigitalIdentityVisible(true);
    } else if (option === 'renewalRequest') {
      setIsRenewalSheetVisible(true);
    }
  };

  const handleRenewalSubmit = (data) => {
    console.log('Renewal request:', data);
    Alert.alert('Success', 'Renewal request submitted successfully!');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View entering={FadeInUp.delay(50).duration(400)} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Asset Details</Text>
        <TouchableOpacity
          onPress={handleEdit}
          style={styles.editButton}
          activeOpacity={0.7}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(100).duration(400)}>
          <View style={styles.imageContainer}>
            <View style={styles.placeholderImage}>
              <Text style={styles.imagePlaceholder}>💻</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(150).duration(400)}>
          <View style={styles.titleSection}>
            <Text style={styles.assetTitle}>{asset.name}</Text>
            <View style={styles.idContainer}>
              <Text style={styles.assetId}>#{asset.id}</Text>
              <View style={styles.statusTag}>
                <CheckIcon />
                <Text style={styles.statusText}>{asset.status}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(400)}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <InfoIcon />
              <Text style={styles.sectionTitle}>General Information</Text>
            </View>
            <View style={styles.card}>
              <InfoRow label="Segment" value={asset.segment} />
              <InfoRow label="Type" value={asset.type} />
              <InfoRow
                label="Vendor"
                value={asset.vendor}
                icon={<Text style={styles.vendorIcon}>🍎</Text>}
              />
              <InfoRow label="Model" value={asset.model} />
              <InfoRow label="Serial Number" value={asset.serialNumber} />
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(250).duration(400)}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <UserIcon />
              <Text style={styles.sectionTitle}>Assignment Details</Text>
            </View>
            <View style={styles.card}>
              <InfoRow
                label="Assigned To"
                value={asset.assignedTo}
                icon={<Text style={styles.personIcon}>👤</Text>}
              />
              <InfoRow label="Assigned By" value={asset.assignedBy} />
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(400)}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ChipIcon />
              <Text style={styles.sectionTitle}>Specifications</Text>
            </View>
            <View style={styles.specsContainer}>
              <SpecCard icon="🔲" title="CPU" value={asset.cpu} />
              <SpecCard icon="💾" title="RAM" value={asset.ram} />
              <SpecCard icon="💿" title="STORAGE" value={asset.storage} />
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(350).duration(400)}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LocationIcon />
              <Text style={styles.sectionTitle}>Location & Lifecycle</Text>
            </View>
            <View style={styles.mapContainer}>
              <View style={styles.mapPlaceholder}>
                <LocationIcon />
                <Text style={styles.mapText}>HQ - Floor 3</Text>
              </View>
            </View>
            <View style={styles.card}>
              <InfoRow label="Asset Assigned Location" value={asset.assignedLocation} />
              <InfoRow
                label="Asset Current Location"
                value={asset.currentLocation}
                icon={<PlaneIcon />}
              />
              <InfoRow label="Purchase Date" value={asset.purchaseDate} />
              <InfoRow
                label="Warranty Expiry"
                value={asset.warrantyExpiry}
                icon={<ShieldIcon />}
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).duration(400)}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <SettingsIcon />
              <Text style={styles.sectionTitle}>Management Options</Text>
            </View>
            <View style={styles.card}>
              <ManagementOption
                title="Digital Identity"
                subtitle="Manage device authentication"
                onPress={() => handleManagementOption('digitalIdentity')}
              />
              <View style={styles.divider} />
              <ManagementOption
                title="Renewal Request"
                subtitle="Submit service tickets"
                onPress={() => handleManagementOption('renewalRequest')}
              />
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(450).duration(400)}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            activeOpacity={0.8}>
            <DeleteIcon />
            <Text style={styles.deleteText}>Delete Asset</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <RenewalRequestBottomSheet
        visible={isRenewalSheetVisible}
        onClose={() => setIsRenewalSheetVisible(false)}
        onSubmit={handleRenewalSubmit}
      />

      <DigitalIdentityBottomSheet
        visible={isDigitalIdentityVisible}
        onClose={() => setIsDigitalIdentityVisible(false)}
        asset={asset}
      />
    </SafeAreaView>
  );
};

const InfoRow = ({ label, value, icon }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <View style={styles.infoValueContainer}>
      {icon && <View style={styles.infoIcon}>{icon}</View>}
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const SpecCard = ({ icon, title, value }) => (
  <View style={styles.specCard}>
    <Text style={styles.specIcon}>{icon}</Text>
    <Text style={styles.specTitle}>{title}</Text>
    <Text style={styles.specValue}>{value}</Text>
  </View>
);

const ManagementOption = ({ title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.managementOption} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.managementContent}>
      <Text style={styles.managementTitle}>{title}</Text>
      <Text style={styles.managementSubtitle}>{subtitle}</Text>
    </View>
    <ArrowIcon />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.warmBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.warmBackground,
    ...Platform.select({
      ios: {
        paddingTop: Spacing.md,
      },
      android: {
        paddingTop: Spacing.sm,
      },
    }),
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backIcon: {
    fontSize: 24,
    color: Colors.warmText,
    fontWeight: '600',
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.warmText,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  editButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  editText: {
    ...Typography.body,
    color: Colors.orange,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: Colors.warmCardBackground,
    marginBottom: Spacing.md,
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8E8E8',
  },
  imagePlaceholder: {
    fontSize: 80,
  },
  titleSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  assetTitle: {
    ...Typography.h1,
    color: Colors.warmText,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  assetId: {
    ...Typography.bodySmall,
    color: Colors.warmTextSecondary,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.orange,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
    gap: Spacing.xs,
  },
  checkIcon: {
    fontSize: 12,
    color: Colors.white,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600',
  },
  section: {
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  sectionIcon: {
    fontSize: 16,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.warmText,
    fontWeight: '600',
  },
  card: {
    backgroundColor: Colors.warmCardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.warmBorder,
  },
  infoLabel: {
    ...Typography.bodySmall,
    color: Colors.warmText,
    flex: 1,
  },
  infoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    gap: Spacing.xs,
  },
  infoIcon: {
    marginRight: Spacing.xs,
  },
  infoValue: {
    ...Typography.body,
    color: Colors.warmText,
    fontWeight: '500',
    textAlign: 'right',
  },
  vendorIcon: {
    fontSize: 14,
  },
  personIcon: {
    fontSize: 14,
    color: Colors.warmTextSecondary,
  },
  specsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  specCard: {
    flex: 1,
    backgroundColor: Colors.warmCardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  specIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  specTitle: {
    ...Typography.caption,
    color: Colors.warmText,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  specValue: {
    ...Typography.body,
    color: Colors.warmText,
    fontWeight: '500',
    textAlign: 'center',
  },
  mapContainer: {
    marginBottom: Spacing.md,
  },
  mapPlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#E3F2FD',
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.warmBorder,
  },
  mapText: {
    ...Typography.bodySmall,
    color: Colors.orange,
    marginTop: Spacing.xs,
    fontWeight: '500',
  },
  planeIcon: {
    fontSize: 12,
    color: Colors.orange,
  },
  shieldIcon: {
    fontSize: 12,
    color: Colors.success,
  },
  managementOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  managementContent: {
    flex: 1,
  },
  managementTitle: {
    ...Typography.body,
    color: Colors.warmText,
    fontWeight: '500',
    marginBottom: Spacing.xs / 2,
  },
  managementSubtitle: {
    ...Typography.caption,
    color: Colors.warmTextSecondary,
  },
  arrowIcon: {
    fontSize: 20,
    color: Colors.warmTextSecondary,
    marginLeft: Spacing.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.warmBorder,
    marginVertical: Spacing.xs,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.danger,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  deleteIcon: {
    fontSize: 16,
  },
  deleteText: {
    ...Typography.body,
    color: Colors.danger,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
});

export default AssetDetailsScreen;
