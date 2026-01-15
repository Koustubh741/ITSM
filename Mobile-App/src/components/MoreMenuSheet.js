import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = 320;
const DRAG_THRESHOLD = 50;

const MoreMenuSheet = ({ visible, onClose, onMenuItemPress }) => {
  // Calculate sheet dimensions based on bottom navigation layout
  const BOTTOM_NAV_PADDING = Spacing.sm * 2; // Horizontal padding from BottomNavigation (16px)
  const TAB_WIDTH = (SCREEN_WIDTH - BOTTOM_NAV_PADDING) / 8; // Width of each tab
  const SHEET_WIDTH = TAB_WIDTH * 6; // Width for 2 tabs (Renewals + More)
  const SHEET_LEFT = TAB_WIDTH * 2.5; // Start position after first 2 tabs
  const BOTTOM_NAV_HEIGHT = 60; // Approximate height of bottom navigation
  
  const translateY = useSharedValue(SHEET_HEIGHT); // Start hidden (pushed down by its height)
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      // Position sheet above bottom navigation
      // Since we use bottom: BOTTOM_NAV_HEIGHT in styles, translateY should be relative to that
      translateY.value = withTiming(0, {
        duration: 300,
      });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withTiming(SHEET_HEIGHT, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible]);

  const startY = React.useRef(0);

  const panResponder = React.useRef(
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
        // Allow dragging down (positive dy)
        if (newTranslateY >= 0 && newTranslateY <= SHEET_HEIGHT) {
          translateY.value = newTranslateY;
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const velocity = gestureState.vy;
        if (gestureState.dy > DRAG_THRESHOLD || velocity > 0.5) {
          translateY.value = withTiming(SHEET_HEIGHT, { duration: 300 });
          opacity.value = withTiming(0, { duration: 300 }, () => {
            runOnJS(onClose)();
          });
        } else {
          translateY.value = withTiming(0, {
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
    translateY.value = withTiming(SHEET_HEIGHT, { duration: 300 });
    opacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(onClose)();
    });
  };

  const handleClose = () => {
    translateY.value = withTiming(SHEET_HEIGHT, { duration: 300 });
    opacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(onClose)();
    });
  };

  const menuItems = [
    { id: 'enterprise', label: 'Enterprise', icon: '🏢', iconColor: '#4A90E2' },
    { id: 'procurement', label: 'Procurement', icon: '🛒', iconColor: '#50C878' },
    { id: 'disposal', label: 'Disposals', icon: '🗑️', iconColor: '#FF6B6B' },
    { id: 'settings', label: 'Settings', icon: '⚙️', iconColor: '#9B59B6' },
  ];

  const handleMenuItemPress = (itemId) => {
    handleClose();
    if (onMenuItemPress) {
      setTimeout(() => {
        onMenuItemPress(itemId);
      }, 300);
    }
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
        <Animated.View 
          style={[
            styles.sheet, 
            sheetStyle, 
            { 
              width: SHEET_WIDTH, 
              left: SHEET_LEFT,
            }
          ]}>
          <View {...panResponder.panHandlers}>
            <View style={styles.dragHandleContainer}>
              <View style={styles.dragHandle} />
            </View>
            <View style={styles.header}>
              <Text style={styles.title}>More Options</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handleMenuItemPress(item.id)}
                activeOpacity={0.7}>
                <View style={[styles.menuItemIcon, { backgroundColor: item.iconColor + '15' }]}>
                  <Text style={styles.menuItemIconText}>{item.icon}</Text>
                </View>
                <Text style={styles.menuItemLabel}>{item.label}</Text>
                <Text style={styles.menuItemArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    height: SHEET_HEIGHT,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    position: 'absolute',
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
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.border,
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
  },
  contentContainer: {
    paddingTop: Spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuItemIconText: {
    fontSize: 20,
  },
  menuItemLabel: {
    ...Typography.h3,
    color: Colors.text,
    flex: 1,
  },
  menuItemArrow: {
    fontSize: 24,
    color: Colors.textSecondary,
    fontWeight: '300',
  },
});

export default MoreMenuSheet;
