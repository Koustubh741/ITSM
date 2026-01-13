import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  FadeInDown,
} from 'react-native-reanimated';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing, BorderRadius } from '../constants/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const OnBoardingScreen2 = ({ onNext, onBack, onSkip }) => {
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const card1Opacity = useSharedValue(0);
  const card2Opacity = useSharedValue(0);
  const card3Opacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const card1TranslateY = useSharedValue(20);
  const card2TranslateY = useSharedValue(20);
  const card3TranslateY = useSharedValue(20);

  useEffect(() => {
    titleOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
    subtitleOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));

    card1Opacity.value = withDelay(600, withTiming(1, { duration: 500 }));
    card1TranslateY.value = withDelay(600, withTiming(0, { duration: 500 }));

    card2Opacity.value = withDelay(800, withTiming(1, { duration: 500 }));
    card2TranslateY.value = withDelay(800, withTiming(0, { duration: 500 }));

    card3Opacity.value = withDelay(1000, withTiming(1, { duration: 500 }));
    card3TranslateY.value = withDelay(1000, withTiming(0, { duration: 500 }));
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const card1Style = useAnimatedStyle(() => ({
    opacity: card1Opacity.value,
    transform: [{ translateY: card1TranslateY.value }],
  }));

  const card2Style = useAnimatedStyle(() => ({
    opacity: card2Opacity.value,
    transform: [{ translateY: card2TranslateY.value }],
  }));

  const card3Style = useAnimatedStyle(() => ({
    opacity: card3Opacity.value,
    transform: [{ translateY: card3TranslateY.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleNext = () => {
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    setTimeout(() => {
      if (onNext) onNext();
    }, 200);
  };

  const MagnifyingGlassIcon = () => (
    <View style={styles.iconSvg}>
      <View style={styles.magnifyingGlass}>
        <View style={styles.magnifyingGlassCircle} />
        <View style={styles.magnifyingGlassHandle} />
        <View style={styles.magnifyingGlassCheckmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      </View>
    </View>
  );

  const CalendarIcon = () => (
    <View style={styles.iconSvg}>
      <View style={styles.calendar}>
        <View style={styles.calendarHeader} />
        <View style={styles.calendarGrid}>
          {[...Array(9)].map((_, i) => (
            <View key={i} style={styles.calendarDot} />
          ))}
        </View>
      </View>
    </View>
  );

  const LightbulbIcon = () => (
    <View style={styles.iconSvg}>
      <View style={styles.lightbulb}>
        <View style={styles.lightbulbBody} />
        <View style={styles.lightbulbBase} />
      </View>
    </View>
  );

  const features = [
    {
      id: 1,
      IconComponent: MagnifyingGlassIcon,
      iconColor: '#FFE5D9',
      title: 'Asset Tracking',
      description: 'Find and log hardware instantly with powerful search and scanning.',
    },
    {
      id: 2,
      IconComponent: CalendarIcon,
      iconColor: '#FFE5D9',
      title: 'Smart Renewals',
      description: 'Automated alerts ensure you never miss a critical license expiry date.',
    },
    {
      id: 3,
      IconComponent: LightbulbIcon,
      iconColor: '#FFE5D9',
      title: 'AI Insights',
      description: 'Optimize your IT spend with data-driven, intelligent recommendations.',
    },
  ];

  const FeatureCard = ({ feature, animatedStyle }) => {
    const cardScale = useSharedValue(1);

    const handlePressIn = () => {
      cardScale.value = withTiming(0.98, { duration: 100 });
    };

    const handlePressOut = () => {
      cardScale.value = withTiming(1, { duration: 100 });
    };

    const cardPressStyle = useAnimatedStyle(() => ({
      transform: [{ scale: cardScale.value }],
    }));

    const IconComponent = feature.IconComponent;

    return (
      <Animated.View style={[animatedStyle, cardPressStyle]}>
        <TouchableOpacity
          style={styles.featureCard}
          activeOpacity={0.9}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}>
          <View style={[styles.iconContainer, { backgroundColor: feature.iconColor }]}>
            <IconComponent />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDescription}>{feature.description}</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Animated.Text style={[styles.title, titleStyle]}>
            <Text style={styles.titlePart1}>Manage IT smarter, </Text>
            <Text style={styles.titlePart2}>not harder.</Text>
          </Animated.Text>

          <Animated.Text style={[styles.subtitle, subtitleStyle]}>
            Streamline your workflow with powerful tools designed for modern IT teams.
          </Animated.Text>
        </View>

        <View style={styles.cardsContainer}>
          <FeatureCard feature={features[0]} animatedStyle={card1Style} />
          <FeatureCard feature={features[1]} animatedStyle={card2Style} />
          <FeatureCard feature={features[2]} animatedStyle={card3Style} />
        </View>
      </ScrollView>

      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <Animated.View style={buttonStyle}>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
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
    backgroundColor: '#FEFCFB',
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
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },
  titleSection: {
    marginBottom: Spacing.xxl,
  },
  title: {
    ...Typography.h1,
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.md,
    lineHeight: 28,
  },
  titlePart1: {
    color: Colors.text,
  },
  titlePart2: {
    color: '#FF8C42',
  },
  subtitle: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  cardsContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  iconSvg: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  magnifyingGlass: {
    width: 28,
    height: 28,
    position: 'relative',
  },
  magnifyingGlassCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2.5,
    borderColor: '#FF8C42',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  magnifyingGlassHandle: {
    width: 2.5,
    height: 10,
    backgroundColor: '#FF8C42',
    position: 'absolute',
    bottom: 2,
    right: 2,
    transform: [{ rotate: '45deg' }],
  },
  magnifyingGlassCheckmark: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 10,
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FF8C42',
    fontSize: 10,
    fontWeight: '700',
  },
  calendar: {
    width: 28,
    height: 28,
    position: 'relative',
  },
  calendarHeader: {
    width: 28,
    height: 6,
    backgroundColor: '#FF8C42',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    marginBottom: 2,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 24,
    height: 20,
    gap: 2,
    alignSelf: 'center',
  },
  calendarDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FF8C42',
  },
  lightbulb: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  lightbulbBody: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF8C42',
    position: 'relative',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  lightbulbBase: {
    width: 10,
    height: 2,
    backgroundColor: '#FF8C42',
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    borderRadius: 1,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...Typography.h3,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  featureDescription: {
    ...Typography.body,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  bottomNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.md,
    backgroundColor: '#FEFCFB',
  },
  backButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  backButtonText: {
    ...Typography.body,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    minWidth: 120,
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
    paddingHorizontal: Spacing.lg,
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

export default OnBoardingScreen2;
