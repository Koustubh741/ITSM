import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
// BlurView is optional - using gradient overlay instead for glass effect
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing, BorderRadius } from '../constants/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SuccessPopup = ({ visible, message, onClose, autoCloseDelay = 2000 }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const checkmarkScale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
      opacity.value = withTiming(1, { duration: 300 });
      checkmarkScale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1.2, { duration: 200 }),
        withSpring(1, { damping: 8, stiffness: 100 })
      );
    } else {
      scale.value = withTiming(0, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  useEffect(() => {
    if (visible && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [visible, autoCloseDelay, onClose]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const popupStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
  }));

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}>
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(200)}
        style={[styles.overlay, containerStyle]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View style={[styles.popupContainer, popupStyle]}>
          {/* Glassy Background with Blur */}
          <View style={styles.glassContainer}>
            {/* Gradient Overlay for Glass Effect */}
            <View style={styles.gradientOverlay} />
            
            {/* Content */}
            <View style={styles.content}>
              {/* Success Checkmark */}
              <Animated.View style={[styles.checkmarkContainer, checkmarkStyle]}>
                <View style={styles.checkmarkCircle}>
                  <Text style={styles.checkmark}>✓</Text>
                </View>
              </Animated.View>

              {/* Message */}
              <Text style={styles.message}>{message || 'Registration Successful'}</Text>
              <Text style={styles.subMessage}>
                Your account has been created successfully
              </Text>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 400,
  },
  glassContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
    // Glass effect shadows
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    height: '40%',
  },
  content: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkContainer: {
    marginBottom: Spacing.lg,
  },
  checkmarkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    // Glossy effect
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  checkmark: {
    fontSize: 48,
    color: Colors.white,
    fontWeight: 'bold',
  },
  message: {
    ...Typography.h2,
    fontSize: 24,
    fontWeight: '700',
    color: Colors.warmText,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subMessage: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.warmTextSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SuccessPopup;
