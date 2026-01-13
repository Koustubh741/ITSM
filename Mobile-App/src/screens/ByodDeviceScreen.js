import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  FadeInUp,
  FadeInDown,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Icon components
const MonitorIcon = ({ size = 24, color = '#FF6B35' }) => (
  <Text style={{ fontSize: size, color }}>🖥️</Text>
);

const PhoneIcon = ({ size = 24, color = '#FF6B35' }) => (
  <Text style={{ fontSize: size, color }}>📱</Text>
);

const TabletIcon = ({ size = 24, color = '#FF6B35' }) => (
  <Text style={{ fontSize: size, color }}>📱</Text>
);

const LaptopIcon = ({ size = 24, color = '#FF6B35' }) => (
  <Text style={{ fontSize: size, color }}>💻</Text>
);

const PeripheralIcon = ({ size = 24, color = '#FF6B35' }) => (
  <Text style={{ fontSize: size, color }}>🔌</Text>
);

const BuildingIcon = ({ size = 16, color = '#8E8E93' }) => (
  <Text style={{ fontSize: size, color }}>🏢</Text>
);

const DeviceIcon = ({ size = 16, color = '#8E8E93' }) => (
  <Text style={{ fontSize: size, color }}>📱</Text>
);

const QRCodeIcon = ({ size = 20, color = '#FF6B35' }) => (
  <Text style={{ fontSize: size, color }}>📷</Text>
);

const CameraIcon = ({ size = 20, color = '#FF6B35' }) => (
  <Text style={{ fontSize: size, color }}>📷</Text>
);

const SimCardIcon = ({ size = 16, color = '#8E8E93' }) => (
  <Text style={{ fontSize: size, color }}>📱</Text>
);

const InfoIcon = ({ size = 16, color = '#FF6B35' }) => (
  <Text style={{ fontSize: size, color }}>ℹ️</Text>
);

const CheckIcon = ({ size = 16, color = '#FFFFFF' }) => (
  <Text style={{ fontSize: size, color }}>✓</Text>
);

