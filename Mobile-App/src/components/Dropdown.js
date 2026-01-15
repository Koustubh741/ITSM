import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  FadeInDown,
  FadeOut,
} from 'react-native-reanimated';
import { Colors } from '../constants/colors';
import { Spacing, BorderRadius } from '../constants/spacing';
import { Typography } from '../constants/typography';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.View;

const Dropdown = ({ options, selected, onSelect, style, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const scale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePress = () => {
    setIsOpen(true);
  };

  const handleSelect = (option) => {
    onSelect(option);
    setIsOpen(false);
    scale.value = withTiming(0.95, { duration: 100 }, () => {
      scale.value = withTiming(1, { duration: 100 });
    });
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <View style={[styles.container, style]}>
      <AnimatedTouchable
        style={[styles.button, animatedButtonStyle]}
        onPress={handlePress}
        activeOpacity={0.8}>
        <Text style={styles.buttonText}>
          {selected || placeholder || 'Select...'}
        </Text>
        <Text style={styles.chevron}>{isOpen ? '▲' : '▼'}</Text>
      </AnimatedTouchable>

      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={handleClose}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleClose}>
          <AnimatedView
            entering={FadeInDown.duration(200)}
            exiting={FadeOut.duration(150)}
            style={styles.modalContent}>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    selected === item && styles.optionSelected,
                  ]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}>
                  <Text
                    style={[
                      styles.optionText,
                      selected === item && styles.optionTextSelected,
                    ]}>
                    {item}
                  </Text>
                  {selected === item && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </AnimatedView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.warmInputBackground,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.warmBorder,
    minHeight: 44,
  },
  buttonText: {
    ...Typography.body,
    color: Colors.warmText,
    flex: 1,
  },
  chevron: {
    fontSize: 12,
    color: Colors.warmTextSecondary,
    marginLeft: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.warmCardBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    width: '80%',
    maxHeight: '60%',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  optionSelected: {
    backgroundColor: Colors.orangeLight,
  },
  optionText: {
    ...Typography.body,
    color: Colors.warmText,
  },
  optionTextSelected: {
    color: Colors.orangeDark,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: Colors.orangeDark,
    fontWeight: '600',
  },
});

export default Dropdown;
