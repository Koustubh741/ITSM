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
const TicketIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Text style={{ fontSize: size, color }}>🎫</Text>
);

const WarningIcon = ({ size = 20, color = '#FF6B35' }) => (
  <Text style={{ fontSize: size, color }}>⚠️</Text>
);

const ChevronDownIcon = ({ size = 12, color = '#8E8E93' }) => (
  <Text style={{ fontSize: size, color }}>▼</Text>
);

const RaiseTicketScreen = ({ navigation, onClose }) => {
  const [assetInvolved, setAssetInvolved] = useState('-- No specific asset --');
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);
  const [issueCategory, setIssueCategory] = useState('Hardware Fault');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
  });

  const assetOptions = [
    '-- No specific asset --',
    'iPhone 17',
    'MacBook Pro',
    'Dell Monitor',
    'HP Laptop',
  ];

  const categoryOptions = [
    'Hardware Fault',
    'Software Issue',
    'Network Problem',
    'Account Access',
    'Password Reset',
    'Other',
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateTicket = () => {
    // Handle ticket creation
    console.log('Ticket created:', { assetInvolved, issueCategory, ...formData });
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
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIcon}>
                <TicketIcon size={18} />
              </View>
              <Text style={styles.headerTitle}>Raise Support Ticket</Text>
            </View>
            <TouchableOpacity 
              onPress={onClose || (() => navigation?.goBack())} 
              style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          
          {/* Asset Involved Section */}
          <Animated.View entering={FadeInUp.delay(100).duration(400)} style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>Asset Involved</Text>
              <Text style={styles.optionalLabel}>(Optional)</Text>
            </View>
            <TouchableOpacity
              style={styles.dropdownInput}
              onPress={() => setShowAssetDropdown(true)}
              activeOpacity={0.8}>
              <Text style={[
                styles.dropdownText,
                assetInvolved === '-- No specific asset --' && styles.dropdownTextPlaceholder,
              ]}>
                {assetInvolved}
              </Text>
              <ChevronDownIcon size={12} />
            </TouchableOpacity>
            <Modal
              visible={showAssetDropdown}
              transparent
              animationType="fade"
              onRequestClose={() => setShowAssetDropdown(false)}>
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowAssetDropdown(false)}>
                <View style={styles.dropdownOptions}>
                  <FlatList
                    data={assetOptions}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.dropdownOption,
                          assetInvolved === item && styles.dropdownOptionSelected,
                        ]}
                        onPress={() => {
                          setAssetInvolved(item);
                          setShowAssetDropdown(false);
                        }}
                        activeOpacity={0.7}>
                        <Text
                          style={[
                            styles.dropdownOptionText,
                            assetInvolved === item && styles.dropdownOptionTextSelected,
                          ]}>
                          {item}
                        </Text>
                        {assetInvolved === item && <Text style={styles.checkmark}>✓</Text>}
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </TouchableOpacity>
            </Modal>
          </Animated.View>

          {/* Subject Section */}
          <Animated.View entering={FadeInUp.delay(200).duration(400)} style={styles.section}>
            <Text style={styles.inputLabel}>Subject</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Brief summary of the issue"
              placeholderTextColor="#8E8E93"
              value={formData.subject}
              onChangeText={(value) => handleInputChange('subject', value)}
            />
          </Animated.View>

          {/* Issue Category Section */}
          <Animated.View entering={FadeInUp.delay(300).duration(400)} style={styles.section}>
            <Text style={styles.inputLabel}>Issue Category</Text>
            <TouchableOpacity
              style={styles.dropdownInput}
              onPress={() => setShowCategoryDropdown(true)}
              activeOpacity={0.8}>
              <Text style={styles.dropdownText}>{issueCategory}</Text>
              <ChevronDownIcon size={12} />
            </TouchableOpacity>
            <Modal
              visible={showCategoryDropdown}
              transparent
              animationType="fade"
              onRequestClose={() => setShowCategoryDropdown(false)}>
              <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setShowCategoryDropdown(false)}>
                <View style={styles.dropdownOptions}>
                  <FlatList
                    data={categoryOptions}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.dropdownOption,
                          issueCategory === item && styles.dropdownOptionSelected,
                        ]}
                        onPress={() => {
                          setIssueCategory(item);
                          setShowCategoryDropdown(false);
                        }}
                        activeOpacity={0.7}>
                        <Text
                          style={[
                            styles.dropdownOptionText,
                            issueCategory === item && styles.dropdownOptionTextSelected,
                          ]}>
                          {item}
                        </Text>
                        {issueCategory === item && <Text style={styles.checkmark}>✓</Text>}
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </TouchableOpacity>
            </Modal>
          </Animated.View>

          {/* Description Section */}
          <Animated.View entering={FadeInUp.delay(400).duration(400)} style={styles.section}>
            <Text style={styles.inputLabel}>Description</Text>
            <View style={styles.textAreaWrapper}>
              <TextInput
                style={styles.textArea}
                placeholder="Describe the issue in detail..."
                placeholderTextColor="#8E8E93"
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
          </Animated.View>

          {/* Alert/Info Box */}
          <Animated.View entering={FadeInUp.delay(500).duration(400)} style={styles.alertContainer}>
            <View style={styles.alertIconContainer}>
              <WarningIcon size={20} />
            </View>
            <View style={styles.alertTextContainer}>
              <Text style={styles.alertText}>
                For critical outages blocking your work, please call the IT Helpdesk directly at{' '}
                <Text style={styles.alertPhoneNumber}>x4499</Text>.
              </Text>
            </View>
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
            style={styles.createButton}
            onPress={handleCreateTicket}
            activeOpacity={0.9}>
            <Text style={styles.createButtonText}>Create Ticket</Text>
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
    backgroundColor: '#FFF5F0',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  headerContent: {
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
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  section: {
    marginBottom: Spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  inputLabel: {
    ...Typography.body,
    fontSize: 13,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: Spacing.xs,
  },
  optionalLabel: {
    ...Typography.caption,
    fontSize: 11,
    color: '#8E8E93',
    marginLeft: Spacing.xs,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownText: {
    ...Typography.body,
    fontSize: 13,
    color: '#1D1D1F',
    flex: 1,
  },
  dropdownTextPlaceholder: {
    color: '#8E8E93',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textAreaWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    padding: Spacing.sm,
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textArea: {
    ...Typography.body,
    fontSize: 13,
    color: '#1D1D1F',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  alertContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFE5DD',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#FFD4C4',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: Spacing.sm,
  },
  alertIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertText: {
    ...Typography.body,
    fontSize: 12,
    color: '#1D1D1F',
    lineHeight: 18,
  },
  alertPhoneNumber: {
    fontWeight: '700',
    color: '#FF6B35',
    textDecorationLine: 'underline',
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
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelButtonText: {
    ...Typography.h3,
    fontSize: 15,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  createButton: {
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
  createButtonText: {
    ...Typography.h3,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default RaiseTicketScreen;
