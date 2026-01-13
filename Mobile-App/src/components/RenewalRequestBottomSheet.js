import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  PanResponder,
  Modal,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAX_HEIGHT = SCREEN_HEIGHT * 0.9;
const INITIAL_HEIGHT = SCREEN_HEIGHT * 0.7;
const DRAG_THRESHOLD = 50;

const RenewalRequestBottomSheet = ({ visible, onClose, onSubmit }) => {
  const [reason, setReason] = useState('');
  const [urgency, setUrgency] = useState('Low');
  const [estimatedCost, setEstimatedCost] = useState('0.00');
  
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);
  const startY = useRef(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(SCREEN_HEIGHT - INITIAL_HEIGHT, {
        duration: 300,
      });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
      // Reset form when closing
      if (!visible) {
        setReason('');
        setUrgency('Low');
        setEstimatedCost('0.00');
      }
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: (evt) => {
        startY.current = translateY.value;
      },
      onPanResponderMove: (evt, gestureState) => {
        const newTranslateY = startY.current + gestureState.dy;
        const minTranslateY = SCREEN_HEIGHT - MAX_HEIGHT;
        const maxTranslateY = SCREEN_HEIGHT;
        if (newTranslateY >= minTranslateY && newTranslateY <= maxTranslateY) {
          translateY.value = newTranslateY;
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const velocity = gestureState.vy;
        if (gestureState.dy > DRAG_THRESHOLD || velocity > 0.5) {
          translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
          opacity.value = withTiming(0, { duration: 300 }, () => {
            runOnJS(onClose)();
          });
        } else if (gestureState.dy < -DRAG_THRESHOLD || velocity < -0.5) {
          translateY.value = withTiming(SCREEN_HEIGHT - MAX_HEIGHT, {
            duration: 300,
          });
        } else {
          translateY.value = withTiming(SCREEN_HEIGHT - INITIAL_HEIGHT, {
            duration: 300,
          });
        }
      },
    })
  ).current;

  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const sheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const handleBackdropPress = () => {
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
    opacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(onClose)();
    });
  };

  const handleClose = () => {
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
    opacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(onClose)();
    });
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit({
        reason,
        urgency,
        estimatedCost: parseFloat(estimatedCost) || 0,
      });
    }
    handleClose();
  };

  const formatCurrency = (value) => {
    const numericValue = value.replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    return numericValue;
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}>
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleBackdropPress}
          />
        </Animated.View>
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View {...panResponder.panHandlers}>
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>
            <View style={styles.header}>
              <Text style={styles.title}>Renewal Request</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            
            <View style={styles.section}>
              <Text style={styles.label}>Reason for Request</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Briefly explain why you need this renewal..."
                placeholderTextColor={Colors.warmTextSecondary}
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Urgency Level</Text>
              <View style={styles.urgencyContainer}>
                <UrgencyButton
                  label="Low"
                  icon="🔄"
                  isSelected={urgency === 'Low'}
                  onPress={() => setUrgency('Low')}
                  color={Colors.success}
                />
                <UrgencyButton
                  label="Medium"
                  icon="⚠️"
                  isSelected={urgency === 'Medium'}
                  onPress={() => setUrgency('Medium')}
                  color={Colors.warning}
                />
                <UrgencyButton
                  label="High"
                  icon="❗"
                  isSelected={urgency === 'High'}
                  onPress={() => setUrgency('High')}
                  color={Colors.danger}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Estimated Cost</Text>
              <View style={styles.costContainer}>
                <View style={styles.costInputContainer}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    style={styles.costInput}
                    placeholder="0.00"
                    placeholderTextColor={Colors.warmTextSecondary}
                    value={estimatedCost}
                    onChangeText={(text) => setEstimatedCost(formatCurrency(text))}
                    keyboardType="decimal-pad"
                  />
                </View>
                <Text style={styles.currencyLabel}>USD</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              activeOpacity={0.8}>
              <Text style={styles.submitButtonText}>Send Request to Department</Text>
              <Text style={styles.arrowIcon}>→</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const UrgencyButton = ({ label, icon, isSelected, onPress, color }) => {
  return (
    <TouchableOpacity
      style={[
        styles.urgencyButton,
        isSelected && styles.urgencyButtonSelected,
        isSelected && { borderColor: color },
      ]}
      onPress={onPress}
      activeOpacity={0.7}>
      <Text style={styles.urgencyIcon}>{icon}</Text>
      <Text
        style={[
          styles.urgencyLabel,
          isSelected && styles.urgencyLabelSelected,
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: Colors.warmCardBackground,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    height: MAX_HEIGHT,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  dragHandleContainer: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.warmBorder,
    borderRadius: BorderRadius.round,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.warmBorder,
  },
  title: {
    ...Typography.h2,
    color: Colors.warmText,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.warmInputBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 18,
    color: Colors.warmText,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.h3,
    color: Colors.warmText,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  textArea: {
    backgroundColor: Colors.warmInputBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minHeight: 100,
    ...Typography.body,
    color: Colors.warmText,
    borderWidth: 1,
    borderColor: Colors.warmBorder,
    ...Platform.select({
      ios: {
        textAlignVertical: 'top',
      },
      android: {
        textAlignVertical: 'top',
      },
    }),
  },
  urgencyContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  urgencyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.warmInputBackground,
    borderWidth: 1,
    borderColor: Colors.warmBorder,
    gap: Spacing.xs,
  },
  urgencyButtonSelected: {
    backgroundColor: Colors.warmCardBackground,
    borderWidth: 2,
  },
  urgencyIcon: {
    fontSize: 16,
  },
  urgencyLabel: {
    ...Typography.bodySmall,
    color: Colors.warmText,
    fontWeight: '500',
  },
  urgencyLabelSelected: {
    fontWeight: '600',
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  costInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warmInputBackground,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.warmBorder,
  },
  currencySymbol: {
    ...Typography.body,
    color: Colors.warmText,
    fontWeight: '500',
    marginRight: Spacing.xs,
  },
  costInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.warmText,
    paddingVertical: Spacing.sm,
  },
  currencyLabel: {
    ...Typography.body,
    color: Colors.warmTextSecondary,
    fontWeight: '500',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.orange,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  submitButtonText: {
    ...Typography.body,
    color: Colors.white,
    fontWeight: '600',
  },
  arrowIcon: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: '600',
  },
});

export default RenewalRequestBottomSheet;
