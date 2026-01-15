import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';

const SegmentedControl = ({ options, selected, onSelect }) => {
  const [containerWidth, setContainerWidth] = React.useState(0);
  const translateX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  useEffect(() => {
    if (containerWidth > 0) {
      const selectedIndex = options.indexOf(selected);
      const segmentWidth = containerWidth / options.length;
      translateX.value = withSpring(selectedIndex * segmentWidth, {
        damping: 15,
        stiffness: 150,
      });
      indicatorWidth.value = withSpring(segmentWidth, {
        damping: 15,
        stiffness: 150,
      });
    }
  }, [selected, containerWidth, options.length]);

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      width: indicatorWidth.value,
    };
  });

  const handleLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    if (width > 0 && width !== containerWidth) {
      setContainerWidth(width);
      const segmentWidth = width / options.length;
      indicatorWidth.value = segmentWidth;
    }
  };

  return (
    <View
      style={styles.container}
      onLayout={handleLayout}>
      <View style={styles.segments}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={option}
            style={[styles.segment, { flex: 1 }]}
            onPress={() => onSelect(option)}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.segmentText,
                selected === option && styles.segmentTextActive,
              ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Animated.View style={[styles.indicator, indicatorStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.grayLight,
    borderRadius: BorderRadius.md,
    padding: 4,
    position: 'relative',
    marginBottom: Spacing.md,
  },
  segments: {
    flexDirection: 'row',
    position: 'relative',
    zIndex: 2,
  },
  segment: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '500',
    fontSize: 13,
  },
  segmentTextActive: {
    color: Colors.text,
    fontWeight: '600',
  },
  indicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.sm,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 1,
  },
});

export default SegmentedControl;
