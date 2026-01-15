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
  Alert,
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
import SuccessPopup from '../components/SuccessPopup';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing, BorderRadius } from '../constants/spacing';

// API Base URL - Update this to match your backend server
// For Android Emulator: use 'http://10.0.2.2:8000'
// For iOS Simulator: use 'http://localhost:8000' or 'http://127.0.0.1:8000'
// For Physical Device: use your computer's IP address
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.0.25:8000'  // Physical device - your laptop IP
  : 'https://your-production-api.com';  // Production URL

const SignUpScreen = ({ navigation, onBack, onSignUpSuccess, onSignUpToLogin }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    workEmail: '',
    password: '',
    confirmPassword: '',
    role: '',
    position: '',
    domain: '',
    company: '',
    location: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [errors, setErrors] = useState({});

  const buttonScale = useSharedValue(1);

  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Reset position and domain when role changes to something other than "End User"
      if (field === 'role' && value !== 'End User') {
        updated.position = '';
        updated.domain = '';
      }
      return updated;
    });
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.workEmail.trim()) {
      newErrors.workEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.workEmail)) {
      newErrors.workEmail = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!formData.location) {
      newErrors.location = 'Location is required';
    }

    // Validate End User specific fields
    if (formData.role === 'End User') {
      if (!formData.position) {
        newErrors.position = 'Position is required';
      }
      if (!formData.domain) {
        newErrors.domain = 'Domain is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Map role from UI to backend format
  const mapRoleToBackend = (role) => {
    const roleMap = {
      'Admin': 'ADMIN',
      'Manager': 'MANAGER',
      'End User': 'END_USER',
      'Viewer': 'VIEWER',
    };
    return roleMap[role] || 'END_USER';
  };

  // Map position from UI to backend format
  const mapPositionToBackend = (position) => {
    const positionMap = {
      'Team Member': 'TEAM_MEMBER',
      'Manager': 'MANAGER',
    };
    return positionMap[position] || null;
  };

  // Map domain from UI to backend format
  const mapDomainToBackend = (domain) => {
    const domainMap = {
      'Cloud': 'CLOUD',
      'DATA-AI': 'DATA_AI',
      'Security': 'SECURITY',
    };
    return domainMap[domain] || null;
  };

  const handleCreateAccount = async () => {
    // Validate form
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    
    setLoading(true);
    setErrors({});

    try {
      // Prepare data for API
      const registrationData = {
        email: formData.workEmail.trim(),
        password: formData.password,
        full_name: formData.fullName.trim(),
        role: mapRoleToBackend(formData.role),
        company: formData.company.trim(),
        location: formData.location,
        phone: formData.phone || null,
        department: formData.department || null,
      };

      // Add End User specific fields
      if (formData.role === 'End User') {
        registrationData.position = mapPositionToBackend(formData.position);
        registrationData.domain = mapDomainToBackend(formData.domain);
      }

      // Log the request for debugging
      console.log('Registering user:', {
        url: `${API_BASE_URL}/auth/register`,
        data: { ...registrationData, password: '***' }, // Hide password in logs
      });

      // Call register API
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      console.log('Response status:', response.status);

      // Try to parse JSON response
      let data;
      try {
        const text = await response.text();
        console.log('Response text:', text);
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response from server. Please check if backend is running.');
      }

      if (!response.ok) {
        const errorMessage = data.detail || data.message || `Server error: ${response.status}`;
        console.error('Registration failed:', errorMessage);
        throw new Error(errorMessage);
      }

      console.log('Registration successful:', data);

      // Success - Show popup
      setLoading(false);
      setShowSuccessPopup(true);

      // Auto navigate to login after popup
      setTimeout(() => {
        setShowSuccessPopup(false);
        if (onSignUpSuccess) {
          onSignUpSuccess();
        } else if (navigation) {
          navigation.navigate('login');
        }
      }, 2500); // 2.5 seconds (popup shows for 2 seconds, then navigate)

    } catch (error) {
      setLoading(false);
      console.error('Registration error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Unable to create account. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
        errorMessage = `Network request failed. Please check:\n\n1. Backend server is running\n2. Server is accessible at ${API_BASE_URL}\n3. Phone and laptop are on same Wi-Fi\n4. Firewall is not blocking port 8000`;
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = `Cannot connect to server at ${API_BASE_URL}\n\nPlease verify:\n- Backend is running with: uvicorn main:app --host 0.0.0.0 --port 8000\n- IP address is correct: 192.168.0.25`;
      }
      
      Alert.alert(
        'Registration Failed',
        errorMessage,
        [{ text: 'OK' }]
      );
    }
  };

  const handleClosePopup = () => {
    setShowSuccessPopup(false);
    if (onSignUpSuccess) {
      onSignUpSuccess();
    } else if (navigation) {
      navigation.navigate('login');
    }
  };

  const handleBack = () => {
    if (onBack) onBack();
    else if (navigation) navigation.goBack();
  };

  const handleLogin = () => {
    if (onSignUpToLogin) {
      onSignUpToLogin();
    } else if (navigation) {
      navigation.navigate('login');
    }
  };

  const roles = ['Admin', 'Manager', 'End User', 'Viewer'];
  const positions = ['Team Member', 'Manager'];
  const domains = ['Cloud', 'DATA-AI', 'Security'];
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
              <View>
                <AnimatedInput
                  label="FULL NAME"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChangeText={(value) => handleInputChange('fullName', value)}
                  autoCapitalize="words"
                />
                {errors.fullName && (
                  <Text style={styles.errorText}>{errors.fullName}</Text>
                )}
              </View>

              <View>
                <AnimatedInput
                  label="WORK EMAIL"
                  placeholder="john.doe@company.com"
                  value={formData.workEmail}
                  onChangeText={(value) => handleInputChange('workEmail', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.workEmail && (
                  <Text style={styles.errorText}>{errors.workEmail}</Text>
                )}
              </View>

              <View>
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
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              <View>
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
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>ROLE</Text>
                <Dropdown
                  options={roles}
                  selected={formData.role}
                  onSelect={(value) => handleInputChange('role', value)}
                  placeholder="Select your role"
                />
                {errors.role && (
                  <Text style={styles.errorText}>{errors.role}</Text>
                )}
              </View>

              {/* Company Name - Always visible */}
              <View>
                <AnimatedInput
                  label="COMPANY NAME"
                  placeholder="Enter company name"
                  value={formData.company}
                  onChangeText={(value) => handleInputChange('company', value)}
                  autoCapitalize="words"
                />
                {errors.company && (
                  <Text style={styles.errorText}>{errors.company}</Text>
                )}
              </View>

              {/* Position and Domain - Only show when role is "End User" */}
              {formData.role === 'End User' && (
                <>
                  <Animated.View 
                    entering={FadeInUp.delay(300).duration(400)}
                    style={styles.inputGroup}>
                    <Text style={styles.label}>POSITION</Text>
                    <Dropdown
                      options={positions}
                      selected={formData.position}
                      onSelect={(value) => handleInputChange('position', value)}
                      placeholder="Select position"
                    />
                    {errors.position && (
                      <Text style={styles.errorText}>{errors.position}</Text>
                    )}
                  </Animated.View>

                  <Animated.View 
                    entering={FadeInUp.delay(350).duration(400)}
                    style={styles.inputGroup}>
                    <Text style={styles.label}>DOMAIN</Text>
                    <Dropdown
                      options={domains}
                      selected={formData.domain}
                      onSelect={(value) => handleInputChange('domain', value)}
                      placeholder="Select domain"
                    />
                    {errors.domain && (
                      <Text style={styles.errorText}>{errors.domain}</Text>
                    )}
                  </Animated.View>
                </>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>LOCATION</Text>
                <Dropdown
                  options={locations}
                  selected={formData.location}
                  onSelect={(value) => handleInputChange('location', value)}
                  placeholder="Select city/office"
                />
                {errors.location && (
                  <Text style={styles.errorText}>{errors.location}</Text>
                )}
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

      {/* Success Popup */}
      <SuccessPopup
        visible={showSuccessPopup}
        message="Registration Successful"
        onClose={handleClosePopup}
        autoCloseDelay={2000}
      />
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
  errorText: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.danger,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});

export default SignUpScreen;
