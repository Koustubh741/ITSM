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
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing, BorderRadius } from '../constants/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Type can be: 'success', 'error', 'warning', 'info'
const InfoPopup = ({ 
  visible, 
  type = 'info', 
  title, 
  message, 
  onClose, 
  autoCloseDelay = 0,
  showCloseButton = true,
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const iconScale = useSharedValue(0);

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { icon: '✓', color: Colors.success, bgColor: 'rgba(52, 199, 89, 0.15)' };
      case 'error':
        return { icon: '✕', color: Colors.danger, bgColor: 'rgba(255, 59, 48, 0.15)' };
      case 'warning':
        return { icon: '⚠', color: Colors.warning, bgColor: 'rgba(255, 149, 0, 0.15)' };
      case 'info':
      default:
        return { icon: 'ℹ', color: Colors.primary, bgColor: 'rgba(0, 122, 255, 0.15)' };
    }
  };

  const { icon, color, bgColor } = getIconAndColor();

  useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
      opacity.value = withTiming(1, { duration: 300 });
      iconScale.value = withSequence(
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

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
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
          {/* Glassy Background */}
          <View style={styles.glassContainer}>
            {/* Gradient Overlay for Glass Effect */}
            <View style={styles.gradientOverlay} />
            
            {/* Content */}
            <View style={styles.content}>
              {/* Icon */}
              <Animated.View style={[styles.iconContainer, iconAnimStyle]}>
                <View style={[styles.iconCircle, { backgroundColor: bgColor }]}>
                  <Text style={[styles.icon, { color }]}>{icon}</Text>
                </View>
              </Animated.View>

              {/* Title */}
              <Text style={styles.title}>{title || 'Notice'}</Text>
              
              {/* Message */}
              <Text style={styles.message}>{message}</Text>

              {/* Close Button */}
              {showCloseButton && (
                <TouchableOpacity 
                  style={[styles.closeButton, { backgroundColor: color }]}
                  onPress={onClose}
                  activeOpacity={0.8}>
                  <Text style={styles.closeButtonText}>OK</Text>
                </TouchableOpacity>
              )}
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    height: '40%',
  },
  content: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    // Glossy effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  icon: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  title: {
    ...Typography.h2,
    fontSize: 22,
    fontWeight: '700',
    color: Colors.warmText,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  message: {
    ...Typography.body,
    fontSize: 14,
    color: Colors.warmTextSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  closeButton: {
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.xl + Spacing.lg,
    borderRadius: BorderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  closeButtonText: {
    ...Typography.body,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
});

export default InfoPopup;
