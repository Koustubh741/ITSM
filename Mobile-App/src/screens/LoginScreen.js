import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInUp,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnimatedInput from '../components/AnimatedInput';
import InfoPopup from '../components/InfoPopup';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';

// API Base URL - Same as SignUpScreen
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.0.25:8000'  // Physical device - your laptop IP
  : 'https://your-production-api.com';  // Production URL

const LoginScreen = ({ navigation, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [popupConfig, setPopupConfig] = useState({
    type: 'info',
    title: '',
    message: '',
  });

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } 

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      console.log('Attempting login for:', email);
      console.log('API URL:', `${API_BASE_URL}/auth/login`);

      // Create form data for OAuth2PasswordRequestForm
      const formData = new URLSearchParams();
      formData.append('username', email.trim());
      formData.append('password', password);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      console.log('Response status:', response.status);

      // Parse response
      let data;
      try {
        const text = await response.text();
        console.log('Response text:', text);
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Invalid response from server.');
      }

      if (!response.ok) {
        // Check if account is not verified
        const errorMessage = data.detail || 'Login failed';
        console.log('Login error:', errorMessage);

        if (errorMessage.includes('not active') || errorMessage.includes('not verified')) {
          // Show popup for unverified account
          setLoading(false);
          setPopupConfig({
            type: 'warning',
            title: 'Account Not Verified',
            message: 'Your account is not verified by the administrator yet. Please contact your administrator for activation.',
          });
          setShowInfoPopup(true);
          return;
        }

        throw new Error(errorMessage);
      }

      console.log('Login successful:', data);

      // Extract user info
      const user = data.user;
      const accessToken = data.access_token;

      // Store user data (you might want to use AsyncStorage or context)
      // For now, we'll pass it through navigation params

      setLoading(false);

      // Navigate based on role and position
      navigateBasedOnRole(user);

    } catch (error) {
      setLoading(false);
      console.error('Login error:', error);

      // Show error popup or alert
      if (error.message.includes('Network request failed')) {
        Alert.alert(
          'Connection Error',
          `Cannot connect to server.\n\nPlease check:\n- Backend is running\n- IP address is correct: 192.168.0.25\n- Both devices on same Wi-Fi`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Login Failed',
          error.message || 'Unable to login. Please check your credentials.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const navigateBasedOnRole = (user) => {
    const role = user.role;
    const position = user.position;

    console.log('Navigating based on role:', role, 'position:', position);

    // Call onLoginSuccess with user data - App.js handles the navigation
    if (onLoginSuccess) {
      onLoginSuccess(user);
    }
  };

  const handleClosePopup = () => {
    setShowInfoPopup(false);
  };

  const navigateToSignup = () => {
    if (navigation) {
      navigation.navigate('signup');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeInUp.delay(100).duration(600)}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoIcon}>🖥️</Text>
              </View>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to continue</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(600)}>
            <View style={styles.form}>
              <AnimatedInput
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) {
                    setErrors({ ...errors, email: null });
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}

              <AnimatedInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) {
                    setErrors({ ...errors, password: null });
                  }
                }}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                rightIcon={<Text style={styles.eyeIcon}>👁️</Text>}
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => {
                  Alert.alert('Forgot Password', 'Feature coming soon!');
                }}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <AnimatedButton
                title={loading ? 'Signing In...' : 'Log In'}
                onPress={handleLogin}
                disabled={loading}
                style={styles.loginButton}
              />

              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity onPress={navigateToSignup}>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Info Popup for unverified account */}
      <InfoPopup
        visible={showInfoPopup}
        type={popupConfig.type}
        title={popupConfig.title}
        message={popupConfig.message}
        onClose={handleClosePopup}
        showCloseButton={true}
      />
    </SafeAreaView>
  );
};

const AnimatedButton = ({ title, onPress, disabled, style }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.6 : 1,
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.95, {
        damping: 15,
        stiffness: 200,
      });
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 200,
      });
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={1}>
      <Animated.View style={[styles.button, style, animatedStyle]}>
        <View style={styles.buttonGradientBase} />
        <View style={styles.buttonGradientTop} />
        <Text style={styles.buttonText}>{title}</Text>
      </Animated.View>
    </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.orangeLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  logoIcon: {
    fontSize: 40,
  },
  title: {
    ...Typography.h1,
    fontSize: 22,
    color: Colors.warmText,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.warmTextSecondary,
    textAlign: 'center',
  },
  form: {
    marginTop: Spacing.lg,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.danger,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
  },
  forgotPasswordText: {
    ...Typography.bodySmall,
    color: Colors.orange,
    fontWeight: '500',
  },
  button: {
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: Colors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradientBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.orange,
  },
  buttonGradientTop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFB380',
    opacity: 0.7,
    borderTopLeftRadius: BorderRadius.md,
    borderTopRightRadius: BorderRadius.md,
    height: '45%',
  },
  loginButton: {
    marginTop: Spacing.sm,
  },
  buttonText: {
    ...Typography.body,
    fontSize: 15,
    color: Colors.white,
    fontWeight: '600',
    zIndex: 1,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  signupText: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.warmTextSecondary,
  },
  signupLink: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.orange,
    fontWeight: '600',
  },
  eyeIcon: {
    fontSize: 18,
  },
});

export default LoginScreen;