const ByodDeviceScreen = ({ navigation, onClose }) => {
  const [selectedDeviceType, setSelectedDeviceType] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [operatingSystem, setOperatingSystem] = useState('iOS');
  const [formData, setFormData] = useState({
    // Phone/Tablet fields
    manufacturer: '',
    model: '',
    imei: '',
    simCard: '',
    // Laptop fields
    name: '',
    os: '',
    cpu: '',
    ram: '',
    storage: '',
    serialNumber: '',
    usageJustification: '',
    // Peripheral fields
    peripheralName: '',
    peripheralSerialNumber: '',
    peripheralUsageJustification: '',
  });

  // Animation values - Start device selector in middle of screen
  const deviceSelectorY = useSharedValue(80);
  const deviceSelectorOpacity = useSharedValue(1);
  const titleY = useSharedValue(0);
  const titleOpacity = useSharedValue(1);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(30);
  const previousDeviceType = useSharedValue(null);

  useEffect(() => {
    if (selectedDeviceType) {
      // If switching between device types, fade out form first
      if (previousDeviceType.value !== null && previousDeviceType.value !== selectedDeviceType) {
        formOpacity.value = withTiming(0, {
          duration: 200,
          easing: Easing.in(Easing.ease),
        }, () => {
          // After fade out, update and fade in
          formOpacity.value = withDelay(100, withTiming(1, {
            duration: 400,
            easing: Easing.out(Easing.ease),
          }));
        });
        formTranslateY.value = withTiming(20, {
          duration: 200,
          easing: Easing.in(Easing.ease),
        }, () => {
          formTranslateY.value = withDelay(100, withTiming(0, {
            duration: 400,
            easing: Easing.out(Easing.ease),
          }));
        });
      } else {
        // First time selection - animate device selector upward
        deviceSelectorY.value = withTiming(0, {
          duration: 600,
          easing: Easing.out(Easing.ease),
        });
        
        // Animate title up
        titleY.value = withTiming(-20, {
          duration: 600,
          easing: Easing.out(Easing.ease),
        });

        // Show form fields with delay
        formOpacity.value = withDelay(400, withTiming(1, {
          duration: 500,
          easing: Easing.out(Easing.ease),
        }));
        formTranslateY.value = withDelay(400, withTiming(0, {
          duration: 500,
          easing: Easing.out(Easing.ease),
        }));
      }
      
      // Update step
      setCurrentStep(2);
      previousDeviceType.value = selectedDeviceType;
    } else {
      // Reset when no device selected
      previousDeviceType.value = null;
      formOpacity.value = 0;
      formTranslateY.value = 30;
      deviceSelectorY.value = 80;
      titleY.value = 0;
    }
  }, [selectedDeviceType]);

  const handleDeviceTypeSelect = (type) => {
    setSelectedDeviceType(type);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const deviceSelectorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: deviceSelectorY.value }],
      opacity: deviceSelectorOpacity.value,
    };
  });

  const titleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: titleY.value }],
      opacity: titleOpacity.value,
    };
  });

  const formStyle = useAnimatedStyle(() => {
    return {
      opacity: formOpacity.value,
      transform: [{ translateY: formTranslateY.value }],
    };
  });

  const deviceTypes = [
    { id: 'phone', label: 'Phone', icon: PhoneIcon },
    { id: 'laptop', label: 'Laptop', icon: LaptopIcon },
    { id: 'peripheral', label: 'Peripheral', icon: PeripheralIcon },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        {/* Header with Orange Gradient Glass Effect */}
        <View style={styles.headerContainer}>
          <View style={styles.headerGradient}>
            {/* Gradient layers */}
            <View style={styles.gradientLayer1} />
            <View style={styles.gradientLayer2} />
            <View style={styles.gradientLayer3} />
            {/* Glass overlay */}
            <View style={styles.glassOverlay} />
            
            <View style={styles.headerContent}>
              <View style={styles.headerTop}>
                <TouchableOpacity onPress={onClose || (() => navigation?.goBack())} style={styles.closeButton}>
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
                <View style={styles.headerIconContainer}>
                  <View style={styles.headerIcon}>
                    <MonitorIcon size={28} color="#FF6B35" />
                  </View>
                </View>
                <Text style={styles.headerTitle}>Register BYOD Device</Text>
                <View style={styles.headerSpacer} />
              </View>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          
          {/* Step Indicator */}
          <Animated.View style={[styles.stepContainer, titleStyle]}>
            <Text style={styles.stepText}>
              {selectedDeviceType ? `STEP ${currentStep} OF 3` : 'STEP 1: SELECT DEVICE TYPE'}
            </Text>
          </Animated.View>

          {/* Main Title */}
          <Animated.View style={[styles.titleContainer, titleStyle]}>
            <Text style={styles.mainTitle}>
              {selectedDeviceType ? 'Device Details' : 'What are you registering?'}
            </Text>
            {!selectedDeviceType && (
              <Text style={styles.subtitle}>
                Choose the type of device you want to register to the network.
              </Text>
            )}
          </Animated.View>

          {/* Device Type Selector */}
          <Animated.View style={[styles.deviceSelectorContainer, deviceSelectorStyle]}>
            <View style={styles.deviceTypeRow}>
              {deviceTypes.map((device) => {
                const isSelected = selectedDeviceType === device.id;
                const IconComponent = device.icon;
                return (
                  <Animated.View
                    key={device.id}
                    entering={FadeInUp.delay(device.id === 'phone' ? 0 : device.id === 'laptop' ? 100 : 200).duration(400)}>
                    <TouchableOpacity
                      style={[
                        styles.deviceTypeCard,
                        isSelected && styles.deviceTypeCardSelected,
                      ]}
                      onPress={() => handleDeviceTypeSelect(device.id)}
                      activeOpacity={0.8}>
                      {isSelected && (
                        <Animated.View 
                          entering={FadeInUp.duration(300)}
                          style={styles.selectedDot} />
                      )}
                      <View style={[
                        styles.deviceIconContainer,
                        isSelected && styles.deviceIconContainerSelected,
                      ]}>
                        <IconComponent size={32} color={isSelected ? '#FF6B35' : '#8E8E93'} />
                      </View>
                      <Text style={[
                        styles.deviceTypeLabel,
                        isSelected && styles.deviceTypeLabelSelected,
                      ]}>
                        {device.label}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          </Animated.View>

          {/* Device Details Form */}
          {selectedDeviceType && (
            <Animated.View style={[styles.formContainer, formStyle]}>
              <Animated.View 
                entering={FadeInUp.delay(100).duration(400)}
                style={styles.sectionHeader}>
                <View style={styles.sectionHeaderBar} />
                <Text style={styles.sectionTitle}>DEVICE DETAILS</Text>
              </Animated.View>

              {selectedDeviceType === 'laptop' ? (
                <>
                  {/* Name - Required */}
                  <Animated.View 
                    entering={FadeInUp.delay(200).duration(400)}
                    style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Text style={styles.inputLabel}>Name</Text>
                      <Text style={styles.requiredLabel}>*</Text>
                    </View>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="e.g. My Work Laptop"
                        placeholderTextColor="#8E8E93"
                        value={formData.name}
                        onChangeText={(value) => handleInputChange('name', value)}
                      />
                    </View>
                  </Animated.View>

                  {/* OS and CPU Row */}
                  <Animated.View 
                    entering={FadeInUp.delay(300).duration(400)}
                    style={styles.twoColumnRow}>
                    <View style={[styles.inputGroup, styles.halfWidth]}>
                      <Text style={styles.inputLabel}>OS</Text>
                      <View style={styles.inputWrapper}>
                        <TextInput
                          style={styles.textInput}
                          placeholder="e.g. macOS Sonor"
                          placeholderTextColor="#8E8E93"
                          value={formData.os}
                          onChangeText={(value) => handleInputChange('os', value)}
                        />
                      </View>
                    </View>
                    <View style={[styles.inputGroup, styles.halfWidth]}>
                      <Text style={styles.inputLabel}>CPU</Text>
                      <View style={styles.inputWrapper}>
                        <TextInput
                          style={styles.textInput}
                          placeholder="e.g. M3, i9"
                          placeholderTextColor="#8E8E93"
                          value={formData.cpu}
                          onChangeText={(value) => handleInputChange('cpu', value)}
                        />
                      </View>
                    </View>
                  </Animated.View>

                  {/* RAM and Storage Row */}
                  <Animated.View 
                    entering={FadeInUp.delay(400).duration(400)}
                    style={styles.twoColumnRow}>
                    <View style={[styles.inputGroup, styles.halfWidth]}>
                      <Text style={styles.inputLabel}>RAM</Text>
                      <View style={styles.inputWrapper}>
                        <TextInput
                          style={styles.textInput}
                          placeholder="e.g. 16GB, 64GB"
                          placeholderTextColor="#8E8E93"
                          value={formData.ram}
                          onChangeText={(value) => handleInputChange('ram', value)}
                        />
                      </View>
                    </View>
                    <View style={[styles.inputGroup, styles.halfWidth]}>
                      <Text style={styles.inputLabel}>Storage</Text>
                      <View style={styles.inputWrapper}>
                        <TextInput
                          style={styles.textInput}
                          placeholder="e.g. 512GB SSD"
                          placeholderTextColor="#8E8E93"
                          value={formData.storage}
                          onChangeText={(value) => handleInputChange('storage', value)}
                        />
                      </View>
                    </View>
                  </Animated.View>

                  {/* Serial Number - Required */}
                  <Animated.View 
                    entering={FadeInUp.delay(500).duration(400)}
                    style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Text style={styles.inputLabel}>Serial Number</Text>
                      <Text style={styles.requiredLabel}>*</Text>
                    </View>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Check device back/box"
                        placeholderTextColor="#8E8E93"
                        value={formData.serialNumber}
                        onChangeText={(value) => handleInputChange('serialNumber', value)}
                      />
                    </View>
                  </Animated.View>

                  {/* Usage Justification */}
                  <Animated.View 
                    entering={FadeInUp.delay(600).duration(400)}
                    style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Usage Justification</Text>
                    <View style={styles.textAreaWrapper}>
                      <TextInput
                        style={styles.textArea}
                        placeholder="Why do you need to use your personal device for work?"
                        placeholderTextColor="#8E8E93"
                        value={formData.usageJustification}
                        onChangeText={(value) => handleInputChange('usageJustification', value)}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                      />
                    </View>
                  </Animated.View>

                  {/* Compliance Message */}
                  <Animated.View 
                    entering={FadeInUp.delay(600).duration(400)}
                    style={styles.complianceContainer}>
                    <InfoIcon size={20} />
                    <Text style={styles.complianceText}>
                      By registering, you agree to comply with the company's BYOD security policy and data access guidelines.
                    </Text>
                  </Animated.View>
                </>
              ) : selectedDeviceType === 'peripheral' ? (
                <>
                  {/* Name - Required */}
                  <Animated.View 
                    entering={FadeInUp.delay(200).duration(400)}
                    style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Text style={styles.inputLabel}>Name</Text>
                      <Text style={styles.requiredLabel}>*</Text>
                    </View>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="e.g. My Mouse"
                        placeholderTextColor="#8E8E93"
                        value={formData.peripheralName}
                        onChangeText={(value) => handleInputChange('peripheralName', value)}
                      />
                    </View>
                  </Animated.View>

                  {/* Serial Number - Required */}
                  <Animated.View 
                    entering={FadeInUp.delay(300).duration(400)}
                    style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Text style={styles.inputLabel}>Serial Number</Text>
                      <Text style={styles.requiredLabel}>*</Text>
                    </View>
                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Check device back/box"
                        placeholderTextColor="#8E8E93"
                        value={formData.peripheralSerialNumber}
                        onChangeText={(value) => handleInputChange('peripheralSerialNumber', value)}
                      />
                    </View>
                  </Animated.View>

                  {/* Usage Justification */}
                  <Animated.View 
                    entering={FadeInUp.delay(400).duration(400)}
                    style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Usage Justification</Text>
                    <View style={styles.textAreaWrapper}>
                      <TextInput
                        style={styles.textArea}
                        placeholder="Why do you need to use your personal device for work?"
                        placeholderTextColor="#8E8E93"
                        value={formData.peripheralUsageJustification}
                        onChangeText={(value) => handleInputChange('peripheralUsageJustification', value)}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                      />
                    </View>
                  </Animated.View>

                  {/* Compliance Message */}
                  <Animated.View 
                    entering={FadeInUp.delay(500).duration(400)}
                    style={styles.complianceContainer}>
                    <InfoIcon size={18} />
                    <Text style={styles.complianceText}>
                      By registering, you agree to comply with the company's BYOD security policy and data access guidelines.
                    </Text>
                  </Animated.View>
                </>
              ) : (
                <>
                  {/* Manufacturer */}
                  <Animated.View 
                    entering={FadeInUp.delay(200).duration(400)}
                    style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Manufacturer</Text>
                    <View style={styles.inputWrapper}>
                      <View style={styles.inputIcon}>
                        <BuildingIcon size={18} />
                      </View>
                      <TextInput
                        style={styles.textInput}
                        placeholder="e.g., Apple, Samsung"
                        placeholderTextColor="#8E8E93"
                        value={formData.manufacturer}
                        onChangeText={(value) => handleInputChange('manufacturer', value)}
                      />
                    </View>
                  </Animated.View>

                  {/* Model */}
                  <Animated.View 
                    entering={FadeInUp.delay(300).duration(400)}
                    style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Model</Text>
                    <View style={styles.inputWrapper}>
                      <View style={styles.inputIcon}>
                        <DeviceIcon size={18} />
                      </View>
                      <TextInput
                        style={styles.textInput}
                        placeholder="e.g., iPhone 15, Galaxy S23"
                        placeholderTextColor="#8E8E93"
                        value={formData.model}
                        onChangeText={(value) => handleInputChange('model', value)}
                      />
                    </View>
                  </Animated.View>

                  {/* Operating System */}
                  <Animated.View 
                    entering={FadeInUp.delay(400).duration(400)}
                    style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Operating System</Text>
                    <View style={styles.osSelector}>
                      <TouchableOpacity
                        style={[
                          styles.osOption,
                          operatingSystem === 'iOS' && styles.osOptionSelected,
                        ]}
                        onPress={() => setOperatingSystem('iOS')}
                        activeOpacity={0.8}>
                        <Text style={[
                          styles.osOptionText,
                          operatingSystem === 'iOS' && styles.osOptionTextSelected,
                        ]}>
                          iOS
                        </Text>
                        {operatingSystem === 'iOS' && (
                          <View style={styles.osCheckmark}>
                            <CheckIcon size={12} />
                          </View>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.osOption,
                          operatingSystem === 'Android' && styles.osOptionSelected,
                        ]}
                        onPress={() => setOperatingSystem('Android')}
                        activeOpacity={0.8}>
                        <Text style={[
                          styles.osOptionText,
                          operatingSystem === 'Android' && styles.osOptionTextSelected,
                        ]}>
                          Android
                        </Text>
                        {operatingSystem === 'Android' && (
                          <View style={styles.osCheckmark}>
                            <CheckIcon size={12} />
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  </Animated.View>

                  {/* IMEI / Serial Number */}
                  <Animated.View 
                    entering={FadeInUp.delay(500).duration(400)}
                    style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>IMEI / Serial Number</Text>
                    <View style={styles.inputWrapper}>
                      <View style={styles.inputIcon}>
                        <QRCodeIcon size={20} />
                      </View>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Enter 15-digit IMEI"
                        placeholderTextColor="#8E8E93"
                        value={formData.imei}
                        onChangeText={(value) => handleInputChange('imei', value)}
                        keyboardType="numeric"
                      />
                      <TouchableOpacity style={styles.cameraButton}>
                        <CameraIcon size={20} />
                      </TouchableOpacity>
                    </View>
                  </Animated.View>

                  {/* SIM Card Number */}
                  <Animated.View 
                    entering={FadeInUp.delay(600).duration(400)}
                    style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Text style={styles.inputLabel}>SIM Card Number</Text>
                      <Text style={styles.optionalLabel}>Optional</Text>
                    </View>
                    <View style={styles.inputWrapper}>
                      <View style={styles.inputIcon}>
                        <SimCardIcon size={18} />
                      </View>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Enter SIM ICCID"
                        placeholderTextColor="#8E8E93"
                        value={formData.simCard}
                        onChangeText={(value) => handleInputChange('simCard', value)}
                        keyboardType="numeric"
                      />
                    </View>
                  </Animated.View>

                  {/* Info Message */}
                  <Animated.View 
                    entering={FadeInUp.delay(700).duration(400)}
                    style={styles.infoContainer}>
                    <InfoIcon size={18} />
                    <Text style={styles.infoText}>
                      Make sure the device is unlocked and connected to Wi-Fi before proceeding with registration.
                    </Text>
                  </Animated.View>
                </>
              )}
            </Animated.View>
          )}

          <View style={{ height: Spacing.xxl }} />
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {selectedDeviceType && (
            <TouchableOpacity style={styles.registerButton} activeOpacity={0.9}>
              <Text style={styles.registerButtonText}>Register Device</Text>
              <Text style={styles.registerButtonArrow}>→</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose || (() => navigation?.goBack())}
            activeOpacity={0.7}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5F0',
  },
  keyboardView: {
    flex: 1,
  },
  headerContainer: {
    overflow: 'hidden',
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    backgroundColor: '#FFF5F0',
  },
  headerGradient: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    position: 'relative',
  },
  gradientLayer1: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: '#FFE5DD',
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    opacity: 0.8,
  },
  gradientLayer2: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: '#FFD4C4',
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    opacity: 0.6,
  },
  gradientLayer3: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: '#FFB89A',
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    opacity: 0.4,
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerContent: {
    paddingTop: Spacing.sm,
    zIndex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: Spacing.xs,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 20,
    color: '#1D1D1F',
    fontWeight: '300',
  },
  headerIconContainer: {
    marginLeft: Spacing.md,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    ...Typography.h2,
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1D1F',
    flex: 1,
    textAlign: 'center',
    marginLeft: -40, // Compensate for icon
  },
  headerSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  stepContainer: {
    marginBottom: Spacing.sm,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF6B35',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  titleContainer: {
    marginBottom: Spacing.xl,
  },
  mainTitle: {
    ...Typography.h1,
    fontSize: 24,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  deviceSelectorContainer: {
    marginBottom: Spacing.xl,
  },
  deviceTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  deviceTypeCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  deviceTypeCardSelected: {
    borderWidth: 2,
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F0',
  },
  selectedDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B35',
  },
  deviceIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  deviceIconContainerSelected: {
    backgroundColor: '#FFE5DD',
    borderColor: '#FF6B35',
  },
  deviceTypeLabel: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: '500',
    color: '#1D1D1F',
  },
  deviceTypeLabelSelected: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  formContainer: {
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  sectionHeaderBar: {
    width: 4,
    height: 20,
    backgroundColor: '#FF6B35',
    borderRadius: 2,
    marginRight: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.caption,
    fontSize: 13,
    fontWeight: '700',
    color: '#1D1D1F',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  halfWidth: {
    flex: 1,
    marginBottom: 0,
  },
  requiredLabel: {
    ...Typography.caption,
    fontSize: 13,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 4,
  },
  textAreaWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    minHeight: 100,
    padding: Spacing.md,
  },
  textArea: {
    ...Typography.body,
    fontSize: 15,
    color: '#1D1D1F',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  complianceContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF5F0',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  complianceText: {
    flex: 1,
    ...Typography.body,
    fontSize: 13,
    color: '#1D1D1F',
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    ...Typography.caption,
    fontSize: 13,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: Spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  optionalLabel: {
    ...Typography.caption,
    fontSize: 12,
    color: '#8E8E93',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingHorizontal: Spacing.md,
    minHeight: 50,
  },
  inputIcon: {
    marginRight: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    ...Typography.body,
    fontSize: 15,
    color: '#1D1D1F',
    paddingVertical: Spacing.sm,
  },
  cameraButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  osSelector: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  osOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.round,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    gap: Spacing.xs,
  },
  osOptionSelected: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  osOptionText: {
    ...Typography.body,
    fontSize: 15,
    fontWeight: '500',
    color: '#1D1D1F',
  },
  osOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  osCheckmark: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF5F0',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    ...Typography.body,
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: '#FFF5F0',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B35',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    gap: Spacing.xs,
  },
  registerButtonText: {
    ...Typography.h3,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  registerButtonArrow: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  cancelButtonText: {
    ...Typography.body,
    fontSize: 15,
    fontWeight: '500',
    color: '#1D1D1F',
  },
});

export default ByodDeviceScreen;
