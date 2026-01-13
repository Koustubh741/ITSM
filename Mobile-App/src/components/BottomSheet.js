import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  Modal,
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
const MIN_HEIGHT = 100;
const INITIAL_HEIGHT = SCREEN_HEIGHT * 0.4;
const MAX_HEIGHT = SCREEN_HEIGHT * 0.9;
const DRAG_THRESHOLD = 50;

const BottomSheet = ({ visible, onClose, children, title }) => {
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
        const currentHeight = SCREEN_HEIGHT - translateY.value;
        
        // Determine target position based on drag distance and velocity
        if (gestureState.dy > DRAG_THRESHOLD || velocity > 0.5) {
          // Close the sheet
          translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
          opacity.value = withTiming(0, { duration: 300 }, () => {
            runOnJS(onClose)();
          });
        } else if (gestureState.dy < -DRAG_THRESHOLD || velocity < -0.5) {
          // Expand to max height
          translateY.value = withTiming(SCREEN_HEIGHT - MAX_HEIGHT, {
            duration: 300,
          });
        } else {
          // Snap to nearest position
          if (currentHeight < (MIN_HEIGHT + INITIAL_HEIGHT) / 2) {
            // Snap to min height (close)
            translateY.value = withTiming(SCREEN_HEIGHT, {
              duration: 300,
            });
            opacity.value = withTiming(0, { duration: 300 }, () => {
              runOnJS(onClose)();
            });
          } else if (currentHeight < (INITIAL_HEIGHT + MAX_HEIGHT) / 2) {
            // Snap to initial height
            translateY.value = withTiming(SCREEN_HEIGHT - INITIAL_HEIGHT, {
              duration: 300,
            });
          } else {
            // Snap to max height
            translateY.value = withTiming(SCREEN_HEIGHT - MAX_HEIGHT, {
              duration: 300,
            });
          }
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
            {title && (
              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
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
    backgroundColor: Colors.white,
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
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.round,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.grayLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 18,
    color: Colors.text,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
});

export default BottomSheet;
