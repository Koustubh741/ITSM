import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  FadeInUp,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnimatedInput from '../components/AnimatedInput';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';

const BackIcon = () => <Text style={styles.iconText}>←</Text>;
const CloudUploadIcon = () => <Text style={styles.iconText}>☁️</Text>;
const FolderIcon = () => <Text style={styles.iconText}>📁</Text>;
const ChevronDownIcon = () => <Text style={styles.iconText}>▼</Text>;
const QRCodeIcon = () => <Text style={styles.iconText}>📷</Text>;
const LocationIcon = () => <Text style={styles.iconText}>📍</Text>;
const CalendarIcon = () => <Text style={styles.iconText}>📅</Text>;
const DocumentIcon = () => <Text style={styles.iconText}>📄</Text>;

const AnimatedDropdown = ({ label, options, selected, onSelect, style, leftIcon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const scale = useSharedValue(1);
  const borderColor = useSharedValue(Colors.warmBorder);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: borderColor.value,
  }));

  const animatedArrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(isOpen ? '180deg' : '0deg', { duration: 200 }) }],
  }));

  const handlePress = () => {
    setIsOpen(true);
    scale.value = withTiming(1.02, { duration: 200 });
    borderColor.value = withTiming(Colors.warmPrimary, { duration: 200 });
  };

  const handleClose = () => {
    setIsOpen(false);
    scale.value = withTiming(1, { duration: 200 });
    borderColor.value = withTiming(Colors.warmBorder, { duration: 200 });
  };

  const handleSelect = (option) => {
    onSelect(option);
    handleClose();
  };

  return (
    <View style={[styles.dropdownContainer, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        <Animated.View style={[styles.dropdownButton, animatedContainerStyle]}>
          {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
          <Text style={[styles.dropdownText, !selected && styles.dropdownPlaceholder]}>
            {selected || 'Select'}
          </Text>
          <Animated.View style={animatedArrowStyle}>
            <ChevronDownIcon />
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>

      {isOpen && (
        <Modal
          visible={isOpen}
          transparent
          animationType="fade"
          onRequestClose={handleClose}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleClose}>
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
              style={styles.dropdownMenu}>
              <FlatList
                data={options}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.dropdownOption,
                      selected === item && styles.dropdownOptionSelected,
                    ]}
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.7}>
                    <Text
                      style={[
                        styles.dropdownOptionText,
                        selected === item && styles.dropdownOptionTextSelected,
                      ]}>
                      {item}
                    </Text>
                    {selected === item && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                )}
              />
            </Animated.View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

const AnimatedButton = ({ title, onPress, icon, style }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 100 });
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}>
      <Animated.View style={[styles.button, style, animatedStyle]}>
        {icon && <View style={styles.buttonIconContainer}>{icon}</View>}
        <Text style={styles.buttonText}>{title}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const AddAssetScreen = ({ navigation }) => {
  const [assetName, setAssetName] = useState('');
  const [segment, setSegment] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('In Use');
  const [vendor, setVendor] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [location, setLocation] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [warrantyExpiry, setWarrantyExpiry] = useState('');
  const [cpu, setCpu] = useState('');
  const [ram, setRam] = useState('');
  const [storage, setStorage] = useState('');

  const segmentOptions = ['IT Equipment', 'Furniture', 'Vehicles', 'Other'];
  const typeOptions = ['Laptop', 'Desktop', 'Tablet', 'Mobile', 'Other'];
  const statusOptions = ['In Use', 'In Stock', 'In Repair', 'Retired'];
  const locationOptions = ['New York Office', 'San Francisco Office', 'Remote', 'Warehouse'];

  const handleSave = () => {
    console.log('Saving asset...');
    if (navigation) {
      navigation.goBack();
    }
  };

  const handleFileSelect = () => {
    console.log('Selecting file...');
  };

  const handleQRScan = () => {
    console.log('Scanning QR code...');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View entering={FadeInUp.delay(50).duration(600)} style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Asset</Text>
        <View style={styles.headerSpacer} />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(100).duration(600)}>
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <CloudUploadIcon />
              <Text style={styles.sectionTitle}>Smart Import</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Upload CSV or Excel file to bulk import assets automatically.
            </Text>
            <AnimatedButton
              title="Select File"
              icon={<FolderIcon />}
              onPress={handleFileSelect}
              style={styles.selectFileButton}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(600)}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <AnimatedInput
              label="Asset Name"
              placeholder="e.g. MacBook Pro M3"
              value={assetName}
              onChangeText={setAssetName}
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <AnimatedDropdown
                  label="Segment"
                  options={segmentOptions}
                  selected={segment}
                  onSelect={setSegment}
                />
              </View>
              <View style={styles.halfWidth}>
                <AnimatedDropdown
                  label="Type"
                  options={typeOptions}
                  selected={type}
                  onSelect={setType}
                />
              </View>
            </View>

            <AnimatedDropdown
              label="Status"
              options={statusOptions}
              selected={status}
              onSelect={setStatus}
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <AnimatedInput
                  label="Vendor"
                  placeholder="Apple"
                  value={vendor}
                  onChangeText={setVendor}
                />
              </View>
              <View style={styles.halfWidth}>
                <AnimatedInput
                  label="Model"
                  placeholder="A2141"
                  value={model}
                  onChangeText={setModel}
                />
              </View>
            </View>

            <AnimatedInput
              label="Serial Number"
              placeholder="Enter or scan SN"
              value={serialNumber}
              onChangeText={setSerialNumber}
              rightIcon={<QRCodeIcon />}
              onRightIconPress={handleQRScan}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(600)}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Details & Specs</Text>

            <AnimatedDropdown
              label="Location"
              options={locationOptions}
              selected={location}
              onSelect={setLocation}
              leftIcon={<LocationIcon />}
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <AnimatedInput
                  label="Purchase Date"
                  placeholder="mm/dd/yyyy"
                  value={purchaseDate}
                  onChangeText={setPurchaseDate}
                  rightIcon={<CalendarIcon />}
                />
              </View>
              <View style={styles.halfWidth}>
                <AnimatedInput
                  label="Warranty Expiry"
                  placeholder="mm/dd/yyyy"
                  value={warrantyExpiry}
                  onChangeText={setWarrantyExpiry}
                  rightIcon={<CalendarIcon />}
                />
              </View>
            </View>

            <Text style={styles.subsectionTitle}>Specifications</Text>

            <AnimatedInput
              label="CPU"
              placeholder="e.g. Intel Core i7 or M3 Pro"
              value={cpu}
              onChangeText={setCpu}
            />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <AnimatedInput
                  label="RAM"
                  placeholder="e.g. 16GB"
                  value={ram}
                  onChangeText={setRam}
                />
              </View>
              <View style={styles.halfWidth}>
                <AnimatedInput
                  label="Storage"
                  placeholder="e.g. 512GB SSD"
                  value={storage}
                  onChangeText={setStorage}
                />
              </View>
            </View>
          </View>
        </Animated.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <Animated.View entering={FadeInUp.delay(400).duration(600)} style={styles.saveButtonContainer}>
        <AnimatedButton
          title="Save Asset"
          icon={<DocumentIcon />}
          onPress={handleSave}
          style={styles.saveButton}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

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
    paddingVertical: Spacing.md,
    backgroundColor: Colors.warmBackground,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.warmText,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.warmCardBackground,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.warmText,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  sectionDescription: {
    ...Typography.bodySmall,
    color: Colors.warmTextSecondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  subsectionTitle: {
    ...Typography.h3,
    color: Colors.warmText,
    fontWeight: '700',
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.bodySmall,
    color: Colors.warmText,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  dropdownContainer: {
    marginBottom: Spacing.md,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warmInputBackground,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.warmBorder,
    paddingHorizontal: Spacing.md,
    minHeight: 50,
  },
  leftIconContainer: {
    marginRight: Spacing.sm,
  },
  dropdownText: {
    flex: 1,
    ...Typography.body,
    color: Colors.warmText,
  },
  dropdownPlaceholder: {
    color: Colors.warmTextSecondary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownMenu: {
    backgroundColor: Colors.warmCardBackground,
    borderRadius: BorderRadius.md,
    minWidth: 250,
    maxHeight: 300,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  dropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.warmBorder,
  },
  dropdownOptionSelected: {
    backgroundColor: Colors.warmInputBackground,
  },
  dropdownOptionText: {
    ...Typography.body,
    color: Colors.warmText,
  },
  dropdownOptionTextSelected: {
    color: Colors.warmPrimary,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: Colors.warmPrimary,
    fontWeight: 'bold',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.warmPrimary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  selectFileButton: {
    marginTop: Spacing.sm,
  },
  buttonIconContainer: {
    marginRight: Spacing.sm,
  },
  buttonText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '600',
  },
  saveButtonContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.warmBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.warmBorder,
  },
  saveButton: {
    width: '100%',
  },
  bottomSpacer: {
    height: Spacing.xl,
  },
  iconText: {
    fontSize: 20,
    color: Colors.warmText,
  },
});

export default AddAssetScreen;
