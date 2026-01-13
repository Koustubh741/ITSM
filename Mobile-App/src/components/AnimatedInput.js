import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';

const AnimatedInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  style,
  rightIcon,
  onRightIconPress,
  editable = true,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const scale = useSharedValue(1);
  const borderColor = useSharedValue(Colors.warmBorder);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      borderColor: borderColor.value,
    };
  });

  const handleFocus = () => {
    setIsFocused(true);
    scale.value = withSpring(1.02, {
      damping: 15,
      stiffness: 200,
    });
    borderColor.value = withTiming(Colors.warmPrimary, { duration: 200 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 200,
    });
    borderColor.value = withTiming(Colors.warmBorder, { duration: 200 });
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View style={[styles.inputContainer, animatedContainerStyle]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.warmTextSecondary}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={editable}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconContainer}
            activeOpacity={0.7}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    ...Typography.bodySmall,
    color: Colors.warmText,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warmInputBackground,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.warmBorder,
    paddingHorizontal: Spacing.md,
    minHeight: 50,
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.warmText,
    paddingVertical: Spacing.sm,
  },
  rightIconContainer: {
    padding: Spacing.xs,
  },
});

export default AnimatedInput;
