import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const OnBoardingScreen1 = ({ onNext, onSkip }) => {
  const illustrationScale = useSharedValue(0.8);
  const illustrationOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const descriptionOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const phoneTranslateX = useSharedValue(-20);
  const browserTranslateX = useSharedValue(20);

  useEffect(() => {
    illustrationOpacity.value = withTiming(1, { duration: 600 });
    illustrationScale.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.back(1.1)),
    });

    phoneTranslateX.value = withDelay(300, withTiming(0, { duration: 500 }));
    browserTranslateX.value = withDelay(400, withTiming(0, { duration: 500 }));

    titleOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
    descriptionOpacity.value = withDelay(800, withTiming(1, { duration: 500 }));

    setTimeout(() => {
      illustrationScale.value = withRepeat(
        withSequence(
          withTiming(1.02, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }, 1000);
  }, []);

  const illustrationStyle = useAnimatedStyle(() => ({
    opacity: illustrationOpacity.value,
    transform: [{ scale: illustrationScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const descriptionStyle = useAnimatedStyle(() => ({
    opacity: descriptionOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const phoneStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: phoneTranslateX.value }],
  }));

  const browserStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: browserTranslateX.value }],
  }));

  const handleButtonPress = () => {
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    setTimeout(() => {
      if (onNext) onNext();
    }, 200);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Animated.View style={[styles.illustrationContainer, illustrationStyle]}>
          <View style={styles.circleBackground}>
            <Animated.View style={[styles.phoneContainer, phoneStyle]}>
              <View style={styles.phone}>
                <View style={styles.phoneScreen}>
                  <View style={styles.checkmarkContainer}>
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.phoneHomeButton} />
              </View>
            </Animated.View>

            <Animated.View style={[styles.browserContainer, browserStyle]}>
              <View style={styles.browserWindow}>
                <View style={styles.browserControls}>
                  <View style={styles.browserDot} />
                  <View style={styles.browserDot} />
                </View>
                <View style={styles.browserContent}>
                  <View style={styles.textLine} />
                  <View style={[styles.textLine, styles.textLineShort]} />
                  <View style={styles.textLine} />
                  <View style={styles.chartContainer}>
                    <View style={[styles.bar, styles.barGreen]} />
                    <View style={[styles.bar, styles.barTeal]} />
                    <View style={[styles.bar, styles.barBlue]} />
                  </View>
                  <View style={styles.shieldIconContainer}>
                    <View style={styles.shieldIcon}>
                      <Text style={styles.shieldCheckmark}>✓</Text>
                    </View>
                  </View>
                </View>
              </View>
            </Animated.View>
          </View>
        </Animated.View>

        <Animated.Text style={[styles.title, titleStyle]}>
          Simplify IT Management
        </Animated.Text>

        <Animated.Text style={[styles.description, descriptionStyle]}>
          Gain total visibility over your hardware and software. Track lifecycles, assign assets, and stay audit-ready in just a few taps.
        </Animated.Text>
      </View>

      <View style={styles.buttonContainer}>
        <Animated.View style={buttonStyle}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleButtonPress}
            activeOpacity={0.9}>
            <View style={styles.buttonGradientBase} />
            <View style={styles.buttonGradientTop} />
            <View style={styles.buttonContent}>
              <Text style={styles.nextButtonText}>Next</Text>
              <Text style={styles.nextButtonArrow}>→</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    right: Spacing.lg,
    zIndex: 10,
    padding: Spacing.xs,
  },
  skipText: {
    ...Typography.bodySmall,
    fontSize: 13,
    fontWeight: '600',
    color: '#544E47',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
  illustrationContainer: {
    marginBottom: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBackground: {
    width: Math.min(SCREEN_WIDTH * 0.65, 280),
    height: Math.min(SCREEN_WIDTH * 0.65, 280),
    borderRadius: Math.min(SCREEN_WIDTH * 0.65, 280) / 2,
    backgroundColor: '#FBEBE0',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  phoneContainer: {
    position: 'absolute',
    left: -Math.min(SCREEN_WIDTH * 0.12, 50),
  },
  phone: {
    width: 50,
    height: 85,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#CFD8DC',
    backgroundColor: Colors.white,
    padding: 4,
    position: 'relative',
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#2ecc71',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  phoneHomeButton: {
    width: 20,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CFD8DC',
    alignSelf: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  browserContainer: {
    position: 'absolute',
    right: -Math.min(SCREEN_WIDTH * 0.12, 50),
  },
  browserWindow: {
    width: 70,
    height: 80,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CFD8DC',
    backgroundColor: Colors.white,
    overflow: 'hidden',
  },
  browserControls: {
    flexDirection: 'row',
    padding: 6,
    gap: 4,
  },
  browserDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#90A4AE',
  },
  browserContent: {
    flex: 1,
    padding: 6,
    gap: 4,
  },
  textLine: {
    height: 3,
    backgroundColor: '#CFD8DC',
    borderRadius: 1.5,
    width: '100%',
  },
  textLineShort: {
    width: '60%',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
    marginTop: 4,
    height: 20,
  },
  bar: {
    width: 6,
    borderRadius: 3,
  },
  barGreen: {
    height: 16,
    backgroundColor: '#2ecc71',
  },
  barTeal: {
    height: 12,
    backgroundColor: '#1abc9c',
  },
  barBlue: {
    height: 8,
    backgroundColor: '#3498db',
  },
  shieldIconContainer: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  shieldIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shieldCheckmark: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    ...Typography.h1,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  description: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: Spacing.xl,
  },
  buttonContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
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
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    height: '45%',
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    zIndex: 1,
  },
  nextButtonText: {
    ...Typography.h3,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  nextButtonArrow: {
    ...Typography.h3,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
});

export default OnBoardingScreen1;
