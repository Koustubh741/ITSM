import React, { useState } from 'react';
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
  Modal,
  FlatList,
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
const LaptopIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Text style={{ fontSize: size, color }}>💻</Text>
);

const ChevronDownIcon = ({ size = 12, color = '#8E8E93' }) => (
  <Text style={{ fontSize: size, color }}>▼</Text>
);

const RequestAssetScreen = ({ navigation, onClose }) => {
  const [assetType, setAssetType] = useState('Laptop (Standard)');
  const [showAssetTypeDropdown, setShowAssetTypeDropdown] = useState(false);
  const [urgency, setUrgency] = useState('Standard');
  const [formData, setFormData] = useState({
    operatingSystem: '',
    cpu: '',
    ram: '',
    storage: '',
    reason: '',
  });

  const assetTypeOptions = [
    'Laptop (Standard)',
    'Laptop (Premium)',
    'Desktop',
    'Monitor',
    'Tablet',
    'Phone',
    'Peripheral',
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // Handle form submission
    console.log('Form submitted:', { assetType, urgency, ...formData });
    // Navigate back or show success message
    if (onClose) {
      onClose();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        {/* Header with Light Orange Gradient Glass Effect */}
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
                <View style={styles.headerLeft}>
                  <View style={styles.headerIcon}>
                    <LaptopIcon size={20} />
                  </View>
                  <Text style={styles.headerTitle}>Request New Asset</Text>
                </View>
                <TouchableOpacity 
                  onPress={onClose || (() => navigation?.goBack())} 
                  style={styles.closeButton}>
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          
          {/* Main Content Card */}
          <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.contentCard}>
            
            {/* ASSET TYPE Section */}
            <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.section}>
              <Text style={styles.sectionHeader}>ASSET TYPE</Text>
              <TouchableOpacity
                style={styles.dropdownInput}
                onPress={() => setShowAssetTypeDropdown(true)}
                activeOpacity={0.8}>
                <Text style={styles.dropdownText}>{assetType}</Text>
                <ChevronDownIcon size={12} />
              </TouchableOpacity>
              <Modal
                visible={showAssetTypeDropdown}
                transparent
                animationType="fade"
                onRequestClose={() => setShowAssetTypeDropdown(false)}>
                <TouchableOpacity
                  style={styles.modalOverlay}
                  activeOpacity={1}
                  onPress={() => setShowAssetTypeDropdown(false)}>
                  <View style={styles.dropdownOptions}>
                    <FlatList
                      data={assetTypeOptions}
                      keyExtractor={(item) => item}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[
                            styles.dropdownOption,
                            assetType === item && styles.dropdownOptionSelected,
                          ]}
                          onPress={() => {
                            setAssetType(item);
                            setShowAssetTypeDropdown(false);
                          }}
                          activeOpacity={0.7}>
                          <Text
                            style={[
                              styles.dropdownOptionText,
                              assetType === item && styles.dropdownOptionTextSelected,
                            ]}>
                            {item}
                          </Text>
                          {assetType === item && <Text style={styles.checkmark}>✓</Text>}
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                </TouchableOpacity>
              </Modal>
            </Animated.View>

            {/* SPECIFICATIONS Section */}
            <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.section}>
              <Text style={[styles.sectionHeader, styles.specificationsHeader]}>SPECIFICATIONS</Text>
              <View style={styles.specificationsGrid}>
                {/* Operating System */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Operating System</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Windows 11"
                    placeholderTextColor="#8E8E93"
                    value={formData.operatingSystem}
                    onChangeText={(value) => handleInputChange('operatingSystem', value)}
                  />
                </View>

                {/* CPU / Processor */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>CPU / Processor</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. i7-13th Gen"
                    placeholderTextColor="#8E8E93"
                    value={formData.cpu}
                    onChangeText={(value) => handleInputChange('cpu', value)}
                  />
                </View>

                {/* RAM / Memory */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>RAM / Memory</Text>
                  <TextInput
                    style={[styles.textInput, styles.textInputFocused]}
                    placeholder="e.g. 16GB, 32GB"
                    placeholderTextColor="#8E8E93"
                    value={formData.ram}
                    onChangeText={(value) => handleInputChange('ram', value)}
                  />
                </View>

                {/* Storage Capacity */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Storage Capacity</Text>
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

            {/* REASON FOR REQUEST Section */}
            <Animated.View entering={FadeInUp.delay(400).duration(400)} style={styles.section}>
              <Text style={styles.sectionHeader}>REASON FOR REQUEST</Text>
              <View style={styles.textAreaWrapper}>
                <TextInput
                  style={styles.textArea}
                  placeholder="e.g., Current laptop is slow, Need monitor for dual-screen setup..."
                  placeholderTextColor="#8E8E93"
                  value={formData.reason}
                  onChangeText={(value) => handleInputChange('reason', value)}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </Animated.View>

            {/* URGENCY Section */}
            <Animated.View entering={FadeInUp.delay(500).duration(400)} style={styles.section}>
              <Text style={styles.sectionHeader}>URGENCY</Text>
              <View style={styles.urgencyContainer}>
                <TouchableOpacity
                  style={styles.radioButton}
                  onPress={() => setUrgency('Standard')}
                  activeOpacity={0.8}>
                  <View style={[
                    styles.radioCircle,
                    urgency === 'Standard' && styles.radioCircleSelected,
                  ]}>
                    {urgency === 'Standard' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioLabel}>Standard</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioButton}
                  onPress={() => setUrgency('High')}
                  activeOpacity={0.8}>
                  <View style={[
                    styles.radioCircle,
                    urgency === 'High' && styles.radioCircleSelected,
                  ]}>
                    {urgency === 'High' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioLabel}>High</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>

          <View style={{ height: Spacing.xl }} />
        </ScrollView>

        {/* Bottom Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose || (() => navigation?.goBack())}
            activeOpacity={0.7}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            activeOpacity={0.9}>
            <Text style={styles.submitButtonText}>Submit Request</Text>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  headerTitle: {
    ...Typography.h2,
    fontSize: 18,
    fontWeight: '700',
    color: '#1D1D1F',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 16,
    color: '#1D1D1F',
    fontWeight: '300',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '700',
    color: '#1D1D1F',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  specificationsHeader: {
    color: '#FF6B35',
  },
  dropdownInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    minHeight: 40,
    marginTop: Spacing.xs,
  },
  dropdownText: {
    ...Typography.body,
    fontSize: 13,
    color: '#1D1D1F',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  dropdownOptions: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: '100%',
    maxHeight: 300,
  },
  dropdownOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  dropdownOptionSelected: {
    backgroundColor: '#FFF5F0',
  },
  dropdownOptionText: {
    ...Typography.body,
    fontSize: 13,
    color: '#1D1D1F',
    flex: 1,
  },
  dropdownOptionTextSelected: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  specificationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.xs,
    marginHorizontal: -Spacing.xs,
  },
  inputGroup: {
    width: '50%',
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...Typography.caption,
    fontSize: 12,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: Spacing.xs,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    ...Typography.body,
    fontSize: 13,
    color: '#1D1D1F',
    minHeight: 40,
  },
  textInputFocused: {
    borderColor: '#FF6B35',
  },
  textAreaWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    padding: Spacing.sm,
    marginTop: Spacing.xs,
    minHeight: 100,
  },
  textArea: {
    ...Typography.body,
    fontSize: 13,
    color: '#1D1D1F',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  urgencyContainer: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: Spacing.xs,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  radioCircleSelected: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  radioLabel: {
    ...Typography.body,
    fontSize: 13,
    fontWeight: '500',
    color: '#1D1D1F',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: '#FFF5F0',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    ...Typography.h3,
    fontSize: 15,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    ...Typography.h3,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default RequestAssetScreen;
