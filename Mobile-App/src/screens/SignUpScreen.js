import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  FadeInUp,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnimatedInput from '../components/AnimatedInput';
import Dropdown from '../components/Dropdown';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing, BorderRadius } from '../constants/spacing';

const SignUpScreen = ({ navigation, onBack, onSignUpSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    workEmail: '',
    password: '',
    confirmPassword: '',
    role: '',
    position: '',
    location: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const buttonScale = useSharedValue(1);

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Reset position when role changes to something other than "User"
      if (field === 'role' && value !== 'User') {
        updated.position = '';
      }
      return updated;
    });
  };

  const handlePositionSelect = (position) => {
    setFormData((prev) => ({ ...prev, position }));
  };

  const handleCreateAccount = () => {
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (onSignUpSuccess) {
        onSignUpSuccess();
      } else if (navigation) {
        navigation.navigate('login');
      }
    }, 1000);
  };

  const handleBack = () => {
    if (onBack) onBack();
    else if (navigation) navigation.goBack();
  };

  const handleLogin = () => {
    if (navigation) {
      navigation.navigate('login');
    }
  };

  const roles = ['Admin', 'Manager', 'User', 'Viewer'];
  const locations = ['New York', 'London', 'Tokyo', 'San Francisco', 'Berlin'];

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sign Up</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeInUp.delay(100).duration(600)}>
            <View style={styles.titleSection}>
              <Text style={styles.mainTitle}>Create Account</Text>
              <Text style={styles.description}>
                Join the ITSM platform to manage your IT assets efficiently.
              </Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(600)}>
            <View style={styles.form}>
              <AnimatedInput
                label="FULL NAME"
                placeholder="John Doe"
                value={formData.fullName}
                onChangeText={(value) => handleInputChange('fullName', value)}
                autoCapitalize="words"
              />

              <AnimatedInput
                label="WORK EMAIL"
                placeholder="john.doe@company.com"
                value={formData.workEmail}
                onChangeText={(value) => handleInputChange('workEmail', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <AnimatedInput
                label="PASSWORD"
                placeholder="••••••••"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry={!showPassword}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.iconButton}>
                    <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️'}</Text>
                  </TouchableOpacity>
                }
              />

              <AnimatedInput
                label="CONFIRM PASSWORD"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                secureTextEntry={!showConfirmPassword}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.iconButton}>
                    <Text style={styles.eyeIcon}>
                      {showConfirmPassword ? '👁️' : '👁️'}
                    </Text>
                  </TouchableOpacity>
                }
              />

              <View style={styles.inputGroup}>
                <Text style={styles.label}>ROLE</Text>
                <Dropdown
                  options={roles}
                  selected={formData.role}
                  onSelect={(value) => handleInputChange('role', value)}
                  placeholder="Select your role"
                />
              </View>

              {/* Position Selection - Only show when role is "User" */}
              {formData.role === 'User' && (
                <Animated.View 
                  entering={FadeInUp.delay(300).duration(400)}
                  style={styles.inputGroup}>
                  <Text style={styles.label}>POSITION</Text>
                  <View style={styles.positionContainer}>
                    <TouchableOpacity
                      style={[
                        styles.positionOption,
                        formData.position === 'Team Member' && styles.positionOptionSelected,
                      ]}
                      onPress={() => handlePositionSelect('Team Member')}
                      activeOpacity={0.8}>
                      <Text
                        style={[
                          styles.positionOptionText,
                          formData.position === 'Team Member' && styles.positionOptionTextSelected,
                        ]}>
                        Team Member
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.positionOption,
                        formData.position === 'Manager' && styles.positionOptionSelected,
                      ]}
                      onPress={() => handlePositionSelect('Manager')}
                      activeOpacity={0.8}>
                      <Text
                        style={[
                          styles.positionOptionText,
                          formData.position === 'Manager' && styles.positionOptionTextSelected,
                        ]}>
                        Manager
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>LOCATION</Text>
                <Dropdown
                  options={locations}
                  selected={formData.location}
                  onSelect={(value) => handleInputChange('location', value)}
                  placeholder="Select city/office"
                />
              </View>

              <Animated.View style={buttonStyle}>
                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handleCreateAccount}
                  activeOpacity={0.9}
                  disabled={loading}>
                  <View style={styles.buttonGradientBase} />
                  <View style={styles.buttonGradientTop} />
                  <View style={styles.buttonContent}>
                    <Text style={styles.createButtonText}>
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>

              <View style={styles.loginLinkContainer}>
                <Text style={styles.loginLinkText}>Already have an account? </Text>
                <TouchableOpacity onPress={handleLogin}>
                  <Text style={styles.loginLink}>Log In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.warmBackground,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 10 : 0,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.warmBorder,
  },
  backButton: {
    padding: Spacing.xs,
  },
  backIcon: {
    fontSize: 20,
    color: Colors.warmText,
    fontWeight: '600',
  },
  headerTitle: {
    ...Typography.h2,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.warmText,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  titleSection: {
    marginBottom: Spacing.xl,
  },
  mainTitle: {
    ...Typography.h1,
    fontSize: 22,
    color: Colors.warmText,
    marginBottom: Spacing.sm,
  },
  description: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.warmTextSecondary,
    lineHeight: 19,
  },
  form: {
    marginTop: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: Colors.warmTextSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  positionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  positionOption: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.warmBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  positionOptionLast: {
    marginRight: 0,
  },
  positionOptionSelected: {
    backgroundColor: Colors.orange,
    borderColor: Colors.orange,
  },
  positionOptionText: {
    ...Typography.body,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.warmText,
  },
  positionOptionTextSelected: {
    color: Colors.white,
  },
  iconButton: {
    padding: Spacing.xs,
  },
  eyeIcon: {
    fontSize: 18,
  },
  createButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    position: 'relative',
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradientBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FF8C42',
  },
  buttonGradientTop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFB380',
    opacity: 0.7,
    borderTopLeftRadius: BorderRadius.md,
    borderTopRightRadius: BorderRadius.md,
    height: '45%',
  },
  buttonContent: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  createButtonText: {
    ...Typography.h3,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  loginLinkText: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.warmTextSecondary,
  },
  loginLink: {
    ...Typography.body,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.orange,
  },
});

export default SignUpScreen;
